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
    const { content, emotionIntensity: userIntensity, emotionType: userEmotionType } = data
    console.log('从数据库获取的原始数据:', data) // 调试日志
    console.log('用户选择的情绪强度:', userIntensity, typeof userIntensity) // 调试日志
    console.log('用户选择的情绪类型:', userEmotionType) // 调试日志
    if (!content) return { ok: false, error: 'content missing' }

    if (content.length > 2000) {
      return { ok: false, error: 'content too long' }
    }
    const prompt = [
      { 
        role: 'system', 
        content: `你是一位专业的心理咨询师，也是一位懂梗、有亲和力的学长/学姐，专门为大学生提供心理支持。你的特点是：
1. 专业背景：心理学专业背景，非常了解当代大学生的生活和烦恼。
2. 沟通风格：像一个有趣、温暖又可靠的朋友。多用年轻人的语言风格，可以适当引用网络热词或表情符号（如 emoji），但要确保表达得体、不冒犯。避免使用“我理解你”、“我能感受到”这类过于刻板的开头。
3. 专业能力：能敏锐捕捉情绪，提供切实可行的建议，并能推荐符合年轻人品味的文艺作品来疗愈心情。
4. 回复原则：真诚、有趣、专业、不说教。你的回复应该像一股清泉，能给用户带来启发和力量。

请严格按照以下格式回复，不要添加任何额外说明：
1)情绪类别
2)强度数字
3)专业心理回复
4)关键词 (2-5个，用逗号分隔)
5)情绪电台推荐 (格式为 [类型]作品名-作者-推荐理由。类型包括 [歌曲]、[书籍]、[电影])

重要：请务必设身处地，即使用户的日记很短，也要写出有创意、有温度的回复和推荐。` 
      },
      { 
        role: 'user', 
        content: `请以专业心理医生的身份分析这位大学生的日记，严格按照格式回复：

1)情绪类别（快乐/平静/焦虑/悲伤/愤怒/其他）
2)强度（0-10的数字）
3)专业心理回复（建议150-200字，体现专业性和温暖，给予具体建议和情感支持）
4)关键词（2-5个，用逗号分隔）
5)情绪电台推荐（根据日记内容和情绪，推荐一首歌曲、一本书或一部电影，格式为 [类型]作品名-作者-推荐理由）

日记内容：${content}`
      }
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
    console.log('AI返回的原始文本:', text) // 调试日志
    console.log('AI返回的原始文本长度:', text.length) // 调试日志
    
    // 简单解析（建议你按约定的 JSON 输出来解析更稳）
    const parsed = parseLLMText(text) // 你也可以改成 JSON.parse
    console.log('解析后的结果:', parsed) // 调试日志
    console.log('解析后的情绪类型:', parsed.emotionType) // 调试日志
    console.log('解析后的强度:', parsed.emotionIntensity) // 调试日志
    console.log('解析后的回复:', parsed.empathyReply) // 调试日志
    console.log('解析后的关键词:', parsed.keywords) // 调试日志

    // 检查用户选择的强度是否有效
    const hasValidUserIntensity = userIntensity !== null && userIntensity !== undefined && userIntensity !== '' && !isNaN(userIntensity)
    
    const updateData = {
      // 保留用户手动选择的情绪类型和强度，只有在用户没有选择时才使用AI分析结果
      emotionType: userEmotionType || parsed.emotionType || '其他',
      emotionIntensity: hasValidUserIntensity ? userIntensity : (typeof parsed.emotionIntensity === 'number' ? parsed.emotionIntensity : null),
      empathyReply: parsed.empathyReply || '',
      keywords: parsed.keywords || [],
      recommendation: parsed.recommendation || null
    }
    
    console.log('用户强度有效性检查:', {
      userIntensity,
      hasValidUserIntensity,
      aiIntensity: parsed.emotionIntensity,
      finalIntensity: updateData.emotionIntensity
    })
    
    console.log('准备更新数据库的数据:', updateData) // 调试日志
    console.log('最终的情绪强度:', updateData.emotionIntensity) // 调试日志
    
    // 在云函数端，update方法直接接收数据对象，不需要外层的 'data' 包装
    await db.collection('DiaryEntries').doc(entryId).update({
      data: updateData
    })

    return { ok: true }
  } catch (e) {
    console.error('Error in analyzeDiaryEntry:', e);
    if (e.response) {
      // 记录来自AI API的详细错误信息
      console.error('AI API Error Response:', e.response.data);
    }
    return { ok: false, error: e.message }
  }
}

