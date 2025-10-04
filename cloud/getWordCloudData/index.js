const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // scope 可以是 'personal' 或 'global'
  const { scope = 'personal', days = 30 } = event 

  // 计算起始日期
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  let matchCondition = {
    createdAt: _.gte(startDate),
    keywords: _.exists(true) // 只考虑包含关键词的日记
  }

  if (scope === 'personal') {
    matchCondition._openid = wxContext.OPENID
  }

  try {
    // 使用聚合操作来获取所有关键词
    const result = await db.collection('DiaryEntries').aggregate()
      .match(matchCondition)
      .project({
        keywords: 1
      })
      .unwind('$keywords')
      .group({
        _id: '$keywords',
        count: _.sum(1)
      })
      .project({
        _id: 0,
        name: '$_id', // ECharts 词云期望 'name' 和 'value'
        value: '$count'
      })
      .sort({
        value: -1
      })
      .limit(100) // 限制为前 100 个关键词
      .end()

    return {
      ok: true,
      data: result.list
    }

  } catch (e) {
    console.error('Error in getWordCloudData:', e)
    return {
      ok: false,
      error: e.message
    }
  }
}
