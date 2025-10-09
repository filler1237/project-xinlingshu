// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// DeepSeek API 配置
const LLM_URL = 'https://api.deepseek.com/v1/chat/completions'
const LLM_API_KEY = process.env.LLM_API_KEY

// 云函数入口函数
exports.main = async (event, context) => {
  const { selectedCards } = event;

  try {
    const cardNames = selectedCards.map(c => `${c.name} ${c.isReversed ? '(逆位)' : '(正位)'}`).join('、');
    
    const prompt = `作为一位专业的塔罗牌解读师，请为我解读以下三张牌的组合：${cardNames}。` +
                   `请给出一个综合性的、富有启发性的总结建议。` +
                   `要求：解读应深刻、积极，并贴近生活。将最终结果控制在100到200字之间，不要使用任何Markdown符号（如#、*、-）。`;

    const response = await axios.post(
      LLM_URL,
      {
        model: 'deepseek-chat', // 或者您正在使用的其他模型
        messages: [
          { role: 'system', content: 'You are a professional tarot reader.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLM_API_KEY}`
        }
      }
    );

    let analysis = response.data.choices && response.data.choices.length > 0
      ? response.data.choices[0].message.content
      : '抱歉，AI分析暂时无法完成，请稍后再试。';

    // 移除Markdown等特殊符号
    analysis = analysis.replace(/[#*-]/g, '');

    return {
      analysisResult: analysis,
    };

  } catch (error) {
    console.error('DeepSeek API call failed:', error.response ? error.response.data : error.message);
    return {
      analysisResult: '分析过程中出现错误，请检查云函数日志或稍后重试。',
    };
  }
};
