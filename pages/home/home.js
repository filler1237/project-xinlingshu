// pages/home/home.js
Page({
  gotoZiXun (){
    wx.navigateTo({
      url: '/home/pages/home/function/consult/consult'
    })
},
gotoCePing (){
  wx.navigateTo({
    url: '/home/pages/home/function/test/test'
  })
},
gotoSheQu (){
  wx.navigateTo({
    url: '/home/pages/home/function/social/social.wxml'
  })
},
gotoBuJi (){
  wx.navigateTo({
    url: '/home/pages/home/function/read/read.wxml'
  })
},
gotoTaLuo (){
  wx.navigateTo({
    url: '/home/pages/home/function/card/card'
  })
},
  /**
   * 页面的初始数据
   */
  data: {

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