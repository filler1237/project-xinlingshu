Page({
  data: {
    question: ''
  },

  onQuestionInput(event) {
    this.setData({
      question: event.detail.value
    });
  },

  submitQuestion() {
    if (this.data.question.trim() === '') {
      wx.showToast({
        title: '问题不能为空',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: `/home/card/card?question=${encodeURIComponent(this.data.question)}`
    });
  }
});
