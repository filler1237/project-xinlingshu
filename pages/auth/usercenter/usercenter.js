const app=getApp(); // 获取小程序实例
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0' // 默认头像的 URL

Page({
  
  ChangeImage:function(){ // 更换头像的函数
    var that = this;
    wx.chooseMedia({
      count:1,
      mediaType: ['image'], // 只能选择图片
      success:function(res){ 
        var avatar = res.tempFiles.tempFilePath; // 获取选择的图片
        wx.setStorageSync('ImageSrc', avatar) // 将图片路径存入缓存
      }
    })
  },
  
  data: { // 页面的初始数据
    nickName:'游客', // 昵称
    avatarUrl:defaultAvatarUrl, // 头像 URL
    ImageSrc:"/assets/默认头像.jpeg", // 用户选择的头像图片路径
    Namevalue: "", // 姓名
    Sign:"", // 个性签名
    PhoneNumber:"", // 手机号码
    School:"深圳技术大学", // 学校
    StuNum:"", // 学号
    SchoolP:"", // 学院专业
    Project:"", // 项目
    Class:"" // 班级
  },
  
  NameChange:function(res){ // 姓名输入框的值改变时触发的函数
    var Name = res.detail
    try{
      wx.setStorageSync('Namevalue', Name) // 存储姓名到缓存
      console.log('写入Name成功')
    }catch(e){
      console.log('写入Name发生错误')
    }
  },
  SignChange:function(res){ // 个性签名输入框的值改变时触发的函数
    var temp = res.detail
    try{
      wx.setStorageSync('Sign', temp) // 存储个性签名到缓存
      console.log('写入Sign成功')
    }catch(e){
      console.log('写入Sign发生错误')
    }
  },
  PNChange:function(res){ // 手机号码输入框的值改变时触发的函数
    var temp = res.detail
    try{
      wx.setStorageSync('PN', temp) // 存储手机号码到缓存
      console.log('写入PN成功')
    }catch(e){
      console.log('写入PN发生错误')
    }
  },
  STUNChange:function(res){ // 学号输入框的值改变时触发的函数
    var temp = res.detail
    try{
      wx.setStorageSync('StuNum', temp) // 存储学号到缓存
      console.log('写入STUN成功')
    }catch(e){
      console.log('写入STUN发生错误')
    }
  },
  SPChange:function(res){ // 学院专业输入框的值改变时触发的函数
    var temp = res.detail
    try{
      wx.setStorageSync('SchoolP', temp) // 存储学院专业到缓存
      console.log('写入SP成功')
    }catch(e){
      console.log('写入SP发生错误')
    }
  },
  PJChange:function(res){ // 项目输入框的值改变时触发的函数
    var temp = res.detail
    try{
      wx.setStorageSync('Project', temp) // 存储项目到缓存
      console.log('写入PJ成功')
    }catch(e){
      console.log('写入PJ发生错误')
    }
  },
  ClassChange:function(res){ // 班级输入框的值改变时触发的函数
    var temp = res.detail
   try{
      wx.setStorageSync('Class', temp) // 存储班级到缓存
      console.log('写入Class成功')
    }catch(e){
      console.log('写入Class发生错误')
    }
  },
  
  onChooseAvatar(e) { // 点击更改头像时触发的函数
    console.log(e)
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
    app.globalData.userInfo=e.detail
  },
  
  formsubmit(e){ // 表单提交时触发的函数
    const nickName = e.detail.value.nickname
    console.log("nickName", nickName)
    // do something
  },
  
  login(){ // 登录时触发的函数
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
  
  onLoad(options) { // 页面加载时触发的函数
    var name = wx.getStorageSync('Namevalue') // 获取缓存中存储的姓名
    var sign = wx.getStorageSync('Sign') // 获取缓存中存储的个性签名
    var PN = wx.getStorageSync('PhoneNumber') // 获取缓存中存储的手机号码
    var stu = wx.getStorageSync('StuNum') // 获取缓存中存储的学号
    var SP = wx.getStorageSync('SchoolP') // 获取缓存中存储的学院专业
    var PJ = wx.getStorageSync('Project') // 获取缓存中存储的项目
    var clas = wx.getStorageSync('Class') // 获取缓存中存储的班级
    var IS = wx.getStorageSync('ImageSrc') // 获取缓存中存储的头像图片路径
    if(IS){
      this.setData({
        ImageSrc : IS // 如果缓存中存储了头像图片路径，将其设置为页面的 ImageSrc 数据
      })
    }
    if(name){
      this.setData({
        Namevalue : name.value // 如果缓存中存储了姓名，将其设置为页面的 Namevalue 数据
      })
    }
    if(sign){
      this.setData({
        Sign : sign.value // 如果缓存中存储了个性签名，将其设置为页面的 Sign 数据
      })
    }
    if(PN){
      this.setData({
        PhoneNumber: PN.value // 如果缓存中存储了手机号码，将其设置为页面的 PhoneNumber 数据
      })
    }
    if(stu){
      this.setData({
        StuNum : stu.value // 如果缓存中存储了学号，将其设置为页面的 StuNum 数据
      })
    }
    if(SP){
      this.setData({
        SchoolP : SP.value // 如果缓存中存储了学院专业，将其设置为页面的 SchoolP 数据
      })
    }
    if(PJ){
      this.setData({
        Project : PJ.value // 如果缓存中存储了项目，将其设置为页面的 Project 数据
      })
    }
    if(clas){
      this.setData({
        Class : clas.value // 如果缓存中存储了班级，将其设置为页面的 Class 数据
      })
    }
  },

  onReady() { // 生命周期函数--监听页面初次渲染完成
    wx.setNavigationBarTitle({
      title: '个人中心', // 设置导航栏标题
    })
  },

  onShow() { // 生命周期函数--监听页面显示
    this.avatarUrl=app.globalData.userInfo.avatarUrl // 获取全局变量中存储的用户头像 URL

    const self = this
    let userText = wx.getStorageSync('NickName') // 获取```
    this.data.inputText = NickName // 将姓名存入页面的 inputText 数据
    self.setData(self.data) // 更新页面数据
  },

  onHide() { // 生命周期函数--监听页面隐藏

  },

  onUnload() { // 生命周期函数--监听页面卸载

  },

  onPullDownRefresh() { // 页面相关事件处理函数--监听用户下拉动作

  },

  onReachBottom() { // 页面上拉触底事件的处理函数

  },

  onShareAppMessage() { // 用户点击右上角分享时触发的函数

  }
})