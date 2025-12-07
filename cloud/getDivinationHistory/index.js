// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { recordId } = event;

  try {
    if (recordId) {
      const record = await db.collection('divination_records').doc(recordId).get();
      
      if (record.data && record.data._openid !== wxContext.OPENID) {
        return {
          success: false,
          error: 'Permission denied. You can only access your own records.'
        };
      }
      
      return {
        success: true,
        data: record.data
      };
    } else {
      const records = await db.collection('divination_records')
        .where({
          _openid: wxContext.OPENID
        })
        .orderBy('createdAt', 'desc')
        .get();
      
      return {
        success: true,
        data: records.data
      };
    }
  } catch (e) {
    console.error(e);
    return {
      success: false,
      error: 'Failed to fetch divination history.',
      errorMessage: e.message
    };
  }
};
