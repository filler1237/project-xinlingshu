const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
    nickName: "Hi，游客,点击去登录吧！",
    // username: "点击去登录",
    userInfo:{},
    isLogin:false,
    id:"",
    _id:"",
    _openid:"",
    wenzhang:[],
      message:[],
      pinglunguode:[],
      ban:false,
      isadmin:false,
      fuyuanli: {
        max: 10,
        gap: 10,
        Level: 1,
        shengli: 0,
        xinli: 0,
        qingxu: 0,
        shejiao: 0
      },
      max: 10,
      Level: 1,  
      isadmin:false,
      qingsu:[],},

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
          // data: res.userInfo
          userInfo: res.userInfo,
          avatarUrl:res.userInfo.avatarUrl,
          nickName:res.userInfo.nickName
        })
        app.globalData.userInfo.nickName=this.nickName
        console.log("nickName=",app.globalData.userInfo.nickName)
        app.globalData.userInfo.isLogin=true
        console.log("isLogin=",app.globalData.userInfo.isLogin)
        //去自己家数据库进行查询,看一下当前用户的最新数据
        this.login()
      }
    })
  },
  //访问自己家数据库执行登录业务
  //1.若在users集合中找到用户信息,那么直接更新UI
  //2.若在users集合中没有找到用户信息,执行注册业务
  login() {
    const db = wx.cloud.database();
    db.collection('users').where({
      _openid: this.data.userInfo._openid // 查询条件为当前用户的 openId
    }).get().then(res => {
      console.log('查询当前用户', res);
      if (res.data.length === 0) { // 没有查到用户
        this.regist(); // 调一个方法，去注册
      } else { // 查到了用户
        const userInfo = res.data[0]; // 拿到数据库里面数据
        this.setData({ userInfo }); // 直接更新到 data，这样页面就更新了
        const { shengli, xinli, qingxu, shejiao, max, gap, Level } = userInfo.fuyuanli; // 获取用户信息中的各个值
        this.setData({
          'fuyuanli.shengli': shengli,
          'fuyuanli.qingxu': qingxu,
          'fuyuanli.xinli': xinli,
          'fuyuanli.shejiao': shejiao,
          'fuyuanli.max': max, // 将 max 的值更新到页面中
          'fuyuanli.gap': gap,
          'fuyuanli.Level': Level
        });
      }
    }).catch(err => {
      console.error('查询用户信息失败', err);
    });
  },
  //注册业务  将userInfo存入users集合
  regist(){
    let db = wx.cloud.database() //获取数据库信息
    db.collection('users').add({  //在users中添加数据
      // data:this.data.userInfo,    //把userInfo中的新数据存入data
      userInfo:this.data.userInfo,
      data:this.data,
      success:(res)=>{
        console.log('注册用户',res) //执行成功后打印
        app.globalData.userInfo._id=res._id
        // console.log("全局id：",app.globalData.userInfo._id)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.login({
      timeout: 0,
      success: (result) => {},
      fail: (res) => {},
      complete: (res) => {},
    });
    
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
        isLogin: isLogin,
        avatarUrl:userInfo.avatarUrl
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

  },
  addSL() {
    this.updateAttribute("shengli", () => {
      this.saveToCloud();
    });
  },
  
  addXL() {
    this.updateAttribute("xinli", () => {
      this.saveToCloud();
    });
  },
  
  addQX() {
    this.updateAttribute("qingxu", () => {
      this.saveToCloud();
    });
  },
  
  addSJ() {
    this.updateAttribute("shejiao", () => {
      this.saveToCloud();
    });
  },
  
  updateAttribute(attributeName, callback) {
    const { fuyuanli, gap, Level } = this.data;
    const attributeValue = fuyuanli[attributeName] + 1;
    fuyuanli[attributeName] = attributeValue;
  
    // 判断是否需要更新 max 属性
    if (fuyuanli.shengli >= fuyuanli.max && fuyuanli.xinli >= fuyuanli.max && fuyuanli.qingxu >= fuyuanli.max && fuyuanli.shejiao >= fuyuanli.max) {
      const newMax = fuyuanli.max + fuyuanli.gap;
      const newGap = fuyuanli.gap + 5;
      const newLevel = fuyuanli.Level + 1;
      this.setData({
        'fuyuanli.max': newMax,
        'fuyuanli.gap': newGap,
        'fuyuanli.Level': newLevel
      }, () => {
        callback(); // 在更新 fuyuanli 后，执行回调函数
      });
    } else {
      this.setData({
        'fuyuanli': fuyuanli
      }, () => {
        callback(); // 在更新 fuyuanli 后，执行回调函数
      });
    }
  },
  
  saveToCloud() {
    const db = wx.cloud.database();
    db.collection('users').doc(this.data.userInfo._id).update({
      data: {
        fuyuanli: this.data.fuyuanli,
        max: this.data.max,
        gap: this.data.gap,
        Level: this.data.Level
      },
      success: function(res) {
        console.log('保存数据到云数据库成功', res.data);
      },
      fail: function(res) {
        console.error('保存数据到云数据库失败', res);
      }
    });
  },
})