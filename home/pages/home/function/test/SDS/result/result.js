// home/pages/home/function/test/SAS/SASresult/SASresult.js
Page({
  BackTo(){
    wx.reLaunch({
      url: '/home/pages/home/function/test/test',
    })
  },
  OneMore(){
    wx.reLaunch({
      url: '/home/pages/home/function/test/SDS/SDS',
    })
  },
  Advise:function(){
    
    if(this.data.Sum<42){
      return 1
    }else if(this.data.Sum >= 42 && this.data.Sum <= 49){
      return 2
    }else if(this.data.Sum >= 50 && this.data.Sum <= 57){
      return 3
    }else if(this.data.Sum >= 58){
      return 4
    }

  },
  /**
   * 页面的初始数据
   */
  data: {
    Sum:0,
    advise:'unknow',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("Sum is:" , options.Sum)
    this.setData({
      Sum : options.Sum
    })
    this.setData({
      Sum: this.data.Sum
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