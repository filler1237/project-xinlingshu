// cloud/getEmotionTrend/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { startDate, endDate } = event
  if (!startDate || !endDate) return { ok: false, error: 'startDate and endDate are required' }

  try {
    const { data } = await db.collection('DiaryEntries')
      .where({
        userId: wxContext.OPENID,
        date: db.command.gte(startDate).and(db.command.lte(endDate))
      })
      .orderBy('date', 'asc')
      .get()

    // 聚合统计
    const series = data.map(d => ({ 
      date: d.date, 
      emotionType: d.emotionType, 
      emotionIntensity: d.emotionIntensity !== null && d.emotionIntensity !== undefined ? d.emotionIntensity : 0 
    }))
    const stat = {}
    data.forEach(d => {
      const k = d.emotionType || '其他'
      stat[k] = (stat[k] || 0) + 1
    })

    return { ok: true, series, stat }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}