// pages/home/test/SAS/SAS.js
Page({
  data: {
    questions: [
      '我感到比平时容易紧张和着急',
      '我无缘无故感到害怕',
      '我容易心里烦乱或觉得惊恐',
      '我觉得可能将要发疯',
      '我觉得一切都很好，也不会发生什么不幸',
      '我手脚发抖打颤',
      '我因为头痛、颈痛和背痛而苦恼',
      '我感觉容易衰弱和疲乏',
      '我觉得心平气和，并且容易安静坐着',
      '我觉得心跳得很快',
      '我因为一阵阵头晕而苦恼',
      '我有晕倒发作或觉得要晕倒似的',
      '我呼气吸气都感到很容易',
      '我手脚麻木和刺痛',
      '我因为胃痛和消化不良而苦恼',
      '我常常要小便',
      '我手常常是干燥温暖的',
      '我脸红发热',
      '我容易入睡并且一夜睡得很好',
      '我做恶梦'
    ],
    options: [
      { id: 1, text: '没有或很少时间' },
      { id: 2, text: '小部分时间' },
      { id: 3, text: '相当多时间' },
      { id: 4, text: '绝大部分或全部时间' }
    ],
    currentQuestionIndex: 0,
    answers: {},
    selectedOptionId: null,
    submitButtonEnabled: false,
    reverseQuestions: [4, 8, 12, 16, 18] // 反向计分题编号（从0开始索引）
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
      let score = this.data.answers[i];
      // 反向计分题：实际得分 = 5 - 选择分
      if (this.data.reverseQuestions.includes(i)) {
        score = 5 - score;
      }
      rawScore += score;
    }

    // 跳转到结果页面
    wx.redirectTo({
      url: `/home/test/SAS/result/result?score=${rawScore}`
    });
  }
});
