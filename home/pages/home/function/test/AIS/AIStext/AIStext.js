// pages/home/function/1/AIS/AIStext/AIStext.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
     QUESTION:app.globalData.AISquestion[0].question,
     OPA:app.globalData.AISquestion[0].option.A,
     OPB:app.globalData.AISquestion[0].option.B,
     OPC:app.globalData.AISquestion[0].option.C,
     OPD:app.globalData.AISquestion[0].option.D,
     A:0,
     B:0,
     C:0,
     D:0,
     sum:0,
     index:0,
     index:0,
  },
  BACK(){
    wx.navigateBack()
  },
  ANS:function(){
       this.setData({
         index: this.data.index + 1,
      })
      if (this.data.index == 8) {
        wx.redirectTo({
          url: '../../AIS/result/result?A=' + this.data.A + '&B=' + this.data.B + '&C=' + this.data.C+'&D='+this.data.D+'&sum' + this.data.sum,
        }),
        this.setData({
            index: this.data.index - 1,
        })
      }
      this.setData({
        QUESTION:app.globalData.AISquestion[this.data.index].question,
        OPA:app.globalData.AISquestion[this.data.index].option.A,
        OPB:app.globalData.AISquestion[this.data.index].option.B,
        OPC:app.globalData.AISquestion[this.data.index].option.C,
        OPD:app.globalData.AISquestion[this.data.index].option.D,
      })
      
     },
     ANSA:function(){
      this.setData({
        A :this.data.A+0,
      })
     },
     ANSB:function(){
      this.setData({
        B :this.data.B+1,
      })
     },
     ANSC:function(){
      this.setData({
        C :this.data.C+2,
      })
     },
     ANSD:function(){
      this.setData({
        D :this.data.D+3,
      })
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