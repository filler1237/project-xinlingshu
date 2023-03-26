// pages/home/function/1/AIS/result/result.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sum:0,
    A:0,
    B:0,
    C:0,
    D:0,
    advise:'unknow',
  },
  Advise:function(){
    if(this.data.sum>=0&&this.data.sum<=3){
      return "祝贺你，你没有睡眠障碍"
    }else if(this.data.sum>=4&&this.data.sum<=5){
        return"你可能有睡眠问题，请尽快调整作息或请求专业人士帮助"
    }else if(this.data.sum>=6){
        return"你最近有一些失眠症状，请尽快向专业人士求助"
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      A: options.A - 0,
      B: options.B - 0,
      C: options.C - 0,
      D: options.D - 0,
      sum:options.sum-0,
      
    })
    this.setData({
        sum:this.data.A+this.data.B+this.data.C+this.data.D,
    })
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