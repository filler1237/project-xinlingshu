wx.cloud.init({
  env:'tuxls-4gadsqlb8cd8de9e',
  traceUser: true
});

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    // this.userInfo={
    //   ban:false,
    //   msgnb:[0,0],
    //   _openid:"",
    //   _id:"",
    //   wenzhang:[],
    //   message:[],
    //   pinglunguode:[],
    //   userinfo:{
    //     avatarUrl: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
    //     userName:"匿名用户",
    //     nickName: "Hi，游客",
    //     username: "点击去登录",
    //     anonymous:"",
    //     isVIP:false,
    //     login:"未知",
    //   },
      
    // }
    
  },
  
  globalData: {
    fuyuanli: {
      max: 100,
      gap: 10,
      Level: 1,
      shengli: 0,
      xinli: 0,
      qingxu: 0,
      shejiao: 0
    },
    userInfo: {
      isLogin:false,
      nickName: "Hi，游客",
      username: "点击去登录",
      _id:"",
      id:"",
      openid:"",
      avatarUrl: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
      wenzhang:[],
      message:[],
      pinglunguode:[],
      ban:false,
      isadmin:false,
      fuyuanli: {
        max: 100,
        gap: 10,
        Level: 1,
        shengli: 0,
        xinli: 0,
        qingxu: 0,
        shejiao: 0
      }    
    },
    
    token: "",
  },
})


