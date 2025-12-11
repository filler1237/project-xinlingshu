// cloud/xinlixuejia/index.js

const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database(); // 初始化数据库

// --- 1. 结构化配置与常量管理 ---
const CONFIG = {
  API_URL: 'https://api.coze.cn/open_api/v2/chat',
  API_KEY: process.env.COZE_API_KEY,
  BOT_ID: '7579231261534093347',
  REQUEST_TIMEOUT: 60000,
  MAX_HISTORY_LENGTH: 10, // 最多保留最近 10 条历史
};

const MESSAGE_TYPES = {
  TOOL_RESPONSE: 'tool_response',
  ANSWER: 'answer',
};

// --- 重试配置 ---
const RETRY_CONFIG = {
  retries: 2, // 最多重试 2 次
  retryDelay: 1000, // 初始间隔 1s
};


// --- 2. 辅助函数：内容安全检测 ---
async function checkContentSafety(content, openid) {
  try {
    const result = await cloud.openapi.security.msgSecCheck({
      content: content,
      version: 2,
      scene: 2,
      openid: openid
    });
    // errCode为0表示通过，其他表示不通过或调用失败
    return result.errCode === 0;
  } catch (err) {
    if (err.errCode === 87014) {
      console.warn('[内容风控] 检测到敏感内容', content);
      return false; // 明确违规
    }
    // 其他错误（如调用超限），暂时放行，避免误伤业务
    console.error('[内容风控] 接口调用失败，默认放行', err);
    return true;
  }
}

