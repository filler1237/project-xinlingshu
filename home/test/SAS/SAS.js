const AddRes = wx.cloud.database().collection('Scales')

Page({
  Goresult(){
    let rawScore = this.data.SumArr.reduce((a, b) => a + b, 0);
    let standardScore = Math.floor(rawScore * 1.25);
    let RES;
    if(standardScore < 50){
      RES = this.data.result[0];
    } else if(standardScore <= 59){
      RES = this.data.result[1];
    } else if(standardScore <= 69){
      RES = this.data.result[2];
    } else if(standardScore >= 70){
      RES = this.data.result[3];
    }
    this.setData({
      RES: `您的标准分是：${standardScore}\n\n${RES}`
    });

    /* 上传结果 */
    AddRes.add({
      data:{
        Time: new Date().toLocaleString(),
        RES: this.data.RES,
        title: this.data.title
      }
    })

    wx.redirectTo({
      url: `/home/test/result/result?title=${this.data.title}&color=${this.data.color}&it=${this.data.title}&advise=${encodeURIComponent(this.data.RES)}&ReturnAddressId=${this.data.RAI}`,
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
      let score = 1;
      if([5, 9, 13, 17, 19].includes(this.data.id + 1)){
        score = 4;
      }
      this.data.SumArr[this.data.id] = score;
      if (this.data.id <= 19){
        this.setData({ id : this.data.id + 1 });
      }
    },

    OpB:function(){
      let score = 2;
      if([5, 9, 13, 17, 19].includes(this.data.id + 1)){
        score = 3;
      }
      this.data.SumArr[this.data.id] = score;
      if (this.data.id <= 19){
        this.setData({ id : this.data.id + 1 });
      }
    },

    OpC:function(){
      let score = 3;
      if([5, 9, 13, 17, 19].includes(this.data.id + 1)){
        score = 2;
      }
      this.data.SumArr[this.data.id] = score;
      if (this.data.id <= 19){
        this.setData({ id : this.data.id + 1 });
      }
    },
    
    OpD:function(){
      let score = 4;
      if([5, 9, 13, 17, 19].includes(this.data.id + 1)){
        score = 1;
      }
      this.data.SumArr[this.data.id] = score;
      if (this.data.id <= 19){
        this.setData({ id : this.data.id + 1 });
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
  SumArr: new Array(20).fill(0),
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
    "无焦虑：情绪稳定，无明显焦虑体验。",
    "轻度焦虑：有明显紧张、担忧或生理症状，但尚能自我调节。",
    "中度焦虑：持续焦虑，伴随明显的身体不适或睡眠障碍，影响生活或学习。",
    "重度焦虑：焦虑情绪强烈且持续，伴随显著的生理症状（如心慌、出汗、失眠），需专业干预。"
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
