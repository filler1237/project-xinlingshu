Page({
  data: {
    userInfo: null,
    isChiefJudge: false,
    stats: {
      assignedWorks: 0,
      reviewedWorks: 0,
      pendingWorks: 0
    }
  },

  onLoad() {
    this.getUserInfo();
    this.loadStats();
  },

  onShow() {
    this.getUserInfo();
  },

  onPullDownRefresh() {
    this.loadStats();
    wx.stopPullDownRefresh();
  },

  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.redirectTo({
        url: '/competition/pages/login/login'
      });
      return;
    }
    
    const isChiefJudge = userInfo.role === 'chief_judge';
    this.setData({ 
      userInfo,
      isChiefJudge 
    });
  },

  loadStats() {
    this.setData({
      stats: {
        assignedWorks: 25,
        reviewedWorks: 18,
        pendingWorks: 7
      }
    });
  },

  // 评委功能跳转
  toJudgePanel() {
    wx.navigateTo({
      url: '/competition/pages/judge/judgePanel/judgePanel'
    });
  },

  toWorkList() {
    wx.navigateTo({
      url: '/competition/pages/judge/workList/workList'
    });
  },

  toScoreStandard() {
    wx.navigateTo({
      url: '/competition/pages/judge/scoreStandard/scoreStandard'
    });
  },

  toScoreSummary() {
    wx.navigateTo({
      url: '/competition/pages/judge/scoreSummary/scoreSummary'
    });
  },
// 返回 ，放js文件
goBack: function() {
  // wx.navigateBack({
  //   delta: 1
  // });
  wx.switchTab({ url: '/pages/home/home' });
},
  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.redirectTo({
            url: '/competition/pages/login/login'
          });
        }
      }
    });
  }
})