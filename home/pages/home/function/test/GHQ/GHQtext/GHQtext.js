// home/pages/home/function/test/GHQ/GHQtext/GHQtext.js
Page({
  Goresult(){
      wx.redirectTo({
          url: '/home/pages/home/function/test/GHQ/GHQresult/GHQresult?A=' + this.data.A + '&B=' + this.data.B + '&C=' + this.data.C + '&sum' + this.data.sum,
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
      
      if(this.data.id ==6 ){
          this.setData({
              A:this.data.A + 0
          })
      }
      else if(this.data.id ==9){
          this.setData({
              B:this.data.B + 1
          })
      }
      else if(this.data.id <=8 && this.data.id !=6){
          this.setData({
              A:this.data.A + 1
            })
      }
      else if(this.data.id >8 && this.data.id <=14 && this.data.id !=9){
          this.setData({
              B:this.data.B + 1
          })
      }
      else{
          this.setData({
              C:this.data.C + 1
          })
      }
      if (this.data.id <= 19){
        this.setData({
          id : this.data.id + 1 
        })
      }
    },
    OpB:function(){
      
      if(this.data.id ==6 ){
          this.setData({
              A:this.data.A + 1
          })
      }
      else if(this.data.id ==9){
          this.setData({
              B:this.data.B + 1
          })
      }
      else if(this.data.id <=8 && this.data.id !=6){
          this.setData({
              A:this.data.A + 0
            })
      }
      else if(this.data.id >8 && this.data.id <=14 && this.data.id !=9){
          this.setData({
              B:this.data.B + 0
          })
      }
      else{
          this.setData({
              C:this.data.C + 0
          })
      }
      if (this.data.id < 20){
        this.setData({
          id : this.data.id + 1 
        })
      }
    },
   
    
/**
 * 页面的初始数据
 */
data: {
  id:0,
  A:0,
  B:0,
  C:0,
  Sum:0,
  OptionA:'是的',
  OptionB:'不是的',
  
  
  GHQQuestion:[
      {question:"1.大致来说样样事情都很开心"},
      {question:"2.你是不是做事情都能够集中精神"},
      {question:"3.是不是很满意自己做事情的方式"},
      {question:"4.最近是否忙碌及充分利用时间"},
      {question:"5.处理日常事务是不是和别人一样好"},
      {question:"6.是不是觉得自己在很多事情上都能帮手或提供一些意见"},
      {question:"7.觉得很不开心及闷闷不乐"},
      {question:"8.能够开心地过你平日正常的生活"},
      {question:"9.是不是容易同人相处"},
      {question:"10.觉得自己的将来还有希望"},
      {question:"11.觉得做人没有什么意思"},
      {question:"12.对自己失去信心"},
      {question:"13.觉得人生完全没有希望"},
      {question:"14.觉得自己是个无用的人"},
      {question:"15.整天觉得人生好似战场一样"},
      {question:"16.是不是因为担心而睡不着"},
      {question:"17.是不是心情烦躁睡得不好"},
      {question:"18.整天觉得心神不安与紧张"},
      {question:"19.是不是觉得整天有精神压力"},
      {question:"20.因为神经太过紧张觉得有时什么事情都做不到"},
  ]

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