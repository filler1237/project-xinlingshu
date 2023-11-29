// pages/home/function/1/1.js
Page({
  getHeights() {
    let that = this
    // 1.获取胶囊按钮的布局位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    // 2.获取设备信息
    const systemInfo = wx.getSystemInfoSync();
    // 3.计算:计算公式：导航栏高度 = 状态栏高度 + 44。
    // 导航栏高度 = 状态栏高度 + 44
    this.setData({
      navBarHeight: systemInfo.statusBarHeight + 44,
      titleBottom: systemInfo.statusBarHeight
    })
    console.log(systemInfo.statusBarHeight)
  },
  BACK(){
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  GoToSDS(){
    wx.navigateTo({
      url: '/home/pages/home/function/test/SDS/SDS',
    })
  },
  GoToSAS(){
    wx.navigateTo({
      url: '/home/pages/home/function/test/SAS/SAS',
    })
  },
  GoToGHQ(){
    wx.navigateTo({
      url: '/home/pages/home/function/test/GHQ/GHQ',
    })
  },
  GoToAIS(){
    wx.navigateTo({
      url: '/home/pages/home/function/test/AIS/AIS',
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: 0, //导航栏高度
    titleBottom: 0, //顶部距离
    title:'心理测评'
  },
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
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getHeights()
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