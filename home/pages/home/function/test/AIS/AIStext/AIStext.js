// pages/home/function/1/AIS/AIStext/AIStext.js
Page({
  Goresult(){
    wx.redirectTo({
        url: '/home/pages/home/function/test/AIS/result/result?A=' + this.data.A + '&B=' + this.data.B + '&C=' + this.data.C+'&D='+this.data.D+'&sum' + this.data.sum,
      })
  },
  QueChange: function(q){
    this.setData({
      id : this.data.id
    })
    
  },

  LastQ:function( ){
    if (this.data.id > 0 ){
      this.setData({
        id : this.data.id - 1 
      })
    }
  },

  OpA:function(){
    if (this.data.id <= 7){
        this.setData({
          id : this.data.id + 1 
        })
      }
      this.setData({
        A:this.data.A + 0
    })
  },
  OpB:function(){
    if (this.data.id <= 7){
        this.setData({
          id : this.data.id + 1 
        })
      }
      this.setData({
        B:this.data.B + 1
    })
  },
  OpC:function(){
    if (this.data.id <= 7){
        this.setData({
          id : this.data.id + 1 
        })
      }
      this.setData({
        C:this.data.C + 2
    })
  },
  OpD:function(){
    if (this.data.id <= 7){
        this.setData({
          id : this.data.id + 1 
        })
      }
      this.setData({
        D:this.data.D + 3
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
     OptionA:'不符合',
     OptionB:'不太符合',
     OptionC:'比较符合',
     OptionD:'完全符合',
     A:0,
     B:0,
     C:0,
     D:0,
     id:0,
     sum:0,

     AISquestion:[
      {question:"入睡时间很长（关灯后到睡着的时间）"},
      {question:"夜间苏醒频繁"},
      {question:"比期望的时间早醒"},
      {question:"总睡眠时间不足"},
      {question:"总睡眠质量差（无论睡多长)"},
      {question:"白天情绪低落"},
      {question:"白天身体功能低下（体力或精神：如记忆力、认知力和注意力等）"},
      {question:"白天思睡"}
    ],
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