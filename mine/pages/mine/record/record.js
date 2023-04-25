
// pages/mine/record/record.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
record1:"cloud://tuxls-4gadsqlb8cd8de9e.7475-tuxls-4gadsqlb8cd8de9e-1317306213/assets/record1.jpg",
record2:"cloud://tuxls-4gadsqlb8cd8de9e.7475-tuxls-4gadsqlb8cd8de9e-1317306213/assets/record2.jpg"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
    wx.setNavigationBarTitle({
      title: '测评记录',
    })
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