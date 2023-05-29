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
<<<<<<< HEAD
    if(this.data.sum<42){
      return 1 // 轻度焦虑
    }else if(this.data.sum >= 42 && this.data.sum <= 49){
      return 2 // 中度焦虑
    }else if(this.data.sum >= 50 && this.data.sum <= 57){
      return 3 // 中重度焦虑
    }else if(this.data.sum >= 58){
      return 4 // 重度焦虑
=======
    
    if(this.data.Sum<42){
      return 1
    }else if(this.data.Sum >= 42 && this.data.Sum <= 49){
      return 2
    }else if(this.data.Sum >= 50 && this.data.Sum <= 57){
      return 3
    }else if(this.data.Sum >= 58){
      return 4
>>>>>>> test
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
<<<<<<< HEAD
    sum:0, // 总分
    A:0, // 选项A得分
    B:0, // 选项B得分
    D:0, // 选项D得分
    advise:'unknown', // 建议类型
=======
    Sum:0,
    advise:'unknow',
>>>>>>> test
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
<<<<<<< HEAD
    // 从上一个页面获取数据
=======
    console.log("Sum is:" , options.Sum)
>>>>>>> test
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