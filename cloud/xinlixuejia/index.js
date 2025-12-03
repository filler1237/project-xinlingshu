// cloud/xinlixuejia/index.js

const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const COZE_API_URL = 'https://api.coze.cn/open_api/v2/chat';
const COZE_API_KEY = process.env.COZE_API_KEY;
const COZE_BOT_ID = '7560244389226758183';

// [MODIFIED] 增加健壮性，兼容 content 是字符串或对象两种情况
function extractImageUrlFromToolResponse(messages) {
  const toolResponseMessage = messages.find(msg => msg.type === 'tool_response');
  if (!toolResponseMessage) {
    return null;
  }
  try {
    // 步骤1: 确保 contentJson 是一个对象
    let contentJson;
    if (typeof toolResponseMessage.content === 'string') {
      contentJson = JSON.parse(toolResponseMessage.content);
    } else {
      // 如果已经是对象，直接使用
      contentJson = toolResponseMessage.content;
    }

    // 步骤2: 确保 dataJson 是一个对象
    let dataJson;
    if (typeof contentJson.data === 'string') {
      dataJson = JSON.parse(contentJson.data);
    } else {
      // 如果已经是对象，直接使用
      dataJson = contentJson.data;
    }
    
    // 步骤3: 从最终的对象中提取URL
    if (dataJson && dataJson.data && dataJson.data.image_urls && dataJson.data.image_urls.length > 0) {
      return dataJson.data.image_urls[0];
    }
  } catch (e) {
    console.error("解析插件图片链接失败:", e);
    return null;
  }
  return null;
}


exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const userQuery = event.query;
  const userId = event.user || OPENID;
  const chatHistory = event.chat_history || [];

  if (!userQuery) {
    return { code: 400, message: '请求内容不能为空' };
  }
  if (!COZE_API_KEY || !COZE_BOT_ID || COZE_BOT_ID === 'YOUR_BOT_ID') {
    console.error('Coze API Key 或 Bot ID 未配置');
    return { code: 500, message: '云函数配置不正确，请联系管理员' };
  }

  try {
    console.log(`[请求Coze] 用户: ${userId}, 内容: ${userQuery}`);
    
    const response = await axios.post(
      COZE_API_URL,
      {
        bot_id: COZE_BOT_ID,
        user: userId,
        query: userQuery,
        stream: false,
        chat_history: chatHistory,
      },
      {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${COZE_API_KEY}` },
        timeout: 60000, // 插件调用可能耗时较长，设置为30秒
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
    const assistantTextMessage = messages.find(msg => msg.type === 'answer');
    
    let finalReply = '';

    if (imageUrl) {
      finalReply += `![生成的图片](${imageUrl})\n\n`;
    }
    
    if (assistantTextMessage && assistantTextMessage.content) {
      finalReply += assistantTextMessage.content;
    }

    if (!finalReply) {
        console.error('[数据解析失败] 未能从Coze返回中找到图片或文本。');
        return { code: 500, message: '未能解析出有效回复' };
    }

    return {
      code: 0,
      message: 'success',
      reply: finalReply.trim(),
    };

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('[请求Coze超时]', error.message);
      return { code: 504, message: '请求外部服务超时，请稍后再试' };
    }
    console.error('[请求Coze失败]', error.response ? error.response.data : error.message);
    return { code: 500, message: '调用外部服务失败，请检查云函数日志' };
  }
};
