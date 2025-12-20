Page({
  data: {
    score: 0,
    resultText: '',
    adviceText: '',
    scoreLevel: ''
  },

  onLoad(options) {
    const score = parseInt(options.score) || 0;
    this.calculateResult(score);
  },

  calculateResult(rawScore) {
    let resultText = '';
    let adviceText = '';
    let scoreLevel = '';

    if (rawScore <= 11) {
      resultText = '您的心理健康状态良好。您的评分显示出稳定的心理状态，没有明显的心理压力或困扰。';
      adviceText = '继续保持积极的生活方式，注意工作与休息的平衡，保持良好的社交关系和兴趣爱好。如果遇到暂时性压力，可以通过运动、冥想或与朋友交流来缓解。';
      scoreLevel = '心理健康良好';
    } else if (rawScore <= 15) {
      resultText = '您存在轻度心理困扰。您的评分表明存在一定程度的情绪紧张或疲惫感，但尚未严重影响日常生活。';
      adviceText = '建议关注自身情绪变化，尝试通过调整作息、增加运动或学习放松技巧来改善。保持规律生活，避免过度疲劳。如果症状持续，建议咨询心理咨询师。';
      scoreLevel = '轻度心理困扰';
    } else if (rawScore <= 20) {
      resultText = '您存在中度心理困扰。您的评分显示出焦虑、压抑或睡眠问题等症状，已经开始影响日常生活和工作学习。';
      adviceText = '建议寻求专业帮助，可以咨询心理医生进行评估。结合心理治疗和生活方式调整，如改善睡眠卫生、学习压力管理技巧。及早干预可以有效改善状况。';
      scoreLevel = '中度心理困扰';
    } else {
      resultText = '您的心理困扰较为明显。评分显示出明显的焦虑或抑郁倾向，可能严重影响生活质量和工作能力。';
      adviceText = '强烈建议立即寻求专业医疗帮助，咨询精神科医生或心理治疗师。可能需要综合治疗方案，包括药物治疗、心理治疗和生活方式干预。及早治疗至关重要，不要忽视心理健康问题。';
      scoreLevel = '重度心理困扰';
    }

    this.setData({
      score: rawScore,
      resultText,
      adviceText,
      scoreLevel
    });
  },

  goHome() {
    wx.redirectTo({
      url: '/home/test/test'
    });
  }
});