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
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      const isChiefJudge = userInfo.role === 'chief_judge';
      this.setData({ 
        userInfo,
        isChiefJudge 
      });
    } else {
      // 如果全局没有用户信息，可以给一个提示或者返回上一页
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000,
        complete: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }
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
})
