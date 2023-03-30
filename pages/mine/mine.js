// pages/mine/mine.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    isLogin:false,
    id:null
  },
  toLogin(){
    if(!this.data.id){
      var that = this
    wx.getUserProfile({
      desc: '用于完善信息',
      success(res){
        console.log(res)
        var user=res.userInfo
        app.globalData.userInfo.id=1
        app.globalData.userInfo=user
        app.globalData.userInfo.isLogin=true
        console.log(app.globalData)
        console.log(that.data.userInfo.id)
        that.setData({
          userInfo:user,
          id:1
        })
        wx.showToast({
          title: '登录成功',
        })
      }
    })
    }
    else
    {
      wx.navigateTo({
      url: '/pages/auth/usercenter/usercenter'
    })
  }
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
    let userInfo = wx.getStorageSync('userInfo');
    let isLogin = wx.getStorageSync('isLogin');
    // 页面显示
    if (userInfo && isLogin) {
      this.setData({
        userInfo: userInfo,
        isLogin: isLogin
      });
    } else {
      // 未登录信息
      this.setData({
        userInfo: app.globalData.userInfo,
        isLogin: isLogin
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.setNavigationBarTitle({
      title: 'SZTU心灵树',
    })
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