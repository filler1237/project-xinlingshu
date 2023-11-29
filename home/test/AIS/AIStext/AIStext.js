// pages/home/function/1/AIS/AIStext/AIStext.js
var Ans = new Array()
var SUMofANS = 0
Page({

    /**
     * 页面的初始数据
     */
    data: {
      OptionA:'不符合',
      OptionB:'不太符合',
      OptionC:'比较符合',
      OptionD:'完全符合',
      id:0,
      SUMofANS:0,
      Ans : [0,0,0,0,0,0,0,0],
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

   /*查看结果*/
   Goresult(){
    for(var i=0; i < 8; i++)
    {
        console.log("ans.i:",this.data.Ans[i])
        SUMofANS += this.data.Ans[i]
        console.log("soa:" ,SUMofANS)
    }
    wx.redirectTo({
        url: '/home/pages/home/function/test/AIS/result/result?SUMofANS=' + SUMofANS,
      })
  },
  /*问题*/
    QueChange: function(q){
      this.setData({
        id : this.data.id
      })
    },
  /*上一题*/
    LastQ:function( ){
      if (this.data.id > 0 ){
        this.setData({
          id : this.data.id - 1 
        })
      }
    },
  /*选项*/
    OpA:function(){
      if (this.data.id <= 7){
          this.setData({
            id : this.data.id + 1 
          })
        }
       
      this.data.Ans[this.data.id-1] = 0
    },
    OpB:function(){
      if (this.data.id <= 7){
          this.setData({
            id : this.data.id + 1 ,
          })
        }
      
      this.data.Ans[this.data.id-1] = 1
    },
    OpC:function(){
      if (this.data.id <= 7){
          this.setData({
            id : this.data.id + 1 
          })
        }
       
      this.data.Ans[this.data.id-1] = 2
    },
    OpD:function(){
      if (this.data.id <= 7){
          this.setData({
            id : this.data.id + 1 
          })
        }
        
      this.data.Ans[this.data.id-1] = 3
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