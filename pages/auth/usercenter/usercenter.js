// pages/auth/usercenter/usercenter.js
const app=getApp();
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  
  ChangeImage:function(){
    var that = this;
    wx.chooseMedia({
      count:1,
      mediaType: ['image'],
      success:function(res){
        var avatar = res.tempFilePaths;
        that.setData({
          ImageSrc: avatar,
          upAvatar:true
          })
      }
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    nickName:'游客',
    avatarUrl:defaultAvatarUrl,
    ImageSrc:"/assets/默认头像.jpeg",
    Namevalue: "",
    Sign:"",
    PhoneNumber:"",
    School:"深圳技术大学",
    StuNum:"",
    SchoolP:"",
    Project:"",
    Class:""

  },
  
  bindSubmit:function(res){
    console.log(res)

    var Namevalue = res.detail.value.Namevalue
    var Sign = res.detail.value.Sign
    var PhoneNumber = res.detail.value.PhoneNumber

    db.collection("put_list").add({
      data: {
        "Namevalue" : Namevalue,
        "Sign":Sign,
        "PhoneNumber":PhoneNumber
      },
      success: function(res){
        console.log(res)
        wx.hideLoading()
      }
    })
  },

  onChange:function(event) {
    // event.detail 为当前输入的值
    console.log(event.detail);
    this.setData({
      Namevalue : event.detail.value
    })
    if(this.data.value){
      wx.setStorage({
        key : 'Namevalue', 
        data : this.data.Namevalue
      })
    }
  },
  
  onChooseAvatar(e) {
    console.log(e)
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
    app.globalData.userInfo=e.detail
  },
  
  // onChangename(e){
  //   console.log(e)
  //   const { nickName } = e.detail 
  //   this.setData({
  //     nickName,
  //   })
  //   app.globalData.userInfo=e.detail
  // },
  formsubmit(e){
    const nickName = e.detail.value.nickname
    console.log("nickName", nickName)
    // do something
  },
  login(){
    var that = this
    wx.getUserProfile({
      desc: '用于完善信息',
      success(res){
        console.log(res)
        var user=res.userInfo
        app.globalData.userInfo=user
        app.globalData.userInfo.isLogin=true
        console.log(app.globalData)
        that.setData({
          userInfo:user
        })
        wx.showToast({
          title: '登录成功',
        })
      }
    })
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
    wx.setNavigationBarTitle({
      title: '个人中心',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.avatarUrl=app.globalData.userInfo.avatarUrl

    const self = this
            let userText = wx.getStorageSync('NickName')
            if (userText) {
                self.data.inputText = NickName
                self.setData(self.data)
            }
    
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