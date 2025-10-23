Page({
  data: {
    userInfo: null
  },

  onLoad() {
    this.getUserInfo();
  },

  onShow() {
    this.getUserInfo();
  },

  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    } else {
      // 未登录，跳转到登录页
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('openid');
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  },

  // 跳转到首页
  onGoHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
})