Page({
  data: {
    userInfo: null,
    stats: {
      activityCount: 0,
      workCount: 0,
      pendingCount: 0
    }
  },

// 返回 ，放js文件
  goBack: function() {
    // wx.navigateBack({
    //   delta: 1
    // });
    wx.switchTab({ url: '/pages/home/home' });
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
    this.setData({ userInfo });
  },

  loadStats() {
    this.setData({
      stats: {
        activityCount: 12,
        workCount: 156,
        pendingCount: 8
      }
    });
  },

  // 管理员功能跳转
  toApplyActivity() {
    wx.navigateTo({
      url: '/competition/pages/admin/applyActivity/applyActivity'
    });
  },

  toManageActivity() {
    wx.navigateTo({
      url: '/competition/pages/admin/manageActivity/manageActivity'
    });
  },

  toWorkOverview() {
    wx.navigateTo({
      url: '/competition/pages/admin/workOverview/workOverview'
    });
  },

  toJudgeManage() {
    wx.navigateTo({
      url: '/competition/pages/admin/judgeManage/judgeManage'
    });
  },

  toCreditConfig() {
    wx.navigateTo({
      url: '/competition/pages/admin/creditConfig/creditConfig'
    });
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