// cloud/xinlixuejia/index.js

// 1. 引入依赖
const cloud = require('wx-server-sdk');
const axios = require('axios');

// 2. 初始化云环境
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });


const COZE_API_URL = 'https://api.coze.cn/open_api/v2/chat';
// 从环境变量中安全地获取 API Key
const COZE_API_KEY = process.env.COZE_API_KEY; 
// 你的 Coze Bot ID
const COZE_BOT_ID = '7560244389226758183'; 

// 4. 云函数主函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  
  // 从前端获取参数
  const userQuery = event.query;
  const userId = event.user || OPENID;

  // 参数校验
  if (!userQuery) {
    return { code: 400, message: '请求内容不能为空' };
  }
  if (!COZE_API_KEY || !COZE_BOT_ID || COZE_BOT_ID === 'YOUR_BOT_ID') {
    console.error('Coze API Key 或 Bot ID 未配置');
    return { code: 500, message: '云函数配置不正确，请联系管理员' };
  }

  try {
    console.log(`[请求Coze] 用户: ${userId}, 内容: ${userQuery}`);

    // 5. 使用 axios 发起 POST 请求
    const response = await axios.post(
      COZE_API_URL,
      {
        bot_id: COZE_BOT_ID,
        user: userId,
        query: userQuery,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${COZE_API_KEY}`,
        },
      }
    );

    console.log('[Coze响应成功]', response.data);

    // 6. 处理返回结果
    const responseBody = response.data;
    const messages = responseBody.messages || [];
    const assistantMessage = messages.find(msg => msg.type === 'answer');

    if (responseBody.code === 0 && assistantMessage) {
      // 成功
      return {
        code: 0,
        message: 'success',
        reply: assistantMessage.content,
      };
    } else {
      // Coze API 返回业务错误
      return {
        code: responseBody.code || 500,
        message: responseBody.msg || 'Coze API 返回未知错误',
      };
    }

  } catch (error) {
    // 7. 捕获网络请求等异常
    // axios 的错误信息在 error.response.data 中
    console.error('[请求Coze失败]', error.response ? error.response.data : error.message);
    return {
      code: 500,
      message: '调用 Coze API 失败，请检查云函数日志',
    };
  }
};
