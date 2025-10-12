const cloud = require('wx-server-sdk');
const got = require('got'); // 用于发起网络请求

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const LLM_URL = 'https://api.deepseek.com/v1/chat/completions';
// 从环境变量中获取 API Key，您需要在云函数配置中设置好 LLM_API_KEY
const LLM_API_KEY = process.env.LLM_API_KEY;

// 64卦数据 - 源自维基百科，并按二进制码（初爻至上爻）排序
// 编码规则：1代表阳爻（⚊），0代表阴爻（⚋）。二进制码字符串从左到右依次代表初爻（底）至上爻（顶）。
const hexagrams = {
    "000000": { "name": "坤", "pinyin": "kūn", "constitution": "上坤下坤" },
    "000001": { "name": "剥", "pinyin": "bō", "constitution": "上艮下坤" },
    "000010": { "name": "比", "pinyin": "bǐ", "constitution": "上坎下坤" },
    "000011": { "name": "观", "pinyin": "guān", "constitution": "上巽下坤" },
    "000100": { "name": "豫", "pinyin": "yù", "constitution": "上震下坤" },
    "000101": { "name": "晋", "pinyin": "jìn", "constitution": "上离下坤" },
    "000110": { "name": "萃", "pinyin": "cuì", "constitution": "上兑下坤" },
    "000111": { "name": "否", "pinyin": "pǐ", "constitution": "上乾下坤" },
    "001000": { "name": "谦", "pinyin": "qiān", "constitution": "上坤下艮" },
    "001001": { "name": "艮", "pinyin": "gèn", "constitution": "上艮下艮" },
    "001010": { "name": "蹇", "pinyin": "jiǎn", "constitution": "上坎下艮" },
    "001011": { "name": "渐", "pinyin": "jiàn", "constitution": "上巽下艮" },
    "001100": { "name": "小过", "pinyin": "xiǎo guò", "constitution": "上震下艮" },
    "001101": { "name": "旅", "pinyin": "lǚ", "constitution": "上离下艮" },
    "001110": { "name": "咸", "pinyin": "xián", "constitution": "上兑下艮" },
    "001111": { "name": "遁", "pinyin": "dùn", "constitution": "上乾下艮" },
    "010000": { "name": "师", "pinyin": "shī", "constitution": "上坤下坎" },
    "010001": { "name": "蒙", "pinyin": "méng", "constitution": "上艮下坎" },
    "010010": { "name": "坎", "pinyin": "kǎn", "constitution": "上坎下坎" },
    "010011": { "name": "涣", "pinyin": "huàn", "constitution": "上巽下坎" },
    "010100": { "name": "解", "pinyin": "jiě", "constitution": "上震下坎" },
    "010101": { "name": "未济", "pinyin": "wèi jì", "constitution": "上离下坎" },
    "010110": { "name": "困", "pinyin": "kùn", "constitution": "上兑下坎" },
    "010111": { "name": "讼", "pinyin": "sòng", "constitution": "上乾下坎" },
    "011000": { "name": "升", "pinyin": "shēng", "constitution": "上坤下巽" },
    "011001": { "name": "蛊", "pinyin": "gǔ", "constitution": "上艮下巽" },
    "011010": { "name": "井", "pinyin": "jǐng", "constitution": "上坎下巽" },
    "011011": { "name": "巽", "pinyin": "xùn", "constitution": "上巽下巽" },
    "011100": { "name": "恒", "pinyin": "héng", "constitution": "上震下巽" },
    "011101": { "name": "鼎", "pinyin": "dǐng", "constitution": "上离下巽" },
    "011110": { "name": "大过", "pinyin": "dà guò", "constitution": "上兑下巽" },
    "011111": { "name": "姤", "pinyin": "gòu", "constitution": "上乾下巽" },
    "100000": { "name": "复", "pinyin": "fù", "constitution": "上坤下震" },
    "100001": { "name": "颐", "pinyin": "yí", "constitution": "上艮下震" },
    "100010": { "name": "屯", "pinyin": "zhūn", "constitution": "上坎下震" },
    "100011": { "name": "益", "pinyin": "yì", "constitution": "上巽下震" },
    "100100": { "name": "震", "pinyin": "zhèn", "constitution": "上震下震" },
    "100101": { "name": "噬嗑", "pinyin": "shì hé", "constitution": "上离下震" },
    "100110": { "name": "随", "pinyin": "suí", "constitution": "上兑下震" },
    "100111": { "name": "无妄", "pinyin": "wú wàng", "constitution": "上乾下震" },
    "101000": { "name": "明夷", "pinyin": "míng yí", "constitution": "上坤下离" },
    "101001": { "name": "贲", "pinyin": "bì", "constitution": "上艮下离" },
    "101010": { "name": "既济", "pinyin": "jì jì", "constitution": "上坎下离" },
    "101011": { "name": "家人", "pinyin": "jiā rén", "constitution": "上巽下离" },
    "101100": { "name": "丰", "pinyin": "fēng", "constitution": "上震下离" },
    "101101": { "name": "离", "pinyin": "lí", "constitution": "上离下离" },
    "101110": { "name": "革", "pinyin": "gé", "constitution": "上兑下离" },
    "101111": { "name": "同人", "pinyin": "tóng rén", "constitution": "上乾下离" },
    "110000": { "name": "临", "pinyin": "lín", "constitution": "上坤下兑" },
    "110001": { "name": "损", "pinyin": "sǔn", "constitution": "上艮下兑" },
    "110010": { "name": "节", "pinyin": "jié", "constitution": "上坎下兑" },
    "110011": { "name": "中孚", "pinyin": "zhōng fú", "constitution": "上巽下兑" },
    "110100": { "name": "归妹", "pinyin": "guī mèi", "constitution": "上震下兑" },
    "110101": { "name": "睽", "pinyin": "kuí", "constitution": "上离下兑" },
    "110110": { "name": "兑", "pinyin": "duì", "constitution": "上兑下兑" },
    "110111": { "name": "履", "pinyin": "lǚ", "constitution": "上乾下兑" },
    "111000": { "name": "泰", "pinyin": "tài", "constitution": "上坤下乾" },
    "111001": { "name": "大畜", "pinyin": "dà chù", "constitution": "上艮下乾" },
    "111010": { "name": "需", "pinyin": "xū", "constitution": "上坎下乾" },
    "111011": { "name": "小畜", "pinyin": "xiǎo chù", "constitution": "上巽下乾" },
    "111100": { "name": "大壮", "pinyin": "dà zhuàng", "constitution": "上震下乾" },
    "111101": { "name": "大有", "pinyin": "dà yǒu", "constitution": "上离下乾" },
    "111110": { "name": "夬", "pinyin": "guài", "constitution": "上兑下乾" },
    "111111": { "name": "乾", "pinyin": "qián", "constitution": "上乾下乾" }
};

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('--- 云函数 analyzeHexagram 开始执行 ---');
  console.log('接收到的前端事件 (event):', JSON.stringify(event, null, 2));

  const { originalLines, changedLines, movingLinesCount } = event;

  // --- 1. 精确计算所有相关卦象 ---
  const lineSymbolToBinary = (line) => (line === '⚊' ? '1' : '0');

  // 修正：前端传来的爻是从初爻到上爻（bottom-to-top），数据表的键也是如此，因此直接转换即可。
  const originalBinary = originalLines.split('').map(lineSymbolToBinary).join('');

  // 本卦
  const originalHexagram = hexagrams[originalBinary] || { name: '未知', constitution: '' };

  // 变卦
  let changedHexagram = { name: '无', constitution: '' };
  if (movingLinesCount > 0) {
    const changedBinary = changedLines.split('').map(lineSymbolToBinary).join('');
    changedHexagram = hexagrams[changedBinary] || { name: '未知', constitution: '' };
  }

  // 综卦 (Zong Gua): 垂直颠倒卦象，相当于反转 top-to-bottom 的二进制码。
  const zongBinary = originalBinary.split('').reverse().join('');
  const zongHexagram = hexagrams[zongBinary] || { name: '未知', constitution: '' };

  // 错卦 (Cuo Gua): 每爻阴阳取反。
  const cuoBinary = originalBinary.split('').map(b => (b === '1' ? '0' : '1')).join('');
  const cuoHexagram = hexagrams[cuoBinary] || { name: '未知', constitution: '' };

  // 互卦 (Hu Gua): 由内卦组成。
  // originalBinary 是 top-to-bottom (爻 6, 5, 4, 3, 2, 1)
  // 互卦上卦 = 原卦 5, 4, 3爻 -> originalBinary.substring(1, 4)
  // 互卦下卦 = 原卦 4, 3, 2爻 -> originalBinary.substring(2, 5)
  const huBinary = originalBinary.substring(1, 4) + originalBinary.substring(2, 5);
  const huHexagram = hexagrams[huBinary] || { name: '无', constitution: '' };

  // --- 2. 明确找出动爻位置和爻题 ---
  const movingLineInfos = [];
  if (movingLinesCount > 0) {
    for (let i = 0; i < originalLines.length; i++) {
      if (originalLines[i] !== changedLines[i]) {
        const isYang = originalLines[i] === '⚊';
        const lineName = isYang ? '九' : '六';
        const positionName = [ '初', '二', '三', '四', '五', '上' ][i];
        movingLineInfos.push(`${positionName}${lineName}`);
      }
    }
  }

  // --- 3. 构建专家级Prompt ---
  let prompt = `你是一位精通《易经》、学识渊博的智者。请根据我提供的、已经过精确计算的完整占卜信息，进行一次全面、深刻、多维度的解读。

**核心占卜信息**
- **本卦**: ${originalHexagram.name} (${originalHexagram.constitution}) - 代表当前的核心状况。
- **变卦**: ${changedHexagram.name} ${changedHexagram.constitution ? `(${changedHexagram.constitution})` : ''} - 代表未来的发展趋势或最终结果。
- **动爻**: ${movingLineInfos.length > 0 ? movingLineInfos.join('、') : '无'} - 指明了当前状况中变化的关键点。

**深层结构信息 (用于辅助分析)**
- **综卦**: ${zongHexagram.name} - 代表从事物的反面或对方的视角来看待当前状况。
- **错卦**: ${cuoHexagram.name} - 代表当前状况中隐藏的对立力量或潜在的挑战。
- **互卦**: ${huHexagram.name} - 揭示了当前状况内部的核心矛盾、发展过程或“案中案”。

**解卦规则**
请严格遵守以下为你提供的动爻分析规则：
`;

  let rule = '';
  switch (movingLinesCount) {
    case 0: rule = '0爻动（静卦）：以本卦卦辞、象辞为核心，并结合综卦、错卦、互卦提供的多维视角进行综合解读。'; break;
    case 1: rule = `1爻动：以本卦的动爻（${movingLineInfos[0]}）爻辞为核心，变卦为辅助，并结合综卦、错卦、互卦进行丰富和深化解读。`; break;
    case 2: rule = `2爻动：以本卦的两个动爻（${movingLineInfos.join('、')}）爻辞为核心（以上爻为主），并结合综卦、错卦、互卦进行综合分析。`; break;
    case 3: rule = '3爻动：本卦和变卦并重，以变卦为最终导向，同时参考综卦、错卦、互卦来理解这一转变的深层原因和内在结构。'; break;
    case 4: rule = '4爻动：以本卦的两个静爻爻辞为核心（以下爻为主），并结合综卦、错卦、互卦来理解不变因素中的智慧。'; break;
    case 5: rule = '5爻动：以变卦的卦辞、象辞为核心，并结合本卦的综卦、错卦、互卦来理解为何会发生如此大的转变。'; break;
    case 6: rule = '6爻全动：物极必反，直接解读变卦的卦辞、象辞，同时参考本卦的错卦（因为六爻全变得到了错卦）来理解其根本性的转变。'; break;
  }
  prompt += rule;

  prompt += `

**解读要求**
1.  **目标用户**: 你的解读对象是当代中国的大学生，请使用他们熟悉、亲切且积极向上的语言风格，同时不失专业性。
2.  **内容焦点**: 解读必须重点围绕**学业/事业**和**感情生活**这两个核心方面展开，提供具体、可行的建议，同时给出比较重要的爻辞。可以先用一些专业的术语分析爻辞，接下来再结合适合大学生的语言风格描述。
3.  **格式与长度**:
    *   **纯文本**: 输出结果必须是纯文本，绝不能包含任何Markdown符号（如\`#\`, \`*\`, \`-\`等），可以有表情符号。
    *   **字数限制**: 全部内容严格控制在1000汉字以内。
4.  **整合分析**: 将所有卦象信息（本卦、变卦、动爻、综卦、错卦、互卦）融合成一个有机的整体，为学业和感情提供富有洞察力的、结构清晰的分析。

请直接开始你的解读。`;

  console.log('--- 构造的 Prompt 如下 ---');
  console.log(prompt);
  console.log('--------------------------');

  // 2. 调用 AI API
  try {
    const response = await got.post(LLM_URL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`
      },
      json: {
        model: "deepseek-chat", // 或者您使用的其他模型
        messages: [
          { "role": "system", "content": "你是一位精通《易经》的智者，能够根据用户提供的卦象信息，给出深刻而富有哲理的解读。" },
          { "role": "user", "content": prompt }
        ],
        stream: false
      },
      responseType: 'json'
    });

    if (response.body && response.body.choices && response.body.choices[0]) {
      const aiResult = response.body.choices[0].message.content;
      
      // 返回结构化数据
      return {
        success: true,
        analysis: {
          originalHexagram: originalHexagram,
          changedHexagram: changedHexagram,
          movingLineInfos: movingLineInfos,
          aiInterpretation: aiResult,
          // 辅助信息，前端可以根据需要展示
          supplementaryInfo: {
            zongHexagram: zongHexagram,
            cuoHexagram: cuoHexagram,
            huHexagram: huHexagram
          }
        }
      };
    } else {
      throw new Error('AI API a-normal response structure');
    }

  } catch (error) {
    console.error('调用 AI API 时发生错误:', error);
    // 如果是 got 的 HTTPError，打印更详细的信息
    if (error.response) {
      console.error('API 响应体:', error.response.body);
    }
    return {
      success: false,
      error: '调用 AI 服务失败，请稍后再试。'
    };
  }
};
