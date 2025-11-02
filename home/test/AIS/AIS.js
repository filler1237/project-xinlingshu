// pages/home/function/1/AIS/AIStext/AIStext.js
const AddRes = wx.cloud.database().collection('Scales')
Page({

  /*查看结果*/
  Goresult(){
    let SUMofANS = this.data.Ans.reduce((a, b) => a + b, 0);
    var RES;
    if(SUMofANS <= 3){
      RES = this.data.result[0];
    } else if(SUMofANS <= 5){
      RES = this.data.result[1];
    } else if(SUMofANS <= 10){
      RES = this.data.result[2];
    } else if(SUMofANS <= 15){
      RES = this.data.result[3];
    } else if(SUMofANS >= 16){
      RES = this.data.result[4];
    }
    this.setData({
      RES: `您的测评得分是：${SUMofANS}\n\n${RES}`
    });
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
      url: '/home/test/result/result?title=' + this.data.title + '&color=' + this.data.color + '&it=' + this.data.title + '&advise=' + encodeURIComponent(this.data.RES) + '&ReturnAddressId=' + this.data.RAI,
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
     result: [
      "无失眠：睡眠正常，无明显睡眠障碍。偶有入睡困难或早醒，但不影响日常功能。",
      "可疑失眠（临界状态）：轻度入睡困难、夜间觉醒次数略增或主观睡眠质量下降，但白天功能影响不大。建议观察或改善睡眠卫生。",
      "轻度失眠：明显入睡困难、夜间易醒、早醒或睡眠不深，可能伴随轻微疲劳、注意力下降等日间影响。若持续超过1个月建议干预。",
      "中度失眠：入睡困难明显、睡眠时间短且恢复感差，白天出现显著的困倦、情绪波动、工作学习效率下降。常需心理或医学干预。",
      "重度失眠：长期睡眠障碍严重影响生活质量，伴随焦虑、抑郁等情绪问题，需专业诊治与系统治疗。"
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
