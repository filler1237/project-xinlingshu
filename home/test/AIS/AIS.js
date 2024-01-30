// pages/home/function/1/AIS/AIStext/AIStext.js
const AddRes = wx.cloud.database().collection('Scales')
var Ans = new Array()
var SUMofANS = 0
Page({

  /*查看结果*/
  Goresult(){
    for(var i=0; i < 8; i++)
    {
        console.log("ans.i:",this.data.Ans[i])
        SUMofANS += this.data.Ans[i]
        console.log("soa:" ,SUMofANS)
    }
    var RES
    if(SUMofANS<=3){
      this.setData({  
        RES : "您的测评得分是：" + SUMofANS + "\n\n" + this.data.result[0],
      })
    }else if(SUMofANS<=5){
      this.setData({  
        RES : "您的测评得分是：" + SUMofANS + "\n\n" + this.data.result[1],
      })
    }else if(SUMofANS>=6){
      this.setData({  
        RES : "您的测评得分是：" + SUMofANS + "\n\n" + this.data.result[2],
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

    /* 跳转至结果页 */
    wx.redirectTo({
      url: '/home/test/result/result?title=' + this.data.title + '&color=' + this.data.color + '&it=' + this.data.title + '&advise=' + this.data.RES + '&ReturnAddressId=' + this.data.RAI,
    })
  },
    /**
     * 页面的初始数据
     */
    data: {
      title: "阿森斯失眠量表AIS",
      color: "",
      RAI: "",
      OptionA:'不符合',
      OptionB:'不太符合',
      OptionC:'比较符合',
      OptionD:'完全符合',
      id:0,
      SUMofANS:0,
      Ans : [0,0,0,0,0,0,0,0],
      AISquestion:[
       {question:"1. 入睡时间很长（关灯后到睡着的时间）"},
       {question:"2. 夜间苏醒频繁"},
       {question:"3. 比期望的时间早醒"},
       {question:"4. 总睡眠时间不足"},
       {question:"5. 总睡眠质量差（无论睡多长)"},
       {question:"6. 白天情绪低落"},
       {question:"7. 白天身体功能低下（体力或精神：如记忆力、认知力和注意力等）"},
       {question:"8. 白天思睡"}
     ],
     result: ["祝贺你，你没有睡眠障碍",
      "你可能有睡眠问题，请尽快调整作息或请求专业人士帮助",
      "你最近有一些失眠症状，请尽快向专业人士求助"
    ]
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