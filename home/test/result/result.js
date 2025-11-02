// home/test/result/result.js
Page({
  BackTo(){
    wx.redirectTo({
      url: '/home/test/test',
    })
  },
  OneMore(){
    wx.redirectTo({
      url: '/home/test/intro/intro?id=' + this.data.ReturnAddressId,
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    title: "",
    icontitle: "",
    advise: "",
    color: "",
    ReturnAddressId: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      title: options.title,
      icontitle: options.it,
      advise: decodeURIComponent(options.advise),
      color: options.color,
      ReturnAddressId: options.ReturnAddressId
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
