<<<<<<< HEAD
// 定义小程序页面对象
=======
// home/pages/home/function/test/SAS/SASresult/SASresult.js
/**
   * 云开发——测评记录
 */
const db = wx.cloud.database()
const SCALES = db.collection('Scales')

>>>>>>> test
Page({

  // 返回测试首页
  BackTo(){
    // 跳转到测试首页
    wx.reLaunch({
      url: '/home/pages/home/function/test/test',
    })
    SCALES.add({
      data:{
        Time: new Date(),
        Title : "抑郁自评量表（SDS）",
        Result : this.data.resulT,
      },
      success: function(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
      }
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
<<<<<<< HEAD
    // 判断总分所属的建议类型
=======
    
>>>>>>> test
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
<<<<<<< HEAD
    Sum:0,      // 总分
    advise:'unknow',   // 建议类型
=======
    Sum:0,
    advise:'unknow',
    resulT :'unknow',
    result :[
      "你的忧虑状态处于正常水平，偶尔会有些消极情绪，感到难过、伤心甚至痛苦，但是这些消极情绪都在你的可控范围内，你靠自己就能摆脱这些消极情绪。你对自己的生活有怀疑、有焦虑也有信心。你目前的情绪状态使你与抑郁能够保持一定的距离。",
      "你近期或受情绪困扰较大，已较大影响日常生活；且你日常的思维模式或构成形成抑郁情绪的高风险。这样的忧虑状态使你徘徊在抑郁的边缘，增大你的抑郁风险。比如反复沉溺于苦闷、消极的想法，是导致抑郁的主要思维原因。也就是说，如果你总是一遍一遍回想那些消极的想法。要从这些想法里摆脱出来需要时间，但是只要坚持，就会有很大的改变。但是请别担心，适当调整，加强锻炼，多出去散心，抑郁情绪会被你驱散的。",
      "你近期或受情绪困扰较大，已较大影响日常生活；且你日常的思维模式或构成形成抑郁情绪的高风险。你目前处于一种高忧虑的状态中。你总是感到悲观、难过、伤心、焦虑，对自己的生活失去了信心，开始怀疑生活的意义。这样的忧虑状态使你徘徊在抑郁的边缘，增大你的抑郁风险，你现在需要想方设法去摆脱这种忧虑状态，如果有必要，你可能需要寻找专业人士的帮助。请及时调整自己的心态或寻求他人帮助 。要完全找回之前的快乐可能没那么快，但是你可以控制抑郁情绪，通过增加社会支持、改变自身想法、增强体魄和健康应对等方法，慢慢治愈抑郁症。",
      "你近期或受情绪困扰较大，已较大影响日常生活；且你日常的思维模式或构成形成抑郁情绪的高风险。你目前处于一种高忧虑的状态中。你总是感到悲观、难过、伤心、焦虑，对自己的生活失去了信心，开始怀疑生活的意义。这样的忧虑状态使你徘徊在抑郁的边缘，增大你的抑郁风险，你现在需要想方设法去摆脱这种忧虑状态，如果有必要，你可能需要寻找专业人士的帮助。"
    ]
>>>>>>> test
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
<<<<<<< HEAD
    // 打印总分
    console.log("Sum is:" , options.Sum)
    // 从上一个页面传给总分参数，更新总分data
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
<<<<<<< HEAD
    // 判断建议类型
    this.setData({
      advise:this.Advise(),
=======
    this.setData({  
      advise : this.Advise(),
    })
    this.setData({  
      resulT : this.data.result[this.data.advise-1],
>>>>>>> test
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