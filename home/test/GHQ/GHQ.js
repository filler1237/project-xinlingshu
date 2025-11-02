const AddRes = wx.cloud.database().collection('Scales')

Page({
  Goresult(){
    let sum = this.data.Ans.reduce((a, b) => a + b, 0);
    let RES;
    if (sum <= 11) {
      RES = this.data.result[0];
    } else if (sum <= 15) {
      RES = this.data.result[1];
    } else if (sum <= 20) {
      RES = this.data.result[2];
    } else {
      RES = this.data.result[3];
    }
    this.setData({
      RES: `您的测评总分是：${sum}\n\n${RES}`
    });

    AddRes.add({
      data:{
        Time: new Date().toLocaleString(),
        RES: this.data.RES,
        title: this.data.title
      }
    });

    wx.redirectTo({
      url: `/home/test/result/result?title=${this.data.title}&color=${this.data.color}&it=${this.data.title}&advise=${encodeURIComponent(this.data.RES)}&ReturnAddressId=${this.data.RAI}`,
    });
  },
    
  QueChange: function(q){
    this.setData({ id: this.data.id });
  },
  
  LastQ:function(){
    if (this.data.id > 0) {
      this.setData({ id: this.data.id - 1 });
    }
  },
  
  OpA:function(){
    this.data.Ans[this.data.id] = 0;
    if (this.data.id < 12) {
      this.setData({ id: this.data.id + 1 });
    }
  },
  OpB:function(){
    this.data.Ans[this.data.id] = 1;
    if (this.data.id < 12) {
      this.setData({ id: this.data.id + 1 });
    }
  },
  OpC:function(){
    this.data.Ans[this.data.id] = 2;
    if (this.data.id < 12) {
      this.setData({ id: this.data.id + 1 });
    }
  },
  OpD:function(){
    this.data.Ans[this.data.id] = 3;
    if (this.data.id < 12) {
      this.setData({ id: this.data.id + 1 });
    }
  },
   
data: {
  title: "一般健康问卷GHQ-12",
  color: "",
  RAI: "",
  id:0,
  Ans: new Array(12).fill(0),
  OptionA:'比平时好',
  OptionB:'与平时一样',
  OptionC:'比平时差',
  OptionD:'比平时差很多',
  
  GHQQuestion:[
      {question:"1. 能集中精神处理问题吗？"},
      {question:"2. 为忧虑而失眠吗？"},
      {question:"3. 感到在处理事情中起着积极作用吗？"},
      {question:"4. 对处理事情能做出决策吗？"},
      {question:"5. 感到有压力吗？"},
      {question:"6. 感到无法克服困难吗？"},
      {question:"7. 能享受日常的生活吗？"},
      {question:"8. 能面对困难吗？"},
      {question:"9. 感到不开心和沮丧吗？"},
      {question:"10. 对自己失去信心吗？"},
      {question:"11. 认为自己是一个没有价值的人吗？"},
      {question:"12. 感到生活美满，心情愉快吗？"},
  ],
  result: [
    "心理健康良好：状态稳定，无明显心理压力。",
    "轻度心理困扰：存在一定情绪紧张或疲惫感。",
    "中度心理困扰：焦虑、压抑或睡眠问题开始影响日常生活。",
    "重度心理困扰：明显焦虑或抑郁倾向，建议心理辅导或临床干预。"
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
