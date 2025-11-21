const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 任务配置中心
const TASKS_CONFIG = {
  'dailySignIn': {
    reward: 10,
    message: '签到成功，获得 {reward} 点水滴！',
    dateField: 'lastSignInDate', // 用于记录上次完成时间的字段
    repeatable: 'daily' // 'daily' 或 'once'
  },
  'completeDiary': {
    reward: 20,
    message: '记录心情日记，获得 {reward} 点水滴！',
    dateField: 'lastDiaryDate',
    repeatable: 'daily'
  },
  // 可以在这里添加更多任务配置
  // 'shareApp': { ... }
};

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const {
    taskId
  } = event;

  // 如果没有提供 taskId，默认为每日签到，以兼容旧版调用
  const currentTaskId = taskId || 'dailySignIn';
  const task = TASKS_CONFIG[currentTaskId];

  if (!task) {
    return {
      code: -3,
      message: '无效的任务类型'
    };
  }

  try {
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

    // --- 检查任务是否可重复完成 ---
    // 核心逻辑：这里的判断基于任务的提交时间 (Date.now())，而不是日记本身选择的日期。
    // 这确保了即使用户补写过去的日记，奖励也只按提交当天计算一次。
    if (task.repeatable === 'daily') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const lastCompletionTimestamp = userData[task.dateField] || 0;

      if (lastCompletionTimestamp >= startOfToday) {
        let message = '今天已经完成过这个任务啦';
        if (currentTaskId === 'completeDiary') {
          message = '今天已经通过写日记获得过奖励了哦';
        }
        return {
          code: 1,
          message: message
        };
      }
    } else if (task.repeatable === 'once' && userData[task.dateField]) {
      return {
        code: 1,
        message: '这个任务只能完成一次哦'
      };
    }

    // --- 执行任务奖励 ---
    const updateData = {
      [task.dateField]: Date.now(),
      waterDrops: _.inc(task.reward)
    };

    const updateResult = await db.collection('users').doc(userData._id).update({
      data: updateData
    });

    if (updateResult.stats.updated === 1) {
      return {
        code: 0,
        message: task.message.replace('{reward}', task.reward),
        reward: task.reward
      };
    } else {
      throw new Error('更新用户任务记录失败');
    }

  } catch (error) {
    console.error(`Error in taskSignIn for task [${currentTaskId}]:`, error);
    return {
      code: -2,
      message: '任务完成失败，请稍后再试',
      error: error.message
    };
  }
};
