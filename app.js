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
      }    },
    AISquestion:[
      {"question":"入睡时间（关灯后到睡着的时间）","option":{"A":"没问题","B":"轻微延迟", "C":"显著延迟","D":"延迟严重或没有睡觉"}},
      {"question":"夜间苏醒","option":{"A":"没问题","B":"轻微影响", "C":"显著影响","D":"严重影响或没有睡觉"}},
      {"question":"比期望的时间早醒","option":{"A":"没问题","B":"轻微提早", "C":"显著提早","D":"严重提早或没有睡觉"}},
      {"question":"总睡眠时间","option":{"A":"没问题","B":"轻微不足", "C":"显著不足","D":"严重不足或没有睡觉"}},
      {"question":"总睡眠质量（无论睡多长)","option":{"A":"没问题","B":"轻微不满", "C":"显著不满","D":"严重不满或没有睡觉"}},
      {"question":"白天情绪","option":{"A":"正常","B":"轻微低落", "C":"显著低落","D":"严重低落"}},
      {"question":"白天身体功能（体力或精神：如记忆力、认知力和注意力等）","option":{"A":"正常","B":"轻微影响", "C":"显著影响","D":"严重影响"}},
      {"question":"白天思睡","option":{"A":"正常","B":"轻微思睡", "C":"显著思睡","D":"严重思睡"}},
    ],
    token: "",
  },
})


