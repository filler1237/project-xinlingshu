Page({
  data: {
    score: 0,
    scoreLevel: '',
    showAdvice: false,
    resultContent: [],
    adviceContent: [],
    resultMapping: {
      high: {
        level: '高',
        texts: [
          '你展现了出色的适应能力，能自如地应对生活中的不确定性。',
          '在变化面前，你倾向于保持冷静和乐观，并能迅速找到新的平衡点。',
          '这种灵活性让你能抓住机遇，将挑战转化为成长的阶梯。'
        ],
        advice: [
          '继续保持开放心态，尝试接触不同领域的新鲜事物。',
          '可以将你的适应策略分享给他人，共同成长。',
          '定期反思，总结成功经验，内化为自己的心智模型。'
        ]
      },
      medium: {
        level: '中',
        texts: [
          '你具备良好的适应能力，大多数情况下能有效应对变化。',
          '有时你可能会对突发状况感到短暂的压力，但通常能通过思考和调整，逐步找到解决方案。',
          '在稳定与变化之间，你正在学习如何更好地找到自己的节奏。'
        ],
        advice: [
          '尝试主动设置一些小挑战，锻炼自己应对突发状况的能力。',
          '学习正念冥想，提升压力管理和情绪调节能力。',
          '从小处着手，练习在日常生活中做出一些积极的小改变。'
        ]
      },
      low: {
        level: '低',
        texts: [
          '你似乎更喜欢稳定和可预测的环境，变化有时会让你感到不安。',
          '面对不确定性时，你可能会感到一些压力，需要时间来调整和适应。',
          '认识到这一点是成长的第一步，每个人都有自己独特的节奏。'
        ],
        advice: [
          '从舒适区边缘开始，尝试一些小的、可控的变化。',
          '将大的不确定性分解为小的、具体的步骤，逐一应对。',
          '寻求朋友或家人的支持，分享你的感受，不必独自面对。'
        ]
      }
    }
  },

  onLoad(options) {
    const score = parseInt(options.score, 10);
    this.setResult(score);
  },

  setResult(score) {
    let level;
    if (score >= 8) {
      level = 'high';
    } else if (score >= 4) {
      level = 'medium';
    } else {
      level = 'low';
    }
    
    this.setData({
      score: score,
      scoreLevel: this.data.resultMapping[level].level,
      resultContent: this.data.resultMapping[level].texts,
      adviceContent: this.data.resultMapping[level].advice
    });
  },

  toggleView() {
    this.setData({
      showAdvice: !this.data.showAdvice
    });
  },

  goHome() {
    wx.redirectTo({
      url: '/home/test/test'
    });
  }
});
