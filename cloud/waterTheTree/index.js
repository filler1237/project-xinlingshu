const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 定义每升一级所需的水量
const WATER_PER_LEVEL = 100;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;


  try {
    // 获取用户当前数据
    const userRecord = await db.collection('users').where({
      _openid: openid
    }).limit(1).get();

    if (userRecord.data.length === 0) {
      return {
        code: -1,
        message: '用户不存在'
      };
    }

    const userData = userRecord.data[0];
    const currentWaterDrops = userData.waterDrops || 0;

    if (currentWaterDrops <= 0 ) {
      return {
        code: 1,
        message: '水滴不足，快去做任务吧'
      };
    }

    // 计算新数值
    const newWaterDrops = 0 ;
    const newTreeWaterValue = (userData.growthValue || 0) + currentWaterDrops;
    const newTreeLevel = Math.floor(newTreeWaterValue / WATER_PER_LEVEL) + 1;

    // 更新用户数据库记录
    await db.collection('users').doc(userData._id).update({
      data: {
        waterDrops: newWaterDrops,
        growthValue: newTreeWaterValue,
        treeLevel: newTreeLevel
      }
    });

    // 将更新后的数据返回给前端
    return {
      code: 0,
      message: '灌溉成功',
      data: {
        waterDrops: newWaterDrops,
        growthValue: newTreeWaterValue,
        treeLevel: newTreeLevel
      }
    };

  } catch (error) {
    console.error('waterTheTree 云函数执行失败:', error);
    return {
      code: -2,
      message: '灌溉失败，请稍后再试',
      error: error.message
    };
  }
};
