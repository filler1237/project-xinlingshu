// home/profile/profile.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    articles: [],
    isLoading: true

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userId = options.userId;
    if(userId) {
      this.getUserProfile(userId);
    } else {
      wx.showToast({
        title: '用户ID不存在',
        icon: 'none'
      });
      this.setData({isLoading: false});
    }
  },

  getUserProfile(userId) {
    this.setData({ isLoading: true });
    wx.cloud.callFunction({
      name: 'getUserProfile',
      data: {
        userId:userId
      },
      success: res => {
        if(res.result && res.result.success) {
          this.setData({
            userInfo: res.result.data.userInfo,
            articles: res.result.data.articles
          });
        } else {
          wx.showToast({
            title: res.result.message || '加载失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        console.error('云函数getUserProfile调用失败',err);
      },
      complete: () => {
        this.setData({ isLoading: false });
        }
      });
    },
  gotoDetail(event) {
    const articleId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/home/read/detail/detail?id=${articleId}`
    });
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})