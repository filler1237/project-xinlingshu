// cloud/checkAchievements/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 定义树的等级和所需成长值的关系
const TREE_LEVELS = [
  { level: 1, required: 0 },
  { level: 2, required: 50 },
  { level: 3, required: 150 },
  { level: 4, required: 300 },
  { level: 5, required: 500 }
  // 你可以继续添加更多等级
];

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // 1. 获取当前用户信息
  const userRes = await db.collection('users').where({ _openid: wxContext.OPENID }).get()
  if (userRes.data.length === 0) {
    return { code: -1, msg: '用户不存在' }
  }
  const user = userRes.data[0]
  const currentGrowth = user.growthValue
  const userUnlocked = user.unlockedAchievements || []

  // 2. 获取所有成就的定义
  const achievementsRes = await db.collection('achievements').get()
  const allAchievements = achievementsRes.data

  // 3. 检查哪些新成就被解锁
  const newlyUnlocked = []
  for (const ach of allAchievements) {
    // 如果用户成长值足够，并且这个成就还没被解锁过
    if (currentGrowth >= ach.growthValueRequired && !userUnlocked.includes(ach._id)) {
      newlyUnlocked.push(ach._id)
    }
  }

  // 4. 计算新的树等级
  let newTreeLevel = 1;
  for (let i = TREE_LEVELS.length - 1; i >= 0; i--) {
    if (currentGrowth >= TREE_LEVELS[i].required) {
      newTreeLevel = TREE_LEVELS[i].level;
      break;
    }
  }

  // 5. 如果有新成就或等级变化，则更新用户信息
  if (newlyUnlocked.length > 0 || newTreeLevel !== user.treeLevel) {
    await db.collection('users').doc(user._id).update({
      data: {
        unlockedAchievements: _.push(newlyUnlocked), // 将新成就ID push到数组
        treeLevel: newTreeLevel
      }
    })
  }

  return {
    success: true,
    unlocked: newlyUnlocked,
    newLevel: newTreeLevel
  }
}
