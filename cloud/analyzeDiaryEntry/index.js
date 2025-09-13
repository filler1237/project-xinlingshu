// cloud/analyzeDiaryEntry/index.js
const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const LLM_URL = 'https://api.deepseek.com/v1/chat/completions'
const LLM_API_KEY = process.env.LLM_API_KEY

exports.main = async (event, context) => {
  const { entryId } = event
  if (!entryId) return { ok: false, error: 'entryId is required' }

  try {
    const { data } = await db.collection('DiaryEntries').doc(entryId).get()
    const { content } = data
    if (!content) return { ok: false, error: 'content missing' }

    // 内容安全（示例：仅演示，不调用外部接口）
    if (content.length > 2000) {
      return { ok: false, error: 'content too long' }
    }

    // 调用你的 LLM 网关（OpenAI 兼容/自建接口均可）
    const prompt = [
      { role: 'system', content: '你是共情的倾听者。不要医学诊断，中文，简洁温柔，<=50字。' },
      { role: 'user', content: `请从这段日记中提取：1)情绪类别(快乐/平静/焦虑/悲伤/愤怒/其他之一)；2)强度0-10；3)50字内共情回复；4)2-5个关键词（中文）。日记：${content}` }
    ]

    const resp = await axios.post(LLM_URL, {
      model: 'deepseek-chat',
      messages: prompt,
      temperature: 0.6
    }, {
      timeout: 20000,
      headers: LLM_API_KEY ? { Authorization: `Bearer ${LLM_API_KEY}` } : {}
    })

    const text = resp.data?.choices?.[0]?.message?.content?.trim() || ''
    // 简单解析（建议你按约定的 JSON 输出来解析更稳）
    const parsed = parseLLMText(text) // 你也可以改成 JSON.parse

    await db.collection('DiaryEntries').doc(entryId).update({
      data: {
        emotionType: parsed.emotionType || '其他',
        emotionIntensity: typeof parsed.emotionIntensity === 'number' ? parsed.emotionIntensity : null,
        empathyReply: parsed.empathyReply || '',
        keywords: parsed.keywords || []
      }
    })

    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

function parseLLMText(text) {
  // 简易兜底解析：建议改为让 LLM 输出 JSON，再 JSON.parse
  const emotionMap = ['快乐','平静','焦虑','悲伤','愤怒','其他']
  let emotionType = emotionMap.find(k => text.includes(k)) || '其他'
  let intensity = null
  const m = text.match(/(\d+)\s*\/?\s*10|([0-9]{1,2})分/)
  if (m) intensity = Number(m[1] || m[2]); if (intensity > 10) intensity = 10
  let empathyReply = (text.split('回复：')[1] || '').split('\n')[0] || text.slice(0, 50)
  let keywords = Array.from(new Set((text.match(/[\u4e00-\u9fa5]{2,6}/g) || []).slice(0, 5)))
  return { emotionType, emotionIntensity: intensity ?? null, empathyReply, keywords }
}