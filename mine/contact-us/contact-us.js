Page({
  data: {
    statusBarHeight: 0,
    headerHeight: 0,
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      headerHeight: (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height
    });
  },

  onBackTap() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index' 
        });
      }
    });
  }
});
