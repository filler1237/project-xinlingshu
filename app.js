App({
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env:'cloud1-2gxal8as6b6bfe21',
      traceUser: true
    });
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
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
      openid:"", // 添加 openid 属性
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


