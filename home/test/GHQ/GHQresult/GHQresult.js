// home/pages/home/function/test/GHQ/result/result.js
Page({
    
  BackTo:function (){
      wx.reLaunch({
        url: '/home/pages/home/function/test/test',
      })   
  },
  OneMore:function(){
      wx.reLaunch({
        url: '/home/pages/home/function/test/GHQ/GHQ',
      })
  },

/**
* 页面的初始数据
*/
data: {
A:0,
B:0,
C:0,
advise:'unknow',
},

/**
* 生命周期函数--监听页面加载
*/
onLoad(options) {
this.setData({
    A: options.A - 0,
    B: options.B - 0,
    C: options.C - 0,
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