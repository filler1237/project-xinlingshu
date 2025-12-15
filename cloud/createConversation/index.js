// 云函数入口文件
// 用于在 Coze 上创建一个新的空会话，返回 conversation_id

const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 配置
const CONFIG = {
  API_HOST: 'https://api.coze.cn',
  API_KEY: process.env.COZE_API_KEY,
  BOT_ID: '7583917266450792474',
  REQUEST_TIMEOUT: 10000,
};

/**
 * 创建 Coze 会话
 * @returns {Promise<string>} conversationId
 */
async function createCozeConversation() {
  const url = `${CONFIG.API_HOST}/v1/conversation/create`;

  const payload = {
    bot_id: CONFIG.BOT_ID
  };

  const response = await axios.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.API_KEY}`
    },
    timeout: CONFIG.REQUEST_TIMEOUT
  });

  console.log('[Coze Create Conversation Response]', JSON.stringify(response.data));

  if (response.data.code !== 0) {
    throw new Error(`Create Conversation Error: ${response.data.msg}`);
  }

  return response.data.data.id;
}

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const conversationId = await createCozeConversation();

    console.log('[新会话已创建]', conversationId);

    return {
      code: 0,
      message: 'success',
      conversationId: conversationId
    };
  } catch (error) {
    console.error('[创建会话失败]', error);
    return {
      code: 500,
      message: error.message || '创建会话失败'
    };
  }
};