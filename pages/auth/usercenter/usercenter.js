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
        var avatar = res.tempFiles.tempFilePath;
        wx.setStorageSync('ImageSrc', avatar)
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
  
  NameChange:function(res){
    var Name = res.detail
    try{
      wx.setStorageSync('Namevalue', Name)
      console.log('写入Name成功')
    }catch(e){
      console.log('写入Name发生错误')
    }
  },
  SignChange:function(res){
    var temp = res.detail
    try{
      wx.setStorageSync('Sign', temp)
      console.log('写入Sign成功')
    }catch(e){
      console.log('写入Sign发生错误')
    }
  },
  PNChange:function(res){
    var temp = res.detail
    try{
      wx.setStorageSync('PN', temp)
      console.log('写入PN成功')
    }catch(e){
      console.log('写入PN发生错误')
    }
  },
  STUNChange:function(res){
    var temp = res.detail
    try{
      wx.setStorageSync('StuNum', temp)
      console.log('写入STUN成功')
    }catch(e){
      console.log('写入STUN发生错误')
    }
  },
  SPChange:function(res){
    var temp = res.detail
    try{
      wx.setStorageSync('SchoolP', temp)
      console.log('写入SP成功')
    }catch(e){
      console.log('写入SP发生错误')
    }
  },
  PJChange:function(res){
    var temp = res.detail
    try{
      wx.setStorageSync('Project', temp)
      console.log('写入PJ成功')
    }catch(e){
      console.log('写入PJ发生错误')
    }
  },
  ClassChange:function(res){
    var temp = res.detail
    try{
      wx.setStorageSync('Class', temp)
      console.log('写入Class成功')
    }catch(e){
      console.log('写入Class发生错误')
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
    var name = wx.getStorageSync('Namevalue')
    var sign = wx.getStorageSync('Sign')
    var PN = wx.getStorageSync('PhoneNumber')
    var stu = wx.getStorageSync('StuNum')
    var SP = wx.getStorageSync('SchoolP')
    var PJ = wx.getStorageSync('Project')
    var clas = wx.getStorageSync('Class')
    var IS = wx.getStorageSync('ImageSrc')
    if(IS){
      this.setData({
        ImageSrc : IS
      })
    }
    if(name){
      this.setData({
        Namevalue : name.value
      })
    }
    if(sign){
      this.setData({
        Sign : sign.value
      })
    }
    if(PN){
      this.setData({
        PhoneNumber : PN.value
      })
    }
    if(stu){
      this.setData({
        StuNum : stu.value
      })
    }
    if(SP){
      this.setData({
        SchoolP : SP.value
      })
    }
    if(PJ){
      this.setData({
        Project : PJ.value
      })
    }
    if(clas){
      this.setData({
        Class : clas.value
      })
    }

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