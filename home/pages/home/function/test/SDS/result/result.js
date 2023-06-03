// 定义小程序页面对象
Page({

  // 返回测试首页
  BackTo(){
    // 跳转到测试首页
    wx.reLaunch({
      url: '/home/pages/home/function/test/test',
    })
  },

  // 再测一次
  OneMore(){
    // 跳转到SDS测试页面
    wx.reLaunch({
      url: '/home/pages/home/function/test/SDS/SDS',
    })
  },

  // 根据总分判断建议类型
  Advise:function(){
    // 判断总分所属的建议类型
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
    Sum:0,      // 总分
    advise:'unknow',   // 建议类型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 打印总分
    console.log("Sum is:" , options.Sum)
    // 从上一个页面传给总分参数，更新总分data
    this.setData({
      Sum : options.Sum
    })
    // 计算总分
    this.setData({
      Sum: this.data.Sum
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