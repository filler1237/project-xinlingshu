Page({
  data: {
    standardScore: 0,
    resultText: '',
    adviceText: '',
    scoreLevel: ''
  },

  onLoad(options) {
    const score = parseInt(options.score) || 0;
    this.calculateResult(score);
  },

  calculateResult(rawScore) {
    // 原始分 20-80
    // 标准分 = 原始分 × 1.25
    const standardScore = Math.round(rawScore * 1.25);
    
    let resultText = '';
    let adviceText = '';
    let scoreLevel = '';

    if (standardScore < 50) {
      resultText = '您的情绪状态在正常范围。您的抑郁症状评分较低，表明您当前的情绪状态相对稳定，没有明显的抑郁倾向。';
      adviceText = '继续保持积极的生活方式，注意饮食均衡、适量运动和良好的作息。保持社交活动和情感支持网络。如果感到情绪波动，可以通过运动、冥想或与朋友交流来缓解。';
      scoreLevel = '正常';
    } else if (standardScore >= 50 && standardScore < 60) {
      resultText = '您存在轻度抑郁情绪倾向。您的评分显示出一些抑郁症状，但程度较轻，可能与近期压力、生活变化或暂时性情绪低落有关。';
      adviceText = '建议关注自身情绪变化，尝试通过运动、爱好或与亲友交流来改善心情。保持规律作息，避免过度疲劳。如果症状持续或加重，建议咨询专业心理咨询师。';
      scoreLevel = '轻度';
    } else if (standardScore >= 60 && standardScore < 70) {
      resultText = '您存在中度抑郁情绪倾向。您的评分表明抑郁症状较为明显，可能影响日常生活和工作学习，需要引起重视。';
      adviceText = '强烈建议寻求专业帮助，可以咨询心理医生或精神科医生。结合心理治疗和药物治疗（如需要）。同时，保持规律生活，建立支持系统，学习情绪管理技巧。';
      scoreLevel = '中度';
    } else {
      resultText = '您的抑郁情绪较为明显。评分显示出严重的抑郁症状，可能严重影响生活质量，需要及时专业干预。';
      adviceText = '立即寻求专业医疗帮助，咨询精神科医生进行评估。可能需要心理治疗、药物治疗或综合干预。告知家人朋友，寻求他们的支持。记住，抑郁症是可治疗的疾病，越早干预效果越好。';
      scoreLevel = '明显';
    }

    this.setData({
      standardScore,
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