// home/pages/home/function/test/SAS/SAStext/SDStext.js
Page({
  Goresult(){
      wx.redirectTo({
          url: '/home/pages/home/function/test/SAS/SASresult/SASresult?A=' + this.data.A + '&B=' + this.data.B + '&C=' + this.data.C+'&D='+this.data.D+'&sum' + this.data.sum,
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
          this.setData({
              A:this.data.A + 4
            })
      }
      else{
          this.setData({
              A:this.data.A + 1
          })
      }
      if (this.data.id <= 19){
        this.setData({
          id : this.data.id + 1 
        })
      }
    },

    OpB:function(){
      
      if(this.data.id == 4||this.data.id == 8||this.data.id == 12||this.data.id == 16||this.data.id == 18){
          this.setData({
              B:this.data.B + 3
            })
      }
      else{
          this.setData({
              B:this.data.B + 2
          })
      }
      if (this.data.id < 20){
        this.setData({
          id : this.data.id + 1 
        })
      }
    },

    OpC:function(){
      
      if(this.data.id == 4||this.data.id == 8||this.data.id == 12||this.data.id == 16||this.data.id == 18){
          this.setData({
              C:this.data.C + 2
            })
      }
      else{
          this.setData({
              C:this.data.C + 3
          })
      }
      if (this.data.id < 20){
        this.setData({
          id : this.data.id + 1 
        })
      }
    },
    
    OpD:function(){
      
      if(this.data.id == 4||this.data.id == 8||this.data.id == 12||this.data.id == 16||this.data.id == 18 ){
          this.setData({
              D:this.data.D + 1
            })
      }
      else{
          this.setData({
              D:this.data.D + 4
          })
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
  id:0,
  A:0,
  B:0,
  C:0,
  D:0,
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