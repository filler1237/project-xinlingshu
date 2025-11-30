Page({
  data: {
    currentQuestionIndex: 0,
    selectedOptionId: null,
    answers: {},
    submitButtonEnabled: false,
    questions: [
      {
        id: 1,
        options: [
          { id: 'A', text: '我通常愿意尝试需要一定技巧的新任务。', score: 1 },
          { id: 'B', text: '我更喜欢在开始之前先确认自己能处理好事情。', score: 0 }
        ]
      },
      {
        id: 2,
        options: [
          { id: 'A', text: '即使事情复杂，我也会先动手试一试。', score: 1 },
          { id: 'B', text: '处理困难任务时，我更容易犹豫要不要开始。', score: 0 }
        ]
      },
      {
        id: 3,
        options: [
          { id: 'A', text: '我相信自己可以在实践中慢慢掌握陌生的技能。', score: 1 },
          { id: 'B', text: '我在面对未知任务时更倾向于先绕开它们。', score: 0 }
        ]
      },
      {
        id: 4,
        options: [
          { id: 'A', text: '碰上问题时，我通常会找到解决它的方法。', score: 1 },
          { id: 'B', text: '遇到问题时，我更可能先停下来、等别人提供方向。', score: 0 }
        ]
      },
      {
        id: 5,
        options: [
          { id: 'A', text: '在计划一个项目时，我对自己能顺利完成有一定信心。', score: 1 },
          { id: 'B', text: '我做事情前通常会担心自己可能做不好。', score: 0 }
        ]
      },
      {
        id: 6,
        options: [
          { id: 'A', text: '我愿意承担一些需要判断力的决定。', score: 1 },
          { id: 'B', text: '我更喜欢依照别人设好的流程来行事。', score: 0 }
        ]
      },
      {
        id: 7,
        options: [
          { id: 'A', text: '当目标看起来有点难，我会把它拆成小步慢慢推进。', score: 1 },
          { id: 'B', text: '如果目标看起来超过我的能力，我会先暂缓。', score: 0 }
        ]
      },
      {
        id: 8,
        options: [
          { id: 'A', text: '我倾向于相信自己的学习速度足够应对大部分挑战。', score: 1 },
          { id: 'B', text: '我需要更多时间准备和练习才能开始新的挑战。', score: 0 }
        ]
      },
      {
        id: 9,
        options: [
          { id: 'A', text: '我习惯在压力下保持冷静并继续做决定。', score: 1 },
          { id: 'B', text: '在压力大的情况下，我更容易变得谨慎和迟疑。', score: 0 }
        ]
      },
      {
        id: 10,
        options: [
          { id: 'A', text: '当别人依赖我完成某件事时，我通常能挺住。', score: 1 },
          { id: 'B', text: '当别人期待我表现时，我会感到担心自己无法做好。', score: 0 }
        ]
      }
    ]
  },

  onLoad(options) {
    this.updateSelectionState();
  },

  selectAnswer(e) {
    const { optionId } = e.currentTarget.dataset;
    const currentQuestion = this.data.questions[this.data.currentQuestionIndex];
    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
    
    this.setData({
      [`answers.${this.data.currentQuestionIndex}`]: selectedOption.score,
      selectedOptionId: optionId
    });

    this.checkIfSubmitEnabled();

    // 自动进入下一题
    setTimeout(() => {
      if (this.data.currentQuestionIndex < this.data.questions.length - 1) {
        this.goNext();
      }
    }, 200);
  },

  goNext() {
    if (this.data.currentQuestionIndex < this.data.questions.length - 1) {
      this.setData({
        currentQuestionIndex: this.data.currentQuestionIndex + 1,
      });
      this.updateSelectionState();
    }
  },

  goPrev() {
    if (this.data.currentQuestionIndex > 0) {
      this.setData({
        currentQuestionIndex: this.data.currentQuestionIndex - 1,
      });
      this.updateSelectionState();
    }
  },

  updateSelectionState() {
    const score = this.data.answers[this.data.currentQuestionIndex];
    if (score !== undefined) {
      const currentQuestion = this.data.questions[this.data.currentQuestionIndex];
      const selectedOption = currentQuestion.options.find(opt => opt.score === score);
      this.setData({
        selectedOptionId: selectedOption.id
      });
    } else {
      this.setData({
        selectedOptionId: null
      });
    }
    this.checkIfSubmitEnabled();
  },

  checkIfSubmitEnabled() {
    const allAnswered = Object.keys(this.data.answers).length === this.data.questions.length;
    this.setData({
      submitButtonEnabled: allAnswered
    });
  },

  submit() {
    if (!this.data.submitButtonEnabled) return;

    let totalScore = 0;
    for (const key in this.data.answers) {
      totalScore += this.data.answers[key];
    }
    
    wx.redirectTo({
      url: `/home/test/self-efficacy/result/result?score=${totalScore}`
    });
  }
});
