// cloud/getEmotionTrend/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { startDate, endDate, scope = 'personal' } = event

  if (!startDate || !endDate) {
    return { ok: false, error: 'startDate and endDate are required' }
  }

  try {
    // 1️⃣ 构建查询条件
    const whereCondition = {
      date: _.and(_.gte(startDate), _.lte(endDate))
    }

    if (scope === 'personal') {
      whereCondition.userId = wxContext.OPENID
    }

    // 2️⃣ 查询数据库
    const { data } = await db
      .collection('DiaryEntries')
      .where(whereCondition)
      .orderBy('date', 'asc')
      .get()

    // 3️⃣ 组装返回数据
    const series = data.map(d => ({
      date: d.date,
      emotionType: d.emotionType,
      emotionIntensity:
        d.emotionIntensity !== null && d.emotionIntensity !== undefined
          ? d.emotionIntensity
          : '其他'
    }))

    const stat = {}
    series.forEach(item => {
      const mainEmotion = item.emotionType || '其他'
      stat[mainEmotion] = (stat[mainEmotion] || 0) + 1
    })

    return {
      ok: true,
      scope,
      series,
      stat
    }

  } catch (e) {
    console.error('getEmotionTrend error:', e)
    return { ok: false, error: e.message }
  }
}
