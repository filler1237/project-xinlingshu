// pages/home/function/1/AIS/result/result.js
Page({
  BackTo(){
    wx.reLaunch({
      url: '/home/pages/home/function/test/test',
    })
  },
  OneMore(){
    wx.reLaunch({
      url: '/home/pages/home/function/test/AIS/AIS',
    })
  },

  Advise:function(){
    if(this.data.SUMofANS>=0&&this.data.SUMofANS<=3){
      return "祝贺你，你没有睡眠障碍"
    }else if(this.data.SUMofANS>=4&&this.data.SUMofANS<=5){
        return"你可能有睡眠问题，请尽快调整作息或请求专业人士帮助"
    }else if(this.data.SUMofANS>=6){
        return"你最近有一些失眠症状，请尽快向专业人士求助"
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    SUMofANS:0,
    advise:'unknow',
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options.SUMofANS)
    this.setData({
      SUMofANS : options.SUMofANS
    })
    this.setData({
      SUMofANS : this.data.SUMofANS
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