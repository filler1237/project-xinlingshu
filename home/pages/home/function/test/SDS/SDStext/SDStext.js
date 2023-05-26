// pages/home/function/1/SDS/SDStext/SDStext.js

Page({
  // 跳转到结果页面
  Goresult(){
    wx.redirectTo({
      url: '/home/pages/home/function/test/SDS/result/result?A=' + this.data.A + '&B=' + this.data.B + '&C=' + this.data.C+'&D='+this.data.D+'&sum' + this.data.sum,
    })
  },

  // 切换问题
  QueChange: function(q){
    // 不做任何操作，因为id没有改变
    this.setData({
      id : this.data.id
    })
  },

  // 切换到上一题
  LastQ:function( ){
    if (this.data.id > 0 ){
      this.setData({
        id : this.data.id - 1 
      })
    }    
  },

  // 点击选项A
  OpA:function(){
    // 如果当前不是最后一题，跳转到下一题
    if (this.data.id <= 19){
      this.setData({
        id : this.data.id + 1 
      })
    }
    // 根据题号判断是加4分还是加1分
    if(this.data.id == 1||this.data.id == 4||this.data.id == 5||this.data.id == 10||this.data.id == 11||this.data.id == 13||this.data.id == 15||this.data.id == 16||this.data.id == 17||this.data.id == 19){
      this.setData({
        A:this.data.A + 4
      })
    }
    else{
      this.setData({
        A:this.data.A + 1
      })
    }   
  },

  // 点击选项B
  OpB:function(){
    // 如果当前不是最后一题，跳转到下一题
    if (this.data.id <= 19){
      this.setData({
        id : this.data.id + 1 
      })
    }
    // 根据题号判断是加3分还是加2分
    if(this.data.id == 1||this.data.id == 4||this.data.id == 5||this.data.id == 10||this.data.id == 11||this.data.id == 13||this.data.id == 15||this.data.id == 16||this.data.id == 17||this.data.id == 19){
      this.setData({
        B:this.data.B + 3
      })
    }
    else{
      this.setData({
        B:this.data.B + 2
      })
    }
  },

  // 点击选项C
  OpC:function(){
    // 如果当前不是最后一题，跳转到下一题
    if (this.data.id <= 19){
      this.setData({
        id : this.data.id + 1 
      })
    }
    // 根据题号判断是加2分还是加3分
    if(this.data.id == 1||this.data.id == 4||this.data.id == 5||this.data.id == 10||this.data.id == 11||this.data.id == 13||this.data.id == 15||this.data.id == 16||this.data.id == 17||this.data.id == 19){
      this.setData({
        C:this.data.C + 2
      })
    }
    else{
      this.setData({
        C:this.data.C + 3
      })
    }
  },

  // 点击选项D
  OpD:function(){
    // 如果当前不是最后一题，跳转到下一题
    if (this.data.id <= 19){
      this.setData({
        id : this.data.id + 1 
      })
    }
    // 根据题号判断是加1分还是加4分
    if(this.data.id == 1||this.data.id == 4||this.data.id == 5||this.data.id == 10||this.data.id == 11||this.data.id == 13||this.data.id == 15||this.data.id == 16||this.data.id == 17||this.data.id == 19){
      this.setData({
        D:this.data.D + 1
      })
    }
    else{
      this.setData({
        D:this.data.D + 4
      })
    }
  },

  /**
   * 页面的初始数据
   */
  data: {
    // 当前题号
    id:0,
    // 四个选项对应的得分
    A:0,
    B:0,
    C:0,
    D:0,
    // 总分
    Sum:0,
    // 四个选项的文本描述
    OptionA:'没有或很少时间',
    OptionB:'少部分时间',
    OptionC:'相当多时间',
    OptionD:'绝大部分或全部时间',
    // 题目列表
    QUESTION: [
      {question:"1、我觉得闷闷不乐，情绪低沉"},
      {question:"2、我觉得一天中早晨最好"},
      {question:"3、一阵阵哭出来或觉得想哭"},
      {question:"4、我晚上睡眠不好"},
      {question:"5、我吃得跟平常一样多"},
      {question:"6、我与异性密切接触时和以往一样感到愉快"},
      {question:"7、我发觉我的体重在下降"},
      {question:"8、我有便秘的苦恼"},
      {question:"9、心跳比平常快"},
      {question:"10、我无缘无故地感到疲乏"},
      {question:"11、我的头脑和平常一样清楚"},
      {question:"12、我觉得经常做的事情并没有困难"},
      {question:"13、我觉得不安而平静不下来"},
      {question:"14、我对未来抱有希望"},
      {question:"15、我比平常容易生气激动"},
      {question:"16、我觉得做出决定是容易的"},
      {question:"17、我觉得自己是个有用的人，有人需要我"},
      {question:"18、我的生活过得很有意思"},
      {question:"19、我认为如果我死了，别人会生活得更好"},
      {question:"20、平常感兴趣的事我仍然感兴趣"},
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