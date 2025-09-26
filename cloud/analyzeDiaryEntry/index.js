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

    // 内容安全（示例：仅演示，不调用外部接口）
    if (content.length > 2000) {
      return { ok: false, error: 'content too long' }
    }

    // 调用你的 LLM 网关（OpenAI 兼容/自建接口均可）
    const prompt = [
      { 
        role: 'system', 
        content: `你是一位专业的心理医生，专门处理大学生的心理问题。你具备以下特点：
1. 专业背景：心理学博士，有10年大学生心理咨询经验
2. 沟通风格：温和、专业、共情，像朋友一样倾听
3. 专业能力：能识别情绪状态、提供专业建议、给予情感支持
4. 目标群体：18-25岁的大学生，理解他们的学业压力、人际关系、未来焦虑等
5. 回复原则：专业但不生硬，温暖但不越界，给予希望和力量

请严格按照以下格式回复，每行一个项目，不要添加其他内容：
1)情绪类别
2)强度数字
3)专业心理回复
4)关键词，用逗号分隔` 
      },
      { 
        role: 'user', 
        content: `请以专业心理医生的身份分析这位大学生的日记，严格按照格式回复：

1)情绪类别（快乐/平静/焦虑/悲伤/愤怒/其他）
2)强度（0-10的数字）
3)专业心理回复（150-200字，体现专业性和温暖，针对大学生心理特点，给予具体建议和情感支持）
4)关键词（2-5个，用逗号分隔）

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
      keywords: parsed.keywords || []
    }
    
    console.log('用户强度有效性检查:', {
      userIntensity,
      hasValidUserIntensity,
      aiIntensity: parsed.emotionIntensity,
      finalIntensity: updateData.emotionIntensity
    })
    
    console.log('准备更新数据库的数据:', updateData) // 调试日志
    console.log('最终的情绪强度:', updateData.emotionIntensity) // 调试日志
    
    await db.collection('DiaryEntries').doc(entryId).update({
      data: updateData
    })

    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// 清理AI回复内容的函数
function cleanReplyContent(content) {
  if (!content) return ''
  
  return content
    .replace(/^[1-4]\)\s*/g, '') // 移除数字标记
    .replace(/^\d+\s*/g, '') // 移除开头的数字
    .replace(/^[平静|快乐|焦虑|悲伤|愤怒|其他]\s*/g, '') // 移除情绪类型
    .replace(/^强度[：:]\s*\d+\s*/g, '') // 移除强度标记
    .replace(/^[平淡|日常|无感|心理支持|情感陪伴|专业指导][;；,，]\s*/g, '') // 移除关键词
    .replace(/^[1-9]\s*/g, '') // 移除开头的单个数字
    .replace(/^[平静|快乐|焦虑|悲伤|愤怒|其他]\s*/g, '') // 再次移除情绪类型
    .replace(/^强度[：:]\s*\d+\s*/g, '') // 再次移除强度标记
    .replace(/^[平淡|日常|无感|心理支持|情感陪伴|专业指导][;；,，]\s*/g, '') // 再次移除关键词
    .trim()
}

function parseLLMText(text) {
  console.log('开始解析AI文本:', text) // 调试日志
  
  // 改进的解析逻辑
  const emotionMap = ['快乐','平静','焦虑','悲伤','愤怒','其他']
  
  // 大学生常见心理问题关键词映射
  const collegeKeywords = {
    '学业': ['学习', '考试', '作业', '成绩', '挂科', '论文', '毕业'],
    '人际关系': ['室友', '同学', '朋友', '社交', '孤独', '恋爱', '分手'],
    '未来焦虑': ['就业', '工作', '考研', '实习', '未来', '迷茫', '选择'],
    '家庭': ['父母', '家庭', '经济', '压力', '期望'],
    '自我认知': ['自信', '自卑', '价值', '意义', '成长']
  }
  
  let emotionType = '其他'
  let intensity = null
  let empathyReply = ''
  let keywords = []
  
  try {
    // 解析格式化的回复，如：1)平静 2)4 3)回复内容 4)关键词
    const lines = text.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // 解析情绪类型：1)平静
      if (trimmed.match(/^1\)/)) {
        const emotion = trimmed.replace(/^1\)/, '').trim()
        emotionType = emotionMap.find(k => emotion.includes(k)) || '其他'
      }
      
      // 解析强度：2)4
      if (trimmed.match(/^2\)/)) {
        const intensityStr = trimmed.replace(/^2\)/, '').trim()
        const parsedIntensity = parseInt(intensityStr)
        if (!isNaN(parsedIntensity)) {
          intensity = Math.max(0, Math.min(10, parsedIntensity))
        }
      }
      
      // 解析回复内容：3)回复内容
      if (trimmed.match(/^3\)/)) {
        empathyReply = cleanReplyContent(trimmed.replace(/^3\)/, '').trim())
        
        // 如果清理后内容为空，使用原始内容
        if (!empathyReply) {
          empathyReply = trimmed.replace(/^3\)/, '').trim()
        }
      }
      
      // 解析关键词：4)关键词
      if (trimmed.match(/^4\)/)) {
        const keywordStr = trimmed.replace(/^4\)/, '').trim()
        keywords = keywordStr.split(/[、,，]/).map(k => k.trim()).filter(k => k.length > 0)
      }
    }
    
    // 如果没有找到格式化回复，尝试其他解析方式
    if (!empathyReply) {
      // 查找情绪类型
      emotionType = emotionMap.find(k => text.includes(k)) || '其他'
      
      // 查找强度 - 优先查找数字格式
      const intensityPatterns = [
        /(\d+)\s*\/?\s*10/,           // 8/10 或 8
        /强度[：:]\s*(\d+)/,           // 强度：8
        /(\d+)\s*分/,                 // 8分
        /强度\s*(\d+)/,               // 强度8
        /(\d+)\s*级/,                 // 8级
        /(\d+)\s*度/                  // 8度
      ]
      
      for (const pattern of intensityPatterns) {
        const match = text.match(pattern)
        if (match) {
          intensity = parseInt(match[1])
          if (intensity > 10) intensity = 10
          if (intensity < 0) intensity = 0
          break
        }
      }
      
      // 提取回复内容 - 改进提取逻辑
      if (text.includes('3)')) {
        const rawReply = text.split('3)')[1]?.split('\n')[0]?.trim() || text.split('3)')[1]?.trim()
        empathyReply = cleanReplyContent(rawReply)
      } else if (text.includes('回复：')) {
        empathyReply = text.split('回复：')[1]?.split('\n')[0]?.trim()
      } else {
        // 提取完整的句子作为回复，优先选择最长的句子
        const sentences = text.match(/[^。！？]*[。！？]/g) || []
        if (sentences.length > 0) {
          // 选择最长的句子作为回复
          empathyReply = sentences.reduce((longest, current) => 
            current.length > longest.length ? current : longest
          )
        } else {
          empathyReply = text.slice(0, 100)
        }
      }
      
      // 提取关键词 - 改进关键词提取
      if (keywords.length === 0) {
        // 先尝试从4)后面提取
        if (text.includes('4)')) {
          const keywordStr = text.split('4)')[1]?.split('\n')[0]?.trim()
          if (keywordStr) {
            keywords = keywordStr.split(/[、,，]/).map(k => k.trim()).filter(k => k.length > 0)
          }
        }
        
        // 如果没有找到，使用智能提取
        if (keywords.length === 0) {
          // 提取完整的中文词语，避免截断
          const keywordMatches = text.match(/[\u4e00-\u9fa5]{2,6}/g) || []
          // 过滤掉不完整的词语
          keywords = keywordMatches.filter(word => 
            word.length >= 2 && 
            !word.includes('1)') && 
            !word.includes('2)') && 
            !word.includes('3)') && 
            !word.includes('4)')
          ).slice(0, 5)
        }
        
        // 根据内容智能添加大学生相关关键词
        const content = text.toLowerCase()
        const additionalKeywords = []
        
        for (const [category, words] of Object.entries(collegeKeywords)) {
          if (words.some(word => content.includes(word))) {
            additionalKeywords.push(category)
          }
        }
        
        // 合并关键词，去重
        keywords = [...new Set([...keywords, ...additionalKeywords])].slice(0, 5)
      }
    }
    
  } catch (error) {
    console.error('解析AI文本时出错:', error)
    // 兜底处理 - 心理医生风格
    emotionType = emotionMap.find(k => text.includes(k)) || '其他'
    empathyReply = '我理解你愿意分享这些感受，这本身就是一种勇气。作为你的心理医生，我想告诉你，你的感受是真实且重要的。让我们一起面对这些挑战，我相信你有内在的力量去克服它们。'
    keywords = ['心理支持', '情感陪伴', '专业指导']
  }
  
  console.log('解析的情绪类型:', emotionType)
  console.log('解析的情绪强度:', intensity)
  console.log('解析的回复内容:', empathyReply)
  console.log('解析的关键词:', keywords)
  
  return { 
    emotionType, 
    emotionIntensity: intensity, 
    empathyReply: empathyReply || '感谢你愿意与我分享这些感受。作为你的心理医生，我理解大学生活中的各种挑战和压力。你的感受是正常的，也是值得被倾听的。让我们一起探索这些情绪背后的意义，找到适合你的应对方式。记住，寻求帮助本身就是一种力量。无论你遇到什么困难，都要相信自己的内在力量，同时也要学会寻求支持。大学生活是一个成长的过程，每一个挑战都是让你变得更强大的机会。', 
    keywords: keywords.length > 0 ? keywords : ['心理支持', '情感陪伴', '专业指导']
  }
}