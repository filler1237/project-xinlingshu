// home/pages/home/function/test/SAS/SASresult/SASresult.js
Page({
  BackTo(){
    wx.reLaunch({
      url: '/home/pages/home/function/test/test',
    })
  },
  OneMore(){
    wx.reLaunch({
      url: '/home/pages/home/function/test/SAS/SAS',
    })
  },
  Advise:function(){
    
    if(this.data.sum<50){
      return 1
    }else if(this.data.sum >= 50 && this.data.sum <= 59){
      return 2
    }else if(this.data.sum >= 60 && this.data.sum <= 69){
      return 3
    }else if(this.data.sum >=70){
      return 4
    }

  },
  /**
   * 页面的初始数据
   */
  data: {
    sum:0,
    A:0,
    B:0,
    D:0,
    advise:'unknow',
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
      sum:options.sum - 0,
    })
    this.setData({
      sum: this.data.A + this.data.B + this.data.C + this.data.D
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