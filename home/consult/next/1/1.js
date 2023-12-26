// pages/home/resourse/next/1/1.js
Page({
onBackTap: function(e) {
  var pages = getCurrentPages();                       //获取当前页面
  var prePage = pages[pages.length - 2];               //获取上一页面
  prePage.setData({
    'search.page': 1                                   //给上一页面的变量赋值
  })
  wx.navigateBack({                                    //返回上一页面
    delta: 1,
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