// pages/home/test/GHQ/GHQ.js
Page({
  data: {
    questions: [
      '能集中精神处理问题吗？',
      '为忧虑而失眠吗？',
      '感到在处理事情中起着积极作用吗？',
      '对处理事情能做出决策吗？',
      '感到有压力吗？',
      '感到无法克服困难吗？',
      '能享受日常的生活吗？',
      '能面对困难吗？',
      '感到不开心和沮丧吗？',
      '对自己失去信心吗？',
      '认为自己是一个没有价值的人吗？',
      '感到生活美满，心情愉快吗？'
    ],
    options: [
      { id: 0, text: '比平时好' },
      { id: 1, text: '与平时一样' },
      { id: 2, text: '比平时差' },
      { id: 3, text: '比平时差很多' }
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
      url: `/home/test/GHQ/result/result?score=${rawScore}`
    });
  }
});
