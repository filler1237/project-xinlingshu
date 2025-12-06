// cloudfunctions/onVentCreate/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * 数据库触发器：当 vents 集合有新记录创建时，自动进行内容安全审核
 * @param {object} event - 包含触发器数据的事件对象
 * @param {object} context - 包含运行时信息的上下文对象
 */
exports.main = async (event, context) => {
  console.log('--- [onVentCreate] 数据库触发器执行开始 ---');
  console.log('[触发器事件详情]', event);

  // 从触发器事件中获取新创建的 vent 记录
  // 注意：数据库触发器（创建）的数据直接在 event 中，而不是 event.data
  const ventRecord = event.data.doc;

  // 安全校验，确保有 _id 和 content
  if (!ventRecord) {
    console.error(`[错误] 记录无效，无法在event.data.doc 中找到记录:`, ventRecord);
    return {
      code: -1,
      message: 'Invalid record data: missing _id or content.'
    };
  }
  const { _id, content } = ventRecord;
  if (!_id || !content) {
    console.error(`[错误] 记录无效，缺少 _id 或 content。记录:`, ventRecord);
    return { code: -1, message: 'Invalid record data: missing _id or content.' };
  }


  console.log(`[步骤1] 开始对 vent (ID: ${_id}) 的内容进行安全审核...`);

  try {
    const res = await cloud.openapi.security.msgSecCheck({ content });
    console.log(`[步骤1] 内容审核API调用完成 (内容合规)，返回结果:`, res);
    
    // 只有当 API 调用成功且没有抛出异常时，才算审核通过
    await db.collection('vents').doc(_id).update({
      data: {
        status: 'approved',
        reviewComment: '内容合规',
        reviewedAt: db.serverDate()
      }
    });
    console.log(`[成功] ID: ${_id} 审核通过，数据库更新成功。`);
    return { code: 0, message: 'Review approved.' };

  } catch (err) {
    console.warn(`!!! [onVentCreate] (ID: ${_id}) 检测到异常或违规内容 !!!`, err);

    // 核心优化：判断这个异常是不是内容违规导致的
    if (err.errCode === 87014) {
      // 这是内容违规，是正常业务逻辑
      await db.collection('vents').doc(_id).update({
        data: {
          status: 'rejected', // 状态改为 "rejected"
          reviewComment: '内容包含敏感信息',
          reviewedAt: db.serverDate()
        }
      });
      console.log(`[处理] ID: ${_id} 内容违规，状态已更新为 rejected。`);
      return { code: 1, message: 'Content rejected.' };
    } else {
      // 其他错误，视为系统异常
      await db.collection('vents').doc(_id).update({
        data: {
          status: 'review_failed', // 状态改为 "review_failed"
          reviewComment: '审核服务出现系统错误'
        }
      });
      console.error(`[错误] ID: ${_id} 审核时发生未知系统异常，状态已更新为 review_failed。`);
      return { code: -2, message: 'An unexpected error occurred.', error: err };
    }
  }
};