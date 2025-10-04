// cloudFunctions/analyzeEmotionTrend/index.js
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const LLM_URL = 'https://api.deepseek.com/v1/chat/completions'
const LLM_API_KEY = process.env.LLM_API_KEY

exports.main = async (event, context) => {
  const { startDate, endDate } = event
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID

  if (!startDate || !endDate) {
    return { ok: false, error: 'Missing required date range parameters.' }
  }

  try {
    // 1. 获取指定时间范围内的日记数据
    const diaryEntries = await db.collection('DiaryEntries').where({
      userId: userId,
      date: _.gte(startDate).and(_.lte(endDate))
    }).orderBy('date', 'asc').get()

    if (diaryEntries.data.length === 0) {
      return { ok: false, error: 'No diary entries found in the selected date range.' }
    }

    // 2. 准备AI分析所需的数据
    const formattedEntries = diaryEntries.data.map(entry => 
      `日期: ${entry.date}, 情绪: ${entry.emotionType || '未记录'}, 强度: ${entry.emotionIntensity || '未记录'}, 内容: ${entry.content.slice(0, 50)}...`
    ).join('\n')

    // 3. 构建Prompt
    const prompt = [
      {
        role: 'system',
        content: `你是一位专业的心理医生，擅长分析情绪趋势并提供建议。请根据用户在一段时间内的日记摘要，分析其整体情绪趋势，并提供专业的心理建议。请严格按照以下格式回复：
1) **情绪趋势总结**: (对这段时间内的情绪波动、主要情绪和变化趋势进行总结，约100-150字)
2) **专业心理建议**: (根据情绪趋势，提供2-3条具体、可行的心理调适建议，约150-200字)`
      },
      {
        role: 'user',
        content: `请分析以下我在 ${startDate} 到 ${endDate} 期间的日记摘要，总结我的情绪趋势并给出建议：\n\n${formattedEntries}`
      }
    ]

    // 4. 调用LLM API
    const resp = await axios.post(LLM_URL, {
      model: 'deepseek-chat',
      messages: prompt,
      temperature: 0.7
    }, {
      timeout: 25000,
      headers: { Authorization: `Bearer ${LLM_API_KEY}` }
    })

    let analysisResult = resp.data?.choices?.[0]?.message?.content?.trim() || ''

    if (!analysisResult) {
      throw new Error('AI analysis returned an empty result.')
    }

    // 移除Markdown的加粗标记
    analysisResult = analysisResult.replace(/\*\*/g, '')

    return { ok: true, analysis: analysisResult }

  } catch (error) {
    console.error('Error in analyzeEmotionTrend:', error)
    return { ok: false, error: error.message }
  }
}
