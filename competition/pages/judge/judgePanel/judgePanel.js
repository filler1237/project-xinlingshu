Page({
  data: {
    activityInfo: {
      title: '',
      organizer: '',
      id: '',
      description: ''
    },
    scoreItems: [
      { 
        id: 1, 
        name: '心理专业度', 
        maxScore: 30,
        description: '专业性和科学性'
      },
      { 
        id: 2, 
        name: '活动设计', 
        maxScore: 25,
        description: '流程设计和环节衔接'
      },
      { 
        id: 3, 
        name: '参与体验', 
        maxScore: 25,
        description: '互动性和体验感'
      },
      { 
        id: 4, 
        name: '心理效果', 
        maxScore: 20,
        description: '对参与者的影响'
      }
    ],
    currentScores: {},
    comment: '',
    totalScore: 0,
    activityId: null
  },

  onLoad: function(options) {
    if (options && options.activityId) {
      this.setData({
        activityId: options.activityId
      });
      this.loadActivityData(options.activityId);
    } else {
      wx.showToast({
        title: '缺少活动ID',
        icon: 'none'
      });
    }
  },

  // 加载活动数据
  loadActivityData: function(activityId) {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    });
    
    // 模拟API调用
    setTimeout(function() {
      wx.hideLoading();
      that.setData({
        activityInfo: {
          id: activityId,
          title: '心理健康与压力管理讲座',
          organizer: '心理健康教育中心',
          description: '帮助学生了解压力来源，学习压力管理技巧，提升心理韧性。'
        }
      });
    }, 1000);
  },

  // 下载活动资料
  downloadMaterial: function() {
    var that = this;
    wx.showLoading({
      title: '准备下载...',
    });
    
    // 模拟下载
    setTimeout(function() {
      wx.hideLoading();
      wx.showToast({
        title: '下载成功',
        icon: 'success'
      });
    }, 1500);
  },

  // 分数输入
  onScoreInput: function(e) {
    var scoreId = e.currentTarget.dataset.id;
    var scoreValue = e.detail.value;
    
    // 获取该评分项的最大分值
    var maxScore = 10;
    var scoreItems = this.data.scoreItems;
    for (var i = 0; i < scoreItems.length; i++) {
      if (scoreItems[i].id == scoreId) {
        maxScore = scoreItems[i].maxScore;
        break;
      }
    }
    
    // 限制输入范围
    var numValue = parseFloat(scoreValue);
    if (isNaN(numValue)) {
      numValue = 0;
    }
    if (numValue > maxScore) {
      numValue = maxScore;
    }
    if (numValue < 0) {
      numValue = 0;
    }
    
    var currentScores = {};
    for (var key in this.data.currentScores) {
      currentScores[key] = this.data.currentScores[key];
    }
    currentScores[scoreId] = numValue.toString();
    
    this.setData({
      currentScores: currentScores
    });
    
    this.calculateTotalScore();
  },

  // 计算总分
  calculateTotalScore: function() {
    var total = 0;
    var currentScores = this.data.currentScores;
    
    for (var key in currentScores) {
      var score = parseFloat(currentScores[key]);
      if (!isNaN(score)) {
        total += score;
      }
    }
    
    this.setData({
      totalScore: total.toFixed(1)
    });
  },

  // 评价输入
  onCommentInput: function(e) {
    this.setData({
      comment: e.detail.value
    });
  },

  // 提交评分
  submitScore: function() {
    var currentScores = this.data.currentScores;
    var comment = this.data.comment;
    var scoreItems = this.data.scoreItems;
    var totalScore = this.data.totalScore;
    var that = this;
    
    // 验证是否所有项目都已评分
    var scoredCount = 0;
    for (var key in currentScores) {
      if (currentScores[key] && currentScores[key] !== '') {
        scoredCount++;
      }
    }
    
    if (scoredCount < scoreItems.length) {
      wx.showToast({
        title: '请完成所有评分项',
        icon: 'none'
      });
      return;
    }
    
    // 验证评价内容
    if (!comment.trim()) {
      wx.showToast({
        title: '请输入评价内容',
        icon: 'none'
      });
      return;
    }
    
    // 显示提交确认
    wx.showModal({
      title: '确认提交',
      content: '确定要提交评审吗？总分：' + totalScore + '分',
      success: function(res) {
        if (res.confirm) {
          that.doSubmitScore();
        }
      }
    });
  },

  // 执行提交
  doSubmitScore: function() {
    var that = this;
    wx.showLoading({
      title: '提交中...',
    });
    
    // 模拟提交
    setTimeout(function() {
      wx.hideLoading();
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      });
      setTimeout(function() {
        that.goBack();
      }, 1500);
    }, 1500);
  },

  // 返回
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  }
});