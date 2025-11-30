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
          '你在面对任务与挑战时，通常能够保持积极、主动和有信心的态度。你相信自己可以通过努力解决问题，这让你更可能在学习、项目和人际互动中取得良好成果。',
          '你的行动力和坚持力是非常重要的优势。'
        ],
        advice: [
          '继续设定具有挑战性的目标',
          '记录成功经验',
          '偶尔也给自己一些喘息空间',
          '带动周围的人'
        ]
      },
      medium: {
        level: '中',
        texts: [
          '你在自己熟悉的事情上通常很稳，而面对更未知或更复杂的任务时，会更慎重、谨慎地评估。你并不是缺乏能力，而是可能更习惯在“确认自己有把握”之后才行动。',
          '你的自我效能感是可以显著提升的，只需要一些结构化的练习。'
        ],
        advice: [
          '把任务拆成小块',
          '先做一小步',
          '允许自己不完美也能开始',
          '让自己体验更多“可控成功”'
        ]
      },
      low: {
        level: '低',
        texts: [
          '你在面对任务或挑战时，更容易产生犹豫、担心或不确定感。这样的反应很常见，也与能力无关。你的表现更像是受到“预期困难”影响，而不是任务本身。',
          '你并不是做不到事情，只是需要一些更温和、更循序渐进的方式让你逐步建立信心。'
        ],
        advice: [
          '从最小的行动开始',
          '把注意力从结果转到过程',
          '用“能做到什么？”替换“要做到完美吗？”',
          '给自己更多正向反馈',
          '在需要时寻求一点点支持'
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
    } else if (score >= 5) {
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
