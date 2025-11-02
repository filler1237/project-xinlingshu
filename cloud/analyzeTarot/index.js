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
    // 1. 构建结构化的牌阵信息
    const cardDetails = selectedCards.map((card, index) => {
      const position = ['过去', '现在', '未来'][index];
      const status = card.isReversed ? '逆位' : '正位';
      return `- **${position}**: ${card.name} (${status})`;
    }).join('\n');

    // 2. 构建专家级Prompt
    const prompt = `你是一位融合了心理学知识的现代塔罗解读大师，善于从牌面中洞察人生的智慧。请根据我提供的三牌阵信息，为一位当代中国大学生进行一次深刻且富有启发性的解读。

**核心牌阵信息**
这是一个经典的三牌阵，分别代表：
${cardDetails}

**解读要求**
1.  **角色与风格**: 请以一位智慧、温暖、积极的引导者的口吻进行解读。语言风格应亲切、易懂，能引起大学生的共鸣。
2.  **内容焦点**: 解读必须重点围绕**学业/事业**和**感情生活**这两个核心方面展开。
3.  **解读结构**:
    *   首先，简要分析每张牌在各自位置上的核心含义。
    *   然后，将三张牌的信息串联起来，进行一个有逻辑、有深度的综合解读，揭示从过去到现在再到未来的发展脉络和内在联系。
    *   最后，基于综合解读，为问卜者在学业/事业和感情方面提供具体、积极、可行的行动建议。
4.  **格式与长度**:
    *   **纯文本**: 输出结果必须是纯文本，可以使用表情符号以增加亲和力，但绝不能包含任何Markdown符号（如\`#\`, \`*\`, \`-\`等）。
    *   **字数限制**: 全部内容严格控制在500汉字以内，确保内容精炼、重点突出。

请直接开始你的解读。`;

    const response = await axios.post(
      LLM_URL,
      {
        model: 'deepseek-chat', // 或者您正在使用的其他模型
        messages: [
          { role: 'system', content: '你是一位融合了心理学知识的现代塔罗解读大师，为用户提供温暖、深刻、积极的指引。' },
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
