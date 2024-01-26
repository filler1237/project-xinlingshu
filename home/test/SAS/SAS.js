const AddRes = wx.cloud.database().collection('Scales')
var SumArr = new Array()
var Sum = 0
Page({
  Goresult(){
    for(var i=0; i < 20; i++)
    {
        console.log("ans.i:",this.data.SumArr[i])
        Sum += this.data.SumArr[i]
        console.log("soa:" ,Sum)
    }
    var RES
    if(this.data.Sum<50){
      this.setData({  
        RES : this.data.result[0],
      })
    }else if(this.data.Sum >= 50 && this.data.Sum <= 59){
      this.setData({  
        RES : this.data.result[1],
      })
    }else if(this.data.Sum >= 60 && this.data.Sum <= 69){
      this.setData({  
        RES : this.data.result[2],
      })
    }else if(this.data.Sum >=70){
      this.setData({  
        RES : this.data.result[4],
      })
    }

    /* 上传结果 */
    AddRes.add({
      data:{
        open_id: this.open_id,
        Time: new Date().toJSON().substring(0, 10) + ' ' + new Date().toTimeString().substring(0,8),
        RES: this.data.RES,
        title: this.data.title
      }
    })

    console.log(RES)
    wx.redirectTo({
      url: '/home/test/result/result?title=' + this.data.title + '&color=' + this.data.color + '&it=' + this.data.title + '&advise=' + this.data.RES + '&ReturnAddressId=' + this.data.RAI,
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
      
      if(this.data.id == 4||this.data.id == 8||this.data.id == 12||this.data.id == 16||this.data.id == 18){
        this.data.SumArr[this.data.id] = 4
      }
      else{
        this.data.SumArr[this.data.id] = 1
      }
      if (this.data.id <= 19){
        this.setData({
          id : this.data.id + 1 
        })
      }
    },

    OpB:function(){
      
      if(this.data.id == 4||this.data.id == 8||this.data.id == 12||this.data.id == 16||this.data.id == 18){
        this.data.SumArr[this.data.id] = 3
      }
      else{
        this.data.SumArr[this.data.id] = 2
      }
      if (this.data.id < 20){
        this.setData({
          id : this.data.id + 1 
        })
      }
    },

    OpC:function(){
      
      if(this.data.id == 4||this.data.id == 8||this.data.id == 12||this.data.id == 16||this.data.id == 18){
        this.data.SumArr[this.data.id] = 2
      }
      else{
        this.data.SumArr[this.data.id] = 3
      }
      if (this.data.id < 20){
        this.setData({
          id : this.data.id + 1 
        })
      }
    },
    
    OpD:function(){
      
      if(this.data.id == 4||this.data.id == 8||this.data.id == 12||this.data.id == 16||this.data.id == 18 ){
        this.data.SumArr[this.data.id] = 1
      }
      else{
        this.data.SumArr[this.data.id] = 4
      }
      if (this.data.id <= 19){
        this.setData({
          id : this.data.id + 1 
        })
      }
    },
/**
 * 页面的初始数据
 */
data: {
  title:'焦虑自评量表SAS',
  color: '',
  RAI: "",
  id:0,
  SumArr:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  Sum:0,
  OptionA:'没有或很少时间',
  OptionB:'少部分时间',
  OptionC:'相当多时间',
  OptionD:'绝大部分或全部时间',
  
  SASQuestion:[
      {question:"1、我觉得比平常容易紧张和着急."},
      {question:"2、我无缘无故地感到害怕."},
      {question:"3、我容易心里烦乱或觉得惊恐."},
      {question:"4、我觉得我可能将要发疯."},
      {question:"5、我觉得一切都很好，也不会发生什么不幸."},
      {question:"6、我手脚发抖打颤."},
      {question:"7、我因为头痛，颈痛和背痛而苦恼."},
      {question:"8、我感觉容易衰弱和疲乏."},
      {question:"9、我觉得心平气和，并且容易安静坐着."},
      {question:"10、我觉得心跳很快."},
      {question:"11、我因为一阵阵头晕而苦恼."},
      {question:"12、我有晕倒发作或觉得要晕倒似的."},
      {question:"13、我呼气吸气都感到很容易."},
      {question:"14、我手脚麻木和刺痛."},
      {question:"15、我因为胃痛和消化不良而苦恼."},
      {question:"16、我常常要小便."},
      {question:"17、我的手常常是干燥温暖的."},
      {question:"18、我脸红发热."},
      {question:"19、我容易入睡并且一夜睡得很好."},
      {question:"20、我做恶梦."},
  ],
  result: [
    "您没有焦虑症状\n你是一个心态不错的人，身心都比较放松，相信在这样的状态下，你的好运就要到来了哦。",
    "您可能有轻度焦虑症状\n基本上你能处理好各种的压力，但是也有可能会被突如其来的坏消息打到，让情绪产生扰动，要相信自己的能力。",
    "您可能有中度焦虑症状\n你自己也感觉到了吧，焦虑的情绪无时无刻如影随形跟着你，慢慢吞噬你，迫使大脑超负荷运转的不是别人，正是你自己。",
    "您可能有重度焦虑症状\n焦虑已经严重影响到你的生活了，持久性焦虑情绪和植物神经活动障碍的脑机能失调，赶紧自救吧！"
  ]
},

/**
 * 生命周期函数--监听页面加载
 */
onLoad(options) {
  this.setData({
    color: options.color
  })
  this.setData({
    RAI: options.ReturnAddressId
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