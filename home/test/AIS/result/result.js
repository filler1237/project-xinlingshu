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

    if (rawScore <= 3) {
      resultText = '您的睡眠质量在正常范围。您的失眠症状评分较低，表明您当前睡眠状况良好，没有明显的失眠问题。';
      adviceText = '继续保持良好的睡眠卫生习惯，包括规律作息、舒适的睡眠环境和适当的运动。保持积极的生活方式，避免过度疲劳。';
      scoreLevel = '无失眠';
    } else if (rawScore <= 5) {
      resultText = '您可能存在轻微的睡眠问题。您的评分显示出一些失眠倾向，但程度较轻，可能与暂时性压力或生活变化有关。';
      adviceText = '建议改善睡眠卫生，如保持规律的作息时间、睡前放松、避免咖啡因和电子产品。观察一段时间，如果症状持续建议咨询医生。';
      scoreLevel = '可疑失眠';
    } else if (rawScore <= 10) {
      resultText = '您存在轻度失眠问题。您的评分表明失眠症状较为明显，可能影响日常功能和生活质量。';
      adviceText = '建议采取改善措施，如认知行为疗法、放松训练或药物辅助。咨询睡眠专科医生进行评估，找出潜在原因并制定治疗方案。';
      scoreLevel = '轻度失眠';
    } else if (rawScore <= 15) {
      resultText = '您存在中度失眠问题。您的评分显示出明显的睡眠障碍，可能严重影响日常生活和工作学习。';
      adviceText = '强烈建议寻求专业医疗帮助，咨询睡眠科医生。可能需要综合治疗，包括药物治疗、心理治疗和生活方式调整。及早干预可以改善预后。';
      scoreLevel = '中度失眠';
    } else {
      resultText = '您的失眠问题较为严重。评分显示出重度的睡眠障碍，可能伴随焦虑、抑郁等情绪问题，严重影响生活质量。';
      adviceText = '立即寻求专业医疗帮助，咨询精神科或睡眠科医生。可能需要系统评估和综合治疗方案，包括药物、心理治疗和生活方式干预。及早治疗至关重要。';
      scoreLevel = '重度失眠';
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