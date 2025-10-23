// pages/auth/login/login.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    account:'',
    password:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  onAccountInput: function(e) {
    this.setData({
      account:e.detail.value
    });
  },

  onPasswordInput: function(e) {
    this.setData({
      password:e.detail.value
    })
  },

  onLogin: function() {
    const { account,password } = this.data;

    if(!account || !password) {
      wx.showToast({
        title:'账号或密码不能为空',
        icon:'none'
      });
      return;
    }

    wx.showLoading({
      title:'登录中...',
    });

    
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