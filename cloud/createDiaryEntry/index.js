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

  // 确保emotionIntensity是有效的数字或null
  const validEmotionIntensity = (emotionIntensity !== null && emotionIntensity !== undefined && !isNaN(emotionIntensity)) ? emotionIntensity : null
  
  const doc = {
    userId: wxContext.OPENID,
    date, // YYYY-MM-DD
    content,
    emotionType: emotionType,
    emotionIntensity: validEmotionIntensity,
    empathyReply: null,
    keywords: [],
    createdAt: new Date()
  }
  
  console.log('准备保存的日记数据:', doc) // 调试日志
  console.log('原始情绪强度:', emotionIntensity, typeof emotionIntensity) // 调试日志
  console.log('有效情绪强度:', validEmotionIntensity, typeof validEmotionIntensity) // 调试日志

  try {
    const res = await db.collection('DiaryEntries').add({ data: doc })
    // 可选：立即触发分析（解耦建议放到前端调用 analyzeDiaryEntry）
    return { ok: true, id: res._id }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}