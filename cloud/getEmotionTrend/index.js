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
      date: db.command.and(
        db.command.gte(startDate),
        db.command.lte(endDate)
      )
    })
      .orderBy('date', 'asc')
      .get()
    
    const series = data.map(d => ({
      date: d.date,
      emotionType: d.emotionType, // 例如：积极、中性、消极
      emotionIntensity: d.emotionIntensity !== null && d.emotionIntensity !== undefined ? d.emotionIntensity : '其他' // 例如：快乐、平静、疲惫
    }))

    const stat = {}
    series.forEach(item => {
      const mainEmotion = item.emotionType || '其他'; // 使用 emotionType 作为主情绪分类
      stat[mainEmotion] = (stat[mainEmotion] || 0) + 1
    })

    return { ok: true, series, stat }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
