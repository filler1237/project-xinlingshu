// pages/home/test/AIS/AIS.js
Page({
  data: {
    questions: [
      '入睡时间很长（关灯后到睡着的时间）',
      '夜间苏醒频繁',
      '比期望的时间早醒',
      '总睡眠时间不足',
      '总睡眠质量差（无论睡多长）',
      '白天情绪低落',
      '白天身体功能低下（体力或精神：如记忆力、认知力和注意力等）',
      '白天思睡'
    ],
    options: [
      { id: 0, text: '不符合' },
      { id: 1, text: '不太符合' },
      { id: 2, text: '比较符合' },
      { id: 3, text: '完全符合' }
    ],
    currentQuestionIndex: 0,
    answers: {},
    selectedOptionId: null,
    submitButtonEnabled: false
  },

  selectAnswer(event) {
    const { optionId } = event.currentTarget.dataset;
    this.setData({
      selectedOptionId: optionId
    });

    const newAnswers = { ...this.data.answers, [this.data.currentQuestionIndex]: optionId };
    this.setData({ answers: newAnswers });

    // 自动跳转到下一题或启用提交
    setTimeout(() => {
      if (this.data.currentQuestionIndex < this.data.questions.length - 1) {
        this.setData({
          currentQuestionIndex: this.data.currentQuestionIndex + 1,
          selectedOptionId: null
        });
      } else {
        this.setData({
          submitButtonEnabled: true
        });
      }
    }, 300);
  },

  goPrev() {
    if (this.data.currentQuestionIndex > 0) {
      const prevIndex = this.data.currentQuestionIndex - 1;
      this.setData({
        currentQuestionIndex: prevIndex,
        selectedOptionId: this.data.answers[prevIndex] || null
      });
    }
  },

  submit() {
    if (!this.data.submitButtonEnabled) return;

    let rawScore = 0;
    for (let i = 0; i < this.data.questions.length; i++) {
      rawScore += this.data.answers[i];
    }

    // 跳转到结果页面
    wx.redirectTo({
      url: `/home/test/AIS/result/result?score=${rawScore}`
    });
  }
});

