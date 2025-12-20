// pages/home/test/SDS/SDS.js
Page({
  data: {
    questions: [
      '我觉得闷闷不乐，情绪低沉',
      '我觉得一天之中早晨最好',
      '我一阵阵地哭出来或觉得想哭',
      '我晚上睡眠不好',
      '我吃得跟平常一样多',
      '我与异性密切接触时和以往一样感到愉快',
      '我发觉我的体重在下降',
      '我有便秘的苦恼',
      '我心跳比平常快',
      '我无缘无故地感到疲乏',
      '我的头脑跟平常一样清楚',
      '我觉得经常做的事情并没有困难',
      '我觉得不安而平静不下来',
      '我对将来抱有希望',
      '我比平常容易生气激动',
      '我觉得做出决定是容易的',
      '我觉得自己是个有用的人，有人需要我',
      '我的生活过得很有意思',
      '我认为如果我死了别人会生活得好些',
      '平常感兴趣的事我仍然感兴趣'
    ],
    options: [
      { id: 1, text: '从不或很少' },
      { id: 2, text: '有时' },
      { id: 3, text: '经常' },
      { id: 4, text: '总是或持续' }
    ],
    currentQuestionIndex: 0,
    answers: {},
    selectedOptionId: null,
    submitButtonEnabled: false,
    reverseQuestions: [1, 4, 5, 10, 11, 12, 15, 16, 17, 18, 19] // 反向计分题编号（从0开始索引）
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
      url: `/home/test/SDS/result/result?score=${rawScore}`
    });
  }
});
