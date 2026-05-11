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
        // 退底逻辑：如果是分享进入的没有上一页，则跳回首页
        wx.switchTab({
          url: '/pages/index/index' 
        });
      }
    });
  }
});
