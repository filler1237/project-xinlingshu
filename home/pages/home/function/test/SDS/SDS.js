// pages/home/function/1/SDS/SDS.js
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
    wx.navigateTo({
      url: '/home/pages/home/function/test/test',
    })
  },
  //进入测试
  Gotext(){
    wx.navigateTo({
      url: '../SDS/SDStext/SDStext',
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: 0, //导航栏高度
    titleBottom: 0, //顶部距离
    title:'抑郁自评量表SDS',
    intro:'抑郁自评量表（Self-rating depression scale SDS），是含有20个项目，分为4级评分的自评量表，原型是W.K.Zung编制的抑郁量表（1965）。其特点是使用简便，并能相当直观地反映抑郁患者的主观感受及其在治疗中的变化。主要适用于具有抑郁症状的成年人，包括门诊及住院患者。只是对严重迟缓症状的抑郁，评定有困难。'
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