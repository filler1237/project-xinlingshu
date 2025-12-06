// cloud/xinlixuejia/index.js

const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// --- 1. 结构化配置与常量管理 ---
const CONFIG = {
  API_URL: 'https://api.coze.cn/open_api/v2/chat',
  API_KEY: process.env.COZE_API_KEY,
  BOT_ID: '7579231261534093347',
  REQUEST_TIMEOUT: 60000, // 60秒超时
};

const MESSAGE_TYPES = {
  TOOL_RESPONSE: 'tool_response',
  ANSWER: 'answer',
};

const ERROR_CODES = {
  TIMEOUT: 'ECONNABORTED',
};

/**
 * [MODIFIED & SIMPLIFIED] 从 Coze 的消息中提取工具返回的图片 URL
 * 使用可选链操作符 ?. 极大简化了代码
 * @param {Array} messages - Coze返回的消息数组
 * @returns {string|null} - 提取到的图片URL，或 null
 */
function extractImageUrlFromToolResponse(messages) {
  try {
    const toolResponseMessage = messages.find(msg => msg.type === MESSAGE_TYPES.TOOL_RESPONSE);
    if (!toolResponseMessage) {
      return null;
    }

    // 尝试将 content 解析为对象
    const contentObj = typeof toolResponseMessage.content === 'string' 
      ? JSON.parse(toolResponseMessage.content) 
      : toolResponseMessage.content;
    
    // 尝试将 content.data 解析为对象
    const dataObj = typeof contentObj?.data === 'string'
      ? JSON.parse(contentObj.data)
      : contentObj?.data;

    // 使用可选链安全地访问深层嵌套的 URL
    return dataObj?.data?.image_urls?.[0] || null;

  } catch (e) {
    console.error("解析插件图片链接失败:", e);
    return null;
  }
}

/**
 * 云函数主入口
 */
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { query: userQuery, chat_history: chatHistory = [], user } = event;
  const userId = user || OPENID;

  if (!userQuery) {
    return { code: 400, message: '请求内容不能为空' };
  }
  if (!CONFIG.API_KEY || !CONFIG.BOT_ID || CONFIG.BOT_ID === 'YOUR_BOT_ID') {
    console.error('Coze API Key 或 Bot ID 未配置');
    return { code: 500, message: '云函数配置不正确，请联系管理员' };
  }

  try {
    console.log(`[请求Coze] 用户: ${userId}, 内容: ${userQuery}`);

    const response = await axios.post(
      CONFIG.API_URL,
      {
        bot_id: CONFIG.BOT_ID,
        user: userId,
        query: userQuery,
        stream: false,
        chat_history: chatHistory,
      },
      {
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${CONFIG.API_KEY}` 
        },
        timeout: CONFIG.REQUEST_TIMEOUT,
      }
    );
    
    console.log('[Coze响应成功]', JSON.stringify(response.data, null, 2));

    const responseBody = response.data;
    if (responseBody.code !== 0) {
      console.error('[Coze业务错误]', responseBody);
      return { code: responseBody.code, message: responseBody.msg || 'Coze API 返回业务错误' };
    }

    const messages = responseBody.messages || [];
    
    const imageUrl = extractImageUrlFromToolResponse(messages);
    const assistantTextMessage = messages.find(msg => msg.type === MESSAGE_TYPES.ANSWER)?.content || '';
    
    // --- 5. 精简返回逻辑 ---
    let finalReply = '';
    if (imageUrl) {
      // 构造成 Markdown 图片格式
      finalReply += `![生成的图片](${imageUrl})\n\n`;
    }
    finalReply += assistantTextMessage;

    if (!finalReply.trim()) {
        console.error('[数据解析失败] 未能从Coze返回中找到图片或文本。');
        return { code: 500, message: '未能解析出有效回复' };
    }

    return {
      code: 0,
      message: 'success',
      reply: finalReply.trim(),
    };

  } catch (error) {
    // --- 3. 增强错误日志记录 ---
    if (error.code === ERROR_CODES.TIMEOUT) {
      console.error(`[请求Coze超时] 超过 ${CONFIG.REQUEST_TIMEOUT}ms`, error.message);
      return { code: 504, message: '思考时间太长了，请稍后再试' }; // 返回给用户的提示可以更友好
    }
    if (error.response) {
      // 请求已发出，但服务器返回了非 2xx 的状态码
      console.error('[请求Coze API失败]', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      });
    } else {
      // 请求在发送前就失败了 (例如网络问题)
      console.error('[请求Coze前置失败]', error.message);
    }
    return { code: 500, message: '系统开小差了，请稍后重试' };
  }
};
