const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  // 签到奖励的水滴数量
  const REWARD_AMOUNT = 10;

  try {
    // 获取今天零点的时间戳
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // 查找用户的记录
    const userRecord = await db.collection('users').where({
      _openid: openid
    }).limit(1).get();

    if (userRecord.data.length === 0) {
      // 处理用户记录不存在的情况
      return {
        code: -1,
        message: '用户不存在'
      };
    }

    const userData = userRecord.data[0];
    const lastSignInTimestamp = userData.LastSignInDate || 0; // 使用时间戳，默认为0

    // 如果上一次签到时间戳大于等于今天零点的时间戳，则说明今天已签到
    if (lastSignInTimestamp >= startOfToday) {
      return {
        code: 1,
        message: '今日已签到，请明天再来'
      };
    }

    // 执行签到操作，存储当前的时间戳
    const updateResult = await db.collection('users').doc(userData._id).update({
      data: {
        LastSignInDate: Date.now(),
        waterDrops: db.command.inc(REWARD_AMOUNT)
      }
    });

    if (updateResult.stats.updated === 1) {
      return {
        code: 0,
        message: '签到成功',
        reward: REWARD_AMOUNT,
        // 备注：如果前端需要立即知道最新的水滴总数，这里需要重新查询一次数据库
        // 为简化逻辑，目前只返回成功状态和奖励数量
      };
    } else {
      throw new Error('更新用户签到记录失败');
    }

  } catch (error) {
    console.error('Error in taskSignIn cloud function:', error);
    return {
      code: -2,
      message: '签到失败，请稍后再试',
      error: error.message
    };
  }
};
