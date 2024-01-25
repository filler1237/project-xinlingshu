// pages/home/function/1/SDS/SDStext/SDStext.js
var SumArr = new Array()
var Sum = 0
Page({
  // 跳转结果页面
  Goresult(){
    for(var i=0; i < 20; i++)
    {
        console.log("ans.i:",this.data.SumArr[i])
        Sum += this.data.SumArr[i]
        console.log("soa:" ,Sum)
    }
    var RES
    if(this.data.Sum<42){
      this.setData({  
        RES : this.data.result[0],
      })
    }else if(this.data.Sum >= 42 && this.data.Sum <= 49){
      this.setData({  
        RES : this.data.result[1],
      })
    }else if(this.data.Sum >= 50 && this.data.Sum <= 57){
      this.setData({  
        RES : this.data.result[2],
      })
    }else if(this.data.Sum >= 58){
      this.setData({  
        RES : this.data.result[4],
      })
    }

    console.log(RES)
    wx.redirectTo({
      url: '/home/test/result/result?title=' + this.data.title + '&color=' + this.data.color + '&it=' + this.data.title + '&advise=' + this.data.RES,
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
    color: '',
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
      result :[
        "您没有抑郁情绪\n你的忧虑状态处于正常水平，偶尔会有些消极情绪，感到难过、伤心甚至痛苦，但是这些消极情绪都在你的可控范围内，你靠自己就能摆脱这些消极情绪。\n你对自己的生活有怀疑、有焦虑也有信心。你目前的情绪状态使你与抑郁能够保持一定的距离。",
        "您可能有轻度抑郁情绪\n你近期或受情绪困扰较大，已较大影响日常生活；且你日常的思维模式或构成形成抑郁情绪的高风险。\n这样的忧虑状态使你徘徊在抑郁的边缘，增大你的抑郁风险。反复沉溺于苦闷、消极的想法，是导致抑郁的主要思维原因。也就是说，如果你总是一遍一遍回想那些消极的想法,有可能会陷入情绪陷阱无法脱离。\n要从这些想法里摆脱出来需要时间，但是请别担心，适当调整，加强锻炼，多出去散心，抑郁情绪会被你驱散的。",
        "您可能有中度抑郁情绪\n你近期或受情绪困扰较大，已较大影响日常生活；且你日常的思维模式或构成形成抑郁情绪的高风险。\n你目前处于一种高忧虑的状态中。你总是感到悲观、难过、伤心、焦虑，对自己的生活失去了信心，开始怀疑生活的意义。\n这样的忧虑状态使你徘徊在抑郁的边缘，增大你的抑郁风险，你现在需要想方设法去摆脱这种忧虑状态，如果有必要，你可能需要寻找专业人士的帮助。请及时调整自己的心态或寻求他人帮助。\n要完全找回之前的快乐可能没那么快，但是你可以控制抑郁情绪，通过增加社会支持、改变自身想法、增强体魄和健康应对等方法，慢慢治愈抑郁症。",
        "您可能有重度抑郁情绪\n你近期或受情绪困扰较大，已较大影响日常生活；且你日常的思维模式或构成形成抑郁情绪的高风险。\n你目前处于一种高忧虑的状态中。你总是感到悲观、难过、伤心、焦虑，对自己的生活失去了信心，开始怀疑生活的意义。\n这样的忧虑状态使你徘徊在抑郁的边缘，增大你的抑郁风险，你现在需要想方设法去摆脱这种忧虑状态，如果有必要，你可能需要寻找专业人士的帮助。"
      ]
  } ,    
      
    

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      color: options.color
    })
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