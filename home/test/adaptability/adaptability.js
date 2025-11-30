Page({
  data: {
    questions: [
      { id: 1, options: [{ id: 'A', text: '我遇到变化时通常能保持冷静。' }, { id: 'B', text: '我遇到变化时会先有一阵不适应。' }] },
      { id: 2, options: [{ id: 'A', text: '面对突发状况，我会立即尝试解决。' }, { id: 'B', text: '面对突发状况，我会先理清思路再行动。' }] },
      { id: 3, options: [{ id: 'A', text: '不熟悉的情境不会影响我太久。' }, { id: 'B', text: '不熟悉的情境会让我先观察一下。' }] },
      { id: 4, options: [{ id: 'A', text: '我能在新安排下保持效率。' }, { id: 'B', text: '我在新安排下需要一点过渡。' }] },
      { id: 5, options: [{ id: 'A', text: '我会主动尝试不同方式来应对变化。' }, { id: 'B', text: '我更喜欢先验证哪种方式更安全可行。' }] },
      { id: 6, options: [{ id: 'A', text: '多变的环境让我觉得有趣。' }, { id: 'B', text: '多变的环境让我偶尔觉得不安。' }] },
      { id: 7, options: [{ id: 'A', text: '在压力下我能迅速调整策略。' }, { id: 'B', text: '在压力下我会花点时间重整心态。' }] },
      { id: 8, options: [{ id: 'A', text: '我能适应节奏突然加快的状况。' }, { id: 'B', text: '节奏突然加快会让我先卡一下。' }] },
      { id: 9, options: [{ id: 'A', text: '我对临时修改方向的事情反应相对灵活。' }, { id: 'B', text: '我对临时修改方向的事情会稍微慢半拍。' }] },
      { id: 10, options: [{ id: 'A', text: '当很多事情都在变化时，我仍能保持一定掌控感。' }, { id: 'B', text: '当很多事情都在变化时，我会感到比较乱。' }] }
    ],
    currentQuestionIndex: 0,
    answers: {},
    selectedOptionId: null,
    isAnimating: false,
    submitButtonEnabled: false,
    highAdaptabilityAnswers: {
      0: 'A', 1: 'A', 2: 'A', 3: 'A', 4: 'A',
      5: 'A', 6: 'A', 7: 'A', 8: 'A', 9: 'A'
    }
  },

  selectAnswer(event) {
    if (this.data.isAnimating) return;

    const { optionId } = event.currentTarget.dataset;
    const { currentQuestionIndex, questions } = this.data;

    this.setData({
      selectedOptionId: optionId,
      isAnimating: true
    });

    const newAnswers = { ...this.data.answers, [currentQuestionIndex]: optionId };
    this.setData({ answers: newAnswers });

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        this.setData({
          currentQuestionIndex: currentQuestionIndex + 1,
          selectedOptionId: null,
          isAnimating: false,
          submitButtonEnabled: false 
        });
      } else {
        this.setData({
          isAnimating: false,
          submitButtonEnabled: true
        });
      }
    }, 200);
  },

  goPrev() {
    const { currentQuestionIndex } = this.data;
    if (currentQuestionIndex > 0) {
      this.setData({
        currentQuestionIndex: currentQuestionIndex - 1,
        selectedOptionId: null,
        submitButtonEnabled: false
      });
    }
  },

  submit() {
    if (!this.data.submitButtonEnabled) return;

    let score = 0;
    const { answers, highAdaptabilityAnswers } = this.data;
    for (let i = 0; i < 10; i++) {
      if (answers[i] === highAdaptabilityAnswers[i]) {
        score++;
      }
    }
    
    wx.redirectTo({
      url: `/home/test/adaptability/result/result?score=${score}`
    });
  }
});