function parseLLMText(text) {
  console.log('开始解析AI文本:', text)
  
  const emotionMap = ['快乐','平静','焦虑','悲伤','愤怒','其他']
  let emotionType = '其他'
  let intensity = null
  let empathyReply = ''
  let keywords = []
  let recommendation = null

  try {
    // 1. Extract Emotion Type
    let emotionMatch = text.match(/1\)(.*)/)
    if (emotionMatch) {
      const emotionStr = emotionMatch[1].trim()
      emotionType = emotionMap.find(k => emotionStr.includes(k)) || '其他'
    }

    // 2. Extract Intensity
    let intensityMatch = text.match(/2\)(.*)/)
    if (intensityMatch) {
      const intensityStr = intensityMatch[1].trim()
      const parsedIntensity = parseInt(intensityStr)
      if (!isNaN(parsedIntensity)) {
        intensity = Math.max(0, Math.min(10, parsedIntensity))
      }
    }

    // 3. Extract Empathy Reply
    let replyMatch = text.match(/3\)([\s\S]*?)4\)/) // Get content between 3) and 4)
    if (replyMatch) {
      empathyReply = replyMatch[1].trim()
    } else {
      // Fallback if 4) is not present
      replyMatch = text.match(/3\)([\s\S]*)/)
      if (replyMatch) {
        empathyReply = replyMatch[1].trim()
      }
    }
    // 移除可能由AI生成的前缀，如 "专业心理回复："
    empathyReply = empathyReply.replace(/^专业心理回复[：:]?\s*/, '')

    // 4. Extract Keywords
    let keywordsMatch = text.match(/4\)([\s\S]*?)5\)/) // Get content between 4) and 5)
    if (!keywordsMatch) {
      keywordsMatch = text.match(/4\)([\s\S]*)/) // Fallback if 5) is not present
    }
    if (keywordsMatch) {
      let keywordStr = keywordsMatch[1].trim()
      // 移除可能由AI生成的前缀，如 "关键词："
      keywordStr = keywordStr.replace(/^关键词[：:]?\s*/, '')
      keywords = keywordStr.split(/[、,，]/).map(k => k.trim()).filter(k => k.length > 0)
    }

    // 5. Extract Recommendation
    let recommendationMatch = text.match(/5\)(.*)/)
    if (recommendationMatch) {
      const recommendationStr = recommendationMatch[1].trim() // e.g., [歌曲]作品名-推荐理由
      const typeMatch = recommendationStr.match(/\[(.*?)\]/) // e.g., ["歌曲"]
      if (typeMatch) {
        const type = typeMatch[1]
        const rest = recommendationStr.substring(typeMatch[0].length).trim() // e.g., 作品名-作者-推荐理由
        const parts = rest.split(/[-—–]/) // Split by different dash types
        if (parts.length >= 3) {
          const title = parts[0].trim()
          const author = parts[1].trim()
          const reason = parts.slice(2).join('-').trim()
          recommendation = { type, title, author, reason }
        } else if (parts.length >= 2) { // Fallback for cases without author
          const title = parts[0].trim()
          const reason = parts.slice(1).join('-').trim()
          recommendation = { type, title, author: '未知', reason }
        }
      }
    }

  } catch (error) {
    console.error('解析AI文本时出错:', error)
  }

  console.log('解析的情绪类型:', emotionType)
  console.log('解析的情绪强度:', intensity)
  console.log('解析的回复内容:', empathyReply)
  console.log('解析的关键词:', keywords)
  console.log('解析的推荐:', recommendation)
  
  return { 
    emotionType, 
    emotionIntensity: intensity, 
    empathyReply: empathyReply || '感谢你愿意与我分享这些感受。作为你的心理医生，我理解大学生活中的各种挑战和压力。你的感受是正常的，也是值得被倾听的。让我们一起探索这些情绪背后的意义，找到适合你的应对方式。记住，寻求帮助本身就是一种力量。无论你遇到什么困难，都要相信自己的内在力量，同时也要学会寻求支持。大学生活是一个成长的过程，每一个挑战都是让你变得更强大的机会。', 
    keywords: keywords.length > 0 ? keywords : ['心理支持', '情感陪伴', '专业指导'],
    recommendation
  }
}
