// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// DeepSeek API 配置
const LLM_URL = 'https://api.deepseek.com/v1/chat/completions'
const LLM_API_KEY = process.env.LLM_API_KEY

// 云函数入口函数
exports.main = async (event, context) => {
  const { selectedCards, question } = event;

  try {
    // 1. 构建结构化的牌阵信息
    const cardDetails = selectedCards.map((card, index) => {
      const position = ['过去', '现在', '未来'][index];
      const status = card.isReversed ? '逆位' : '正位';
      return `${position}是${card.name}(${status})`;
    }).join('，');

    // 2. 构建专家级Prompt
    const prompt = `你是一位专业的心理成长导师，擅长运用塔罗牌的象征意义作为工具，来启发和引导大学生。你的解读不是“算命”，而是通过牌面，帮助他们更好地理解自己，发现成长的可能性。

**来访者信息**
-   **身份**：当代中国大学生
-   **他的提问**：“${question}”
-   **他抽到的牌**：${cardDetails}

**你的任务**
请根据以上信息，为这位同学提供一次温暖、深刻且充满力量的解读。

**解读框架（请严格遵守）**
1.  **第一段：牌面速写** (约100字)
    -   用亲切的口吻，一句话点出每张牌在此处的核心象征意义。
    -   例如：“过去的[牌名]像是在说…；现在的[牌名]提醒我们…；而未来的[牌名]则指向一种…的可能性。”

2.  **第二段：你的故事与可能性** (约200-250字)
    -   **核心要求**：将三张牌串联成一个关于这位同学的、连贯的“成长小故事”。
    -   自然地融入牌意，解释它们如何共同反映了他在“${question}”这个问题上的心理状态、行为模式以及未来的发展潜力。
    -   解读必须充满共情和积极心理学的视角，强调“当下的状态是可以理解的”、“未来的发展是可以通过努力改善的”。
    -   **绝对禁止**：宿命论、预测未来、负面标签。

3.  **第三段：行动锦囊** (每条约20字，共3条)
    -   提供3条非常具体、简单、可以在接下来24小时内就开始尝试的行动建议。
    -   建议要紧扣第二段的分析，具有可操作性。

**语言风格**
-   **温暖、真诚**：像一位耐心倾听的学长/学姐或咨询师。
-   **赋能、启发**：多用“也许你可以尝试…”、“这像是一个邀请，让你…”、“你完全有能力…”等句式。
-   **格式**：段落之间必须空一行，不要使用任何Markdown符号。

请直接开始你的解读。`;

    const response = await axios.post(
      LLM_URL,
      {
        model: 'deepseek-chat', // 或者您正在使用的其他模型
        messages: [
          { role: 'system', content: '你是一位专业的心理成长导师，擅长运用塔罗牌的象征意义作为工具，来启发和引导大学生。你的解读不是“算命”，而是通过牌面，帮助他们更好地理解自己，发现成长的可能性。' },
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

    // 将结果存入数据库
    const db = cloud.database();
    const wxContext = cloud.getWXContext();
    await db.collection('divination_records').add({
      data: {
        _openid: wxContext.OPENID,
        type: 'tarot',
        question: question,
        cards: selectedCards,
        analysis: analysis,
        createdAt: new Date(),
      }
    });

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
