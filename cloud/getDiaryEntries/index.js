// cloud/getDiaryEntries/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { startDate, endDate, limit = 20, skip = 0 } = event

  try {
    let query = db.collection('DiaryEntries').where({
      userId: wxContext.OPENID
    })

    // 添加日期范围筛选
    if (startDate && endDate) {
      query = query.where({
        date: db.command.gte(startDate).and(db.command.lte(endDate))
      })
    }

    const result = await query
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(limit)
      .get()

    return { 
      ok: true, 
      data: result.data,
      total: result.data.length
    }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
