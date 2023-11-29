// pages/home/function/1/SDS/SDStext/SDStext.js
var SumArr = new Array()
var Sum = 0
Page({
  getHeights() {
    let that = this
    // 1.获取胶囊按钮的布局位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    // 2.获取设备信息
    const systemInfo = wx.getSystemInfoSync();
    // 3.计算:计算公式：导航栏高度 = 状态栏高度 + 44。
    // 导航栏高度 = 状态栏高度 + 44
    this.setData({
      navBarHeight: systemInfo.statusBarHeight + 44,
      titleBottom: systemInfo.statusBarHeight
    })
    console.log(systemInfo.statusBarHeight)
  },

  BACK(){
    wx.navigateTo({
      url: '/home/pages/home/function/test/test',
    })
  },

  Goresult(){
    for(var i=0; i < 20; i++)
    {
        console.log("ans.i:",this.data.SumArr[i])
        Sum += this.data.SumArr[i]
        console.log("soa:" ,Sum)
    }
    wx.redirectTo({
        url: '/home/pages/home/function/test/SDS/result/result?Sum=' + Sum,
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
    if (this.data.id <= 19){
        this.setData({
          id : this.data.id + 1 
        })
      }

    if(this.data.id == 1||this.data.id == 4||this.data.id == 5||this.data.id == 10||this.data.id == 11||this.data.id == 13||this.data.id == 15||this.data.id == 16||this.data.id == 17||this.data.id == 19){
      this.data.SumArr[this.data.id-1] = 4
    }
    else{
      this.data.SumArr[this.data.id-1] = 1
    }
    
  },
  OpB:function(){
    if (this.data.id <= 19){
        this.setData({
          id : this.data.id + 1 
        })
      }
    if(this.data.id == 1||this.data.id == 4||this.data.id == 5||this.data.id == 10||this.data.id == 11||this.data.id == 13||this.data.id == 15||this.data.id == 16||this.data.id == 17||this.data.id == 19){
      this.data.SumArr[this.data.id-1] = 3
    }
    else{
      this.data.SumArr[this.data.id-1] = 2
    }
  },
  OpC:function(){
    if (this.data.id <= 19){
        this.setData({
          id : this.data.id + 1 
        })
      }
    if(this.data.id == 1||this.data.id == 4||this.data.id == 5||this.data.id == 10||this.data.id == 11||this.data.id == 13||this.data.id == 15||this.data.id == 16||this.data.id == 17||this.data.id == 19){
      this.data.SumArr[this.data.id-1] = 2
    }
    else{
      this.data.SumArr[this.data.id-1] = 3
    }
  },
  OpD:function(){
    if (this.data.id <= 19){
        this.setData({
          id : this.data.id + 1 
        })
      }
    if(this.data.id == 1||this.data.id == 4||this.data.id == 5||this.data.id == 10||this.data.id == 11||this.data.id == 13||this.data.id == 15||this.data.id == 16||this.data.id == 17||this.data.id == 19){
      this.data.SumArr[this.data.id-1] = 1
    }
    else{
      this.data.SumArr[this.data.id-1] = 4
    }
  },
  
  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: 0, //导航栏高度
    titleBottom: 0, //顶部距离
    title:'抑郁自评量表SDS',
    id:0,
    SumArr:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    Sum:0,
    OptionA:'没有或很少时间',
    OptionB:'少部分时间',
    OptionC:'相当多时间',
    OptionD:'绝大部分或全部时间',
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
  } ,    
      
    

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getHeights()
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