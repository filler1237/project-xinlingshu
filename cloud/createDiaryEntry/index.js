// cloud/createDiaryEntry/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { content, emotionIntensity = null, date, emotionType = null } = event

  if (!content || !date) {
    return { ok: false, error: 'content and date are required' }
  }

  const doc = {
    userId: wxContext.OPENID,
    date, // YYYY-MM-DD
    content,
    emotionType: emotionType,
    emotionIntensity,
    empathyReply: null,
    keywords: [],
    createdAt: new Date()
  }

  try {
    const res = await db.collection('DiaryEntries').add({ data: doc })
    // 可选：立即触发分析（解耦建议放到前端调用 analyzeDiaryEntry）
    return { ok: true, id: res._id }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}