// --- 3. 辅助函数：带重试的请求 ---
async function fetchCozeWithRetry(payload, retries = RETRY_CONFIG.retries) {
  try {
    const response = await axios.post(CONFIG.API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.API_KEY}`
      },
      timeout: CONFIG.REQUEST_TIMEOUT,
      responseType: 'json'
    });
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`[Coze 请求失败] 正在重试... 剩余次数: ${retries}`, error.message);
      await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay));
      return fetchCozeWithRetry(payload, retries - 1);
    }
    throw error;
  }
}

/**
 * 从 Coze 消息中提取图片
 */
function extractImageUrlFromToolResponse(messages) {
  try {
    const toolResponseMessage = messages.find(msg => msg.type === MESSAGE_TYPES.TOOL_RESPONSE);
    if (!toolResponseMessage) return null;

    const contentObj = typeof toolResponseMessage.content === 'string'
      ? JSON.parse(toolResponseMessage.content)
      : toolResponseMessage.content;

    const dataObj = typeof contentObj?.data === 'string'
      ? JSON.parse(contentObj.data)
      : contentObj?.data;

    return dataObj?.data?.image_urls?.[0] || null;

  } catch (e) {
    console.error("解析插件图片链接失败:", e);
    return null;
  }
}

// --- 新增：异步写日志函数 ---
async function logChat(data) {
  try {
    await db.collection('chat_logs').add({
      data: {
        ...data,
        createTime: db.serverDate()
      }
    });
  } catch (err) {
    console.error('[日志写入失败]', err);
    // 日志写入失败不应影响主流程
  }
}

// --- 新增：获取用户画像 ---
async function getUserProfile(openid) {
  try {
    const res = await db.collection('users').where({
      _openid: openid
    }).get();

    if (res.data.length > 0) {
      const u = res.data[0];
      // 优先取根目录的 nickName，其次是 userInfo 里的，最后兜底
      const nickName = u.nickName || (u.userInfo && u.userInfo.nickName) || '同学';
      const role = u.role === 'student' ? '学生' : (u.role === 'teacher' ? '老师' : '');
      const college = u.college || '';
      return { nickName, role, college };
    }
    return null;
  } catch (err) {
    console.error('[查用户库失败]', err);
    return null; // 查不到就降级处理
  }
}

/**
 * 云函数主入口
 */
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  let { query: userQuery, chat_history: chatHistory = [], user } = event;
  const userId = user || OPENID;
  const startTime = Date.now();

  // --- 输入校验与裁剪 ---
  if (!userQuery || typeof userQuery !== 'string') {
    return { code: 400, message: '请求内容不能为空' };
  }

  if (!CONFIG.API_KEY || !CONFIG.BOT_ID) {
    return { code: 500, message: '云函数配置缺失' };
  }

  // 裁剪 history，保留最近 N 条，减少 Token 消耗
  if (chatHistory.length > CONFIG.MAX_HISTORY_LENGTH) {
    chatHistory = chatHistory.slice(-CONFIG.MAX_HISTORY_LENGTH);
  }

  // 1. 先对用户输入做一次风控（可选，防止用户发送违规内容给 AI）
  // 这里暂时不做，主要防 AI 输出

  try {
    // 1. 并行执行：查用户画像 (New)
    // 为了不阻塞，这里其实是阻塞的 await，因为我们需要拿到 proflie 修改 query。
    // 但耗时很短 (通常 <50ms)
    const userProfile = await getUserProfile(OPENID);

    let finalQuery = userQuery;
    let systemHint = '';

    if (userProfile) {
      const { nickName, role, college } = userProfile;
      // 构造一段隐式的 System Prompt (使用 XML 标签包裹，让模型更好区分上下文)
      systemHint = `<user_profile>\nName: ${nickName}\nRole: ${role}\n${college ? `College: ${college}\n` : ''}</user_profile>\n[Instruction: Above is the user's profile. Reply to the user warmly based on this info, but DO NOT mention the profile data explicitly unless asked.]`;

      // 将 hint 拼接到 query 前面 (Coze 能看到)
      finalQuery = `${systemHint}\n\nUser Query:\n${userQuery}`;
      console.log('[画像注入]', systemHint);
    }

    console.log(`[请求Coze] User: ${userId}, Query(with hint): ${finalQuery}`);

    // 2. 发起请求（带重试）
    const response = await fetchCozeWithRetry({
      bot_id: CONFIG.BOT_ID,
      user: userId,
      query: finalQuery, // 使用注入后的 Query
      stream: false,
      chat_history: chatHistory,
    });

    console.log('[Coze响应成功]');
    const responseBody = response.data;

    if (responseBody.code !== 0) {
      console.error('[Coze业务错误]', responseBody);
      // 记录失败日志
      logChat({ userId, query: userQuery, error: responseBody, status: 'api_error' });
      return { code: responseBody.code, message: responseBody.msg || 'AI 思考遇到困难' };
    }

    const messages = responseBody.messages || [];
    const imageUrl = extractImageUrlFromToolResponse(messages);
    const assistantTextMessage = messages.find(msg => msg.type === MESSAGE_TYPES.ANSWER)?.content || '';

    let finalReply = '';
    if (imageUrl) {
      finalReply += `![生成的图片](${imageUrl})\n\n`;
    }
    finalReply += assistantTextMessage;

    if (!finalReply.trim()) {
      logChat({ userId, query: userQuery, status: 'empty_response' });
      return { code: 500, message: 'AI 没有回应' };
    }

    // 3. 对 AI 输出进行风控检测 (Crucial)
    // 只有文本才需要检测，图片暂时没法检测（需要 costly OCR）
    // 2. 并行执行：内容风控检测 + 日志写入
    // 注意：我们在写入日志前，不知道风控结果。
    // 为了数据纯净度，我们可以在风控通过后再写日志，或者先记录原始回复。
    // 策略：先做风控。

    const isSafe = await checkContentSafety(assistantTextMessage, OPENID);

    // 3. 写入日志 (记录完整信息，包括耗时)
    // 即使拦截了，我们后台也想知道AI到底说了啥违规的，所以 status 标记为 intercepted
    await logChat({
      userId,
      query: userQuery, // 记录 AI 的原始回复
      reply: finalReply,
      status: isSafe ? 'success' : 'intercepted',
      costTime: Date.now() - startTime,
      userProfile: userProfile // 顺便把当时的用户画像也记下来
    });

    if (!isSafe) {
      return {
        code: 0,
        reply: '我就不回答这个问题啦 \n(内容可能涉及敏感信息)'
      };
    }

    return {
      code: 0,
      message: 'success',
      reply: finalReply.trim(),
    };

  } catch (error) {
    console.error(`[系统异常]`, error);
    // 记录异常日志
    logChat({ userId, query: userQuery, error: error.message, status: 'system_error' });

    // 区分超时错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return { code: 504, message: '思考时间有点长，请重试' };
    }

    return { code: 500, message: '系统开小差了，请稍后重试' };
  }
};
