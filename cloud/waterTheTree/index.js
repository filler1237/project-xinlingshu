const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 定义每升一级所需的水量
const WATER_PER_LEVEL = 100;

// 成就配置 (ID需要与数据库中的achievements集合对应，或者前端硬编码)
// 这里我们假设数据库achievements集合里已有对应ID的数据，或者前端做了兜底
const BADGE_RULES = [
  {
    id: 'badge_watering_30',
    check: (user) => (user.totalWatering || 0) >= 30
  },
  {
    id: 'badge_mind_3',
    check: (user) => (user.mindfulnessCount || 0) >= 3
  }
];

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  // 获取参数：默认为浇水动作
  const { actionType = 'water', rewardGrowth = 0, rewardWater = 0 } = event;

  try {
    // 1. 获取用户当前数据
    const userRecord = await db.collection('users').where({
      _openid: openid
    }).limit(1).get();

    if (userRecord.data.length === 0) {
      return { code: -1, message: '用户不存在' };
    }

    const userData = userRecord.data[0];
    let updateData = {}; // 待更新的数据
    let newUnlocks = []; // 新解锁的徽章

    // 2. 根据动作类型处理逻辑
    if (actionType === 'mindfulness') {
      // --- 正念任务逻辑 ---

      // 增加统计次数
      updateData.mindfulnessCount = _.inc(1);

      // 发放奖励 (成长值 + 水滴)
      // 注意：正念任务通常直接给成长值，但也可能给水滴让用户去浇水
      // 这里设定：给 20 成长值，5 水滴 (可由前端传参或固定)
      const growthReward = rewardGrowth || 20;
      const waterReward = rewardWater || 5;

      updateData.growthValue = _.inc(growthReward);
      updateData.waterDrops = _.inc(waterReward);

      // 重新计算等级 (因为成长值增加了)
      const currentGrowth = userData.growthValue || 0;
      const finalGrowth = currentGrowth + growthReward;
      const newLevel = Math.floor(finalGrowth / WATER_PER_LEVEL) + 1;

      if (newLevel > (userData.treeLevel || 1)) {
        updateData.treeLevel = newLevel;
      }

    } else {
      // --- 默认：浇水逻辑 ---

      const currentWaterDrops = userData.waterDrops || 0;
      if (currentWaterDrops <= 0) {
        return { code: 1, message: '水滴不足，快去做任务吧' };
      }

      // 获取前端传入的浇水量，如果没有传，默认全部 (或者你可以改成默认10)
      const inputAmount = event.amount;
      let consumeAmount = 0;

      if (inputAmount && inputAmount > 0) {
        // 如果指定了数量，检查余额
        if (currentWaterDrops < inputAmount) {
          return { code: 1, message: `水滴不足${inputAmount}g` };
        }
        consumeAmount = inputAmount;
      } else {
        // 未指定，默认逻辑：梭哈（全部消耗）
        consumeAmount = currentWaterDrops;
      }

      // 增加统计次数
      updateData.totalWatering = _.inc(1); // 这里的逻辑是：不管浇多少，只要动作发生了就算一次。合理。

      // 更新数值
      updateData.waterDrops = _.inc(-consumeAmount); // 扣减
      updateData.growthValue = _.inc(consumeAmount); // 增加成长值

      // 计算新等级
      const newTreeWaterValue = (userData.growthValue || 0) + consumeAmount;
      const newTreeLevel = Math.floor(newTreeWaterValue / WATER_PER_LEVEL) + 1;

      if (newTreeLevel > (userData.treeLevel || 1)) {
        updateData.treeLevel = newTreeLevel;
      }
    }

    // 3. 成就解锁检查
    // 我们需要基于"假设更新后"的数据来检查，但 _.inc 是数据库操作符，无法直接在内存比较
    // 简易方案：只基于当前值+1来粗略判断，或者乐观更新

    const currentBadges = userData.unlockedAchievements || [];
    const nextTotalWatering = (userData.totalWatering || 0) + (actionType === 'water' ? 1 : 0);
    const nextMindfulnessCount = (userData.mindfulnessCount || 0) + (actionType === 'mindfulness' ? 1 : 0);

    // 构造一个临时对象用于检查
    const mockNextUser = {
      totalWatering: nextTotalWatering,
      mindfulnessCount: nextMindfulnessCount
    };

    for (const rule of BADGE_RULES) {
      if (!currentBadges.includes(rule.id) && rule.check(mockNextUser)) {
        newUnlocks.push(rule.id);
      }
    }

    if (newUnlocks.length > 0) {
      updateData.unlockedAchievements = _.push(newUnlocks);
    }

    // 4. 执行数据库更新
    await db.collection('users').doc(userData._id).update({
      data: updateData
    });

    // 5. 返回结果
    return {
      code: 0,
      message: actionType === 'mindfulness' ? '正念完成' : '灌溉成功',
      data: {
        newUnlocks: newUnlocks // 可以在前端提示"获得了新徽章！"
      }
    };

  } catch (error) {
    console.error('cloud function error:', error);
    return {
      code: -2,
      message: '操作失败，请稍后再试',
      error: error.message
    };
  }
};
