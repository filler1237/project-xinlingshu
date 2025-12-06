// cloud/testReview/index.js (修改为V2同步版本)
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// --- 配置信息 ---
const CONFIG = {
  // 使用 V2 版本的 API 地址
  CHAT_API_URL: 'https://api.coze.cn/open_api/v2/chat',
  // 从环境变量获取 API_KEY，请确保已在云函数环境变量中配置
  API_KEY: process.env.COZE_API_KEY, 
  // 替换为您审核 Bot 的真实 ID
  BOT_ID: '7580352450419949574', 
  // 请求超时时间（毫秒）
  REQUEST_TIMEOUT: 15000, 
};

/**
 * 解析从Coze API返回的审核结果
 * @param {object} response - Axios的响应对象
 * @returns {object|null} - 解析后的结果或null
 */
function parseReviewResult(response) {
    try {
        // V2 接口返回的答案在 messages 数组中
        const message = response.data.messages.find(m => m.type === 'answer');
        if (!message || !message.content) {
            console.error("解析失败：未找到answer消息或内容为空", response.data);
            return null;
        }
        
        // 解析 message.content 中的 JSON 字符串
        const contentObj = JSON.parse(message.content);
        if (typeof contentObj.is_violation !== 'boolean') {
            console.error("解析失败：'is_violation'字段不存在或类型不正确", contentObj);
            return null;
        }
        
        return {
            is_violation: contentObj.is_violation,
            details: contentObj.violation_details || []
        };
    } catch (e) {
        console.error("解析审核结果JSON失败:", e, "原始数据:", response.data);
        // 返回一个默认的失败结果，以防万一
        return { is_violation: true, details: [{ violation_type: "系统解析异常" }] };
    }
}

// --- 云函数主入口 ---
exports.main = async (event, context) => {
  const { content } = event;
  const { OPENID } = cloud.getWXContext();

  // --- 输入和配置校验 ---
  if (!content) {
    return { pass: false, message: "内容为空" };
  }
  if (!CONFIG.API_KEY || !CONFIG.BOT_ID) {
    console.error('云函数配置缺失：COZE_API_KEY或BOT_ID未设置');
    return { pass: false, message: "云函数配置错误" };
  }

  // --- 构造请求头 ---
  const requestHeaders = { 
    'Content-Type': 'application/json', 
    'Authorization': `Bearer ${CONFIG.API_KEY}` 
  };

  try {
    // --- 发起同步调用请求 ---
    const response = await axios.post(
      CONFIG.CHAT_API_URL,
      {
        bot_id: CONFIG.BOT_ID,
        user: OPENID || 'default_user_id', // V2 版本使用 'user' 字段
        query: content,                   // V2 版本使用 'query' 字段传递内容
        stream: false,                    // 明确指定不使用流式响应
      },
      { 
        headers: requestHeaders, 
        timeout: CONFIG.REQUEST_TIMEOUT 
      }
    );

    // --- 检查API返回码 ---
    if (response.data.code !== 0) {
        console.error('[Coze API 请求失败]', response.data);
        return { pass: false, message: `审核服务调用失败: ${response.data.msg}` };
    }

    // --- 解析业务结果 ---
    const reviewResult = parseReviewResult(response);
    if (!reviewResult) {
        return { pass: false, message: '无法解析审核结果' };
    }
    
    // 根据审核结果返回不同信息
    if (reviewResult.is_violation) {
      const reason = reviewResult.details.map(d => d.violation_type).join(', ') || '内容不合规';
      return { code: 200, pass: false, message: `内容审核不通过 (${reason})` };
    } else {
      return { code: 200, pass: true, message: '审核通过' };
    }

  } catch (error) {
    console.error('[请求审核API异常]', error.response ? error.response.data : error.message);
    // 对 Axios 错误进行更详细的记录
    if (error.code === 'ECONNABORTED') {
        return { code: 500, message: '审核请求超时', pass: false };
    }
    return { code: 500, message: '审核过程出现未知错误', pass: false };
  }
};
