// pages/mine/mine.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:'',
    nickName:'',
    username:'',
    userInfo:{},
    isLogin:false,
    id:null,
    wenzhang:[],
      message:[],
      pinglunguode:[],
      ban:false,
      isadmin:false
  },
  //登录函数
  toLogin(){
    if(this.data.isLogin){
      wx.navigateTo({
        url: '/pages/auth/usercenter/usercenter',
      }); //若已经登录,则直接返回,不会执行后面的语句
      return
    }
    wx.getUserProfile({
      desc: '获取用户信息用于维护会员权益',
      // lang:'zh_CN',
      success:(res)=>{
        console.log('获取用户信息',res)
        //将用户数据存入data,更新UI
        this.setData({
          isLogin: true,//登录成功,改为true
          userInfo: res.userInfo
        })
        //去自己家数据库进行查询,看一下当前用户的最新数据
        this.login()
      }
    })
  },
  //访问自己家数据库执行登录业务
  //1.若在users集合中找到用户信息,那么直接更新UI
  //2.若在users集合中没有找到用户信息,执行注册业务
  login(){
    let db = wx.cloud.database()   //获取数据库信息
    //users集合有权限设置,导致只能查到自己以前添加过得数据
    db.collection('users').get().then(res=>{
      console.log('查询当前用户',res)
      if(res.data.length==0){//没有查到用户
        this.regist() //调一个方法,去注册
      }else{//查到了用户
        let userInfo=res.data[0]//拿到数据库里面数据
        this.setData({userInfo})//直接更新到data，这样页面就更新了
      }
    })
  },
  //注册业务  将userInfo存入users集合
  regist(){
    let db = wx.cloud.database() //获取数据库信息
    db.collection('users').add({  //在users中添加数据
      // data:this.data.userInfo,    //把userInfo中的新数据存入data
      data:this.data,
      success:(res)=>{
        console.log('注册用户',res) //执行成功后打印
      }
    })
  },

  // toLogin(){
  //   if(!this.data.id){
  //     var that = this
  //   wx.getUserProfile({
  //     desc: '用于完善信息',
  //     success(res){
  //       console.log(res)
  //       var user=res.userInfo
  //       app.globalData.userInfo.id=1
  //       app.globalData.userInfo=user
  //       app.globalData.userInfo.isLogin=true
  //       console.log(app.globalData)
  //       console.log(that.data.userInfo.id)
  //       that.setData({
  //         userInfo:user,
  //         id:1
  //       })
  //       wx.showToast({
  //         title: '登录成功',
  //       })
  //     }

  //   })
  //   }
  //   else
  //   {
  //     wx.navigateTo({
  //     url: '/pages/auth/usercenter/usercenter'
  //   })
  // }
  // },

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
    // this.setData({
    //   avatarUrl:app.userInfo.userinfo.avatarUrl,
    //   nickName:app.userInfo.userinfo.nickName,
    //   username:app.userInfo.userinfo.username
    // })
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