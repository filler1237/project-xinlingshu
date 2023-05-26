// home/pages/home/function/test/SAS/SASresult/SASresult.js

Page({
  // 返回测试首页
  BackTo(){
    wx.reLaunch({
      url: '/home/pages/home/function/test/test',
    })
  },
  // 再测一次
  OneMore(){
    wx.reLaunch({
      url: '/home/pages/home/function/test/SDS/SDS',
    })
  },
  // 根据总分判断建议类型
  Advise:function(){
    if(this.data.sum<42){
      return 1 // 轻度焦虑
    }else if(this.data.sum >= 42 && this.data.sum <= 49){
      return 2 // 中度焦虑
    }else if(this.data.sum >= 50 && this.data.sum <= 57){
      return 3 // 中重度焦虑
    }else if(this.data.sum >= 58){
      return 4 // 重度焦虑
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    sum:0, // 总分
    A:0, // 选项A得分
    B:0, // 选项B得分
    D:0, // 选项D得分
    advise:'unknown', // 建议类型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 从上一个页面获取数据
    this.setData({
      A: options.A - 0,
      B: options.B - 0,
      C: options.C - 0,
      D: options.D - 0,
      sum:options.sum - 0,
    })
    // 计算总分
    this.setData({
      sum: this.data.A + this.data.B + this.data.C + this.data.D
    })
    // 判断建议类型
    this.setData({
      advise:this.Advise(),
    })
    console.log(this.Advise())
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