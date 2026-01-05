// competition/pages/index/index.js
Page({
  onShow() {
    this.checkAndRedirect();
  },
  checkAndRedirect() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.isIdentityBound) {
      wx.showModal({
        title: '需要登录并绑定身份',
        content: '比赛系统需要您先登录并绑定身份才能使用。',
        confirmText: '去处理',
        showCancel: false,
        success: () => { wx.switchTab({ url: '/pages/mine/mine' }); }
      });
      return;
    }
    const role = userInfo.role;
    let targetPage = '';
    switch (role) {
      case 'student': targetPage = '/competition/pages/studenthome/studenthome'; break;
      case 'judge': targetPage = '/competition/pages/judgehome/judgehome'; break;
      case 'admin': targetPage = '/competition/pages/adminhome/adminhome'; break;
      default:
        wx.showModal({
          title: '角色未知',
          content: '您的账户角色信息异常，无法进入比赛系统。',
          showCancel: false,
          confirmText: '返回',
          success: () => { wx.switchTab({ url: '/pages/mine/mine' }); }
        });
        return;
    }
    wx.redirectTo({ url: targetPage });
  }
});
