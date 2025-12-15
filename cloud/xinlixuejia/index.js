// cloud/xinlixuejia/index.js
// Coze API v3 对话云函数

const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// --- 配置 ---
const CONFIG = {
  API_HOST: 'https://api.coze.cn',
  API_KEY: process.env.COZE_API_KEY,
  BOT_ID: '7583917266450792474',
  POLL_INTERVAL: 1000,
  POLL_MAX_ATTEMPTS: 30,
  REQUEST_TIMEOUT: 10000,
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${CONFIG.API_KEY}`
});

// --- Coze API 封装 ---

/**
 * 发起对话
 * @param {string} userId - 用户ID
 * @param {string} query - 用户的纯净查询（用于知识库匹配）
 * @param {string|null} conversationId - 会话ID
 * @param {string|null} userProfileHint - 用户画像提示（可选，单独发送以避免影响知识库匹配）
 */
async function initiateChat(userId, query, conversationId = null, userProfileHint = null) {
  let url = `${CONFIG.API_HOST}/v3/chat`;
  if (conversationId) {
    url += `?conversation_id=${conversationId}`;
  }

  // 构建消息列表：先发用户画像（如果有），再发纯净的用户查询
  const messages = [];

  if (userProfileHint) {
    messages.push({
      role: 'user',
      content: userProfileHint,
      content_type: 'text'
    });
  }

  // 用户的纯净查询，知识库将基于这条消息进行匹配
  messages.push({
    role: 'user',
    content: query,
    content_type: 'text'
  });

  const payload = {
    bot_id: CONFIG.BOT_ID,
    user_id: userId,
    additional_messages: messages,
    stream: false,
    auto_save_history: true
  };

  console.log('[Coze URL]', url);

  const response = await axios.post(url, payload, {
    headers: getHeaders(),
    timeout: CONFIG.REQUEST_TIMEOUT
  });

  if (response.data.code !== 0) {
    throw new Error(`Initiate Chat Error: ${response.data.msg}`);
  }

  return response.data.data;
}

/**
 * 轮询对话状态
 */
async function pollChatStatus(chatId, conversationId) {
  const url = `${CONFIG.API_HOST}/v3/chat/retrieve`;

  for (let i = 0; i < CONFIG.POLL_MAX_ATTEMPTS; i++) {
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.POLL_INTERVAL));
    }

    const response = await axios.get(url, {
      params: { chat_id: chatId, conversation_id: conversationId },
      headers: getHeaders(),
      timeout: CONFIG.REQUEST_TIMEOUT
    });

    const status = response.data.data.status;
    console.log(`[Polling] Attempt ${i + 1}/${CONFIG.POLL_MAX_ATTEMPTS}, Status: ${status}`);

    if (status === 'completed') return true;
    if (status === 'failed' || status === 'canceled') {
      throw new Error(`Chat Failed: ${status}`);
    }
  }

  throw new Error('Chat Timeout');
}

/**
 * 获取消息列表
 */
async function fetchChatMessages(chatId, conversationId) {
  const url = `${CONFIG.API_HOST}/v3/chat/message/list`;
  const response = await axios.get(url, {
    params: { chat_id: chatId, conversation_id: conversationId },
    headers: getHeaders(),
    timeout: CONFIG.REQUEST_TIMEOUT
  });

  if (response.data.code !== 0) {
    throw new Error(`Fetch Messages Error: ${response.data.msg}`);
  }

  return response.data.data;
}

/**
 * 解析 AI 回复
 */
function parseV3Response(messageList, chatId, minCreateTime) {
  const answerMessages = messageList.filter(msg =>
    msg.role === 'assistant' &&
    msg.type === 'answer' &&
    msg.chat_id === chatId &&
    msg.created_at >= minCreateTime
  );

  if (answerMessages.length === 0) return null;

  return answerMessages.map(msg => msg.content).join('\n').trim();
}

// --- 辅助函数 ---

async function checkContentSafety(content, openid) {
  try {
    if (!content) return true;
    const result = await cloud.openapi.security.msgSecCheck({
      content, version: 2, scene: 2, openid
    });
    return result.errCode === 0;
  } catch (err) {
    if (err.errCode === 87014) return false;
    return true;
  }
}

async function getUserProfile(openid) {
  try {
    const res = await db.collection('users').where({ _openid: openid }).get();
    if (res.data.length > 0) {
      const u = res.data[0];
      return {
        nickName: u.nickName || (u.userInfo && u.userInfo.nickName) || '同学',
        role: u.role === 'student' ? '学生' : (u.role === 'teacher' ? '老师' : ''),
        college: u.college || ''
      };
    }
    return null;
  } catch (err) {
    console.error('[查用户库失败]', err);
    return null;
  }
}

async function logChat(data) {
  try {
    await db.collection('chat_logs').add({
      data: { ...data, createTime: db.serverDate() }
    });
  } catch (err) {
    console.error('[日志写入失败]', err);
  }
}

// --- 主入口 ---

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  let { query: userQuery, topicConversationId } = event;
  const startTime = Date.now();

  if (!userQuery) {
    return { code: 400, message: '请求内容不能为空' };
  }

  try {
    // 1. 获取用户画像，构建单独的提示（不与用户查询合并）
    let userProfileHint = null;
    const userProfile = await getUserProfile(OPENID);
    if (userProfile) {
      const { nickName, role, college } = userProfile;
      userProfileHint = `<user_profile>\nName: ${nickName}\nRole: ${role}\n${college ? `College: ${college}\n` : ''}</user_profile>\n[Instruction: Reply warmly based on user profile, but don't mention it unless asked.]`;
      console.log('[画像注入]', nickName);
    }

    console.log(`[话题 ConversationID] ${topicConversationId || '无'}`);
    console.log(`[用户查询] ${userQuery}`);

    // 2. Coze V3 交互 - 用户画像和查询分开发送，避免影响知识库匹配
    const chatStartTime = Math.floor(Date.now() / 1000);
    const chatData = await initiateChat(OPENID, userQuery, topicConversationId, userProfileHint);
    const { id: chatId, conversation_id: conversationId } = chatData;

    console.log(`[Chat Initiated] ChatID: ${chatId}, ConversationID: ${conversationId}`);

    await pollChatStatus(chatId, conversationId);
    const messageList = await fetchChatMessages(chatId, conversationId);
    const finalReply = parseV3Response(messageList, chatId, chatStartTime);

    if (!finalReply) {
      return { code: 500, message: 'AI 没有回应' };
    }

    // 3. 风控检测
    const isSafe = await checkContentSafety(finalReply, OPENID);

    logChat({
      userId: OPENID,
      query: userQuery,
      reply: finalReply,
      status: isSafe ? 'success' : 'intercepted',
      costTime: Date.now() - startTime
    });

    if (!isSafe) {
      return {
        code: 0,
        reply: '我就不回答这个问题啦 \n(内容可能涉及敏感信息)',
        conversationId
      };
    }

    return {
      code: 0,
      message: 'success',
      reply: finalReply,
      conversationId
    };

  } catch (error) {
    console.error('[系统异常]', error.message);
    logChat({ userId: OPENID, query: userQuery, error: error.message, status: 'error' });

    if (error.message.includes('Timeout')) {
      return { code: 504, message: '思考时间有点长，请重试' };
    }
    return { code: 500, message: '系统开小差了，请稍后重试' };
  }
};
