const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // scope 可以是 'personal' 或 'global'
  const { scope = 'personal', days = 30, startDate, endDate } = event

  let matchCondition = {
    keywords: _.exists(true).and(_.neq([])) // 只考虑包含非空关键词数组的日记
  }

  // 检查 event 中是否直接提供了 startDate 和 endDate
  if (startDate && endDate) {
    // 如果提供了，则使用指定的日期范围
    matchCondition.createdAt = _.gte(new Date(startDate)).and(_.lte(new Date(endDate)))
  } else {
    // 否则，回退到使用 days 参数计算日期范围
    const calculatedStartDate = new Date()
    calculatedStartDate.setDate(calculatedStartDate.getDate() - days)
    matchCondition.createdAt = _.gte(calculatedStartDate)
  }

  if (scope === 'personal') {
    // 修正：根据项目约定，日记中的用户标识字段为 userId，其值为 OPENID
    matchCondition.userId = wxContext.OPENID
  }

  const debugInfo = {}; // 初始化调试信息对象

  try {
    // 调试信息：获取匹配的日记 ID
    const matchedEntries = await db.collection('DiaryEntries')
      .where(matchCondition)
      .field({ _id: 1 })
      .get();
    
    const entryIds = matchedEntries.data.map(entry => entry._id);
    debugInfo.读取成功 = '是';
    debugInfo.读取的日记ID列表 = entryIds;

    // 使用聚合操作来获取所有关键词
    const result = await db.collection('DiaryEntries').aggregate()
      .match(matchCondition)
      .project({
        keywords: 1
      })
      .unwind('$keywords')
      .group({
        _id: '$keywords',
        count: $.sum(1)
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
      data: result.list,
      debug: debugInfo
    }

  } catch (e) {
    console.error('Error in getWordCloudData:', e)
    debugInfo.读取成功 = '否';
    debugInfo.错误信息 = e.message;
    return {
      ok: false,
      error: e.message,
      debug: debugInfo
    }
  }
}
