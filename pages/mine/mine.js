// 引入云开发模块和全局变量
const cloud = require('../../utils/cloud.js') // 引入自定义的云开发模块
const app = getApp(); // 获取全局对象
// 引入云数据库
const db = wx.cloud.database(); // 获取云数据库对象
Page({
  // 页面初始化数据
  data: {
      // 初始化用户头像、昵称
      avatarUrl: "https://i.postimg.cc/qqWgStbK/a.jpg",
      nickName: "游客，点击登录",
      username:'',
      userInfo:{},
      openid:"",
      isLogin:false,
      _id:"",
      id:"",
      wenzhang:[],
      message:[],
      pinglunguode:[],
      ban:false,
      isadmin:false,
      max: 10,
      Level: 1,
      fuyuanli: {
        max: 10,
        gap: 10,
        Level: 1,
        shengli: 0,
        xinli: 0,
        qingxu: 0,
        shejiao: 0
      },
  },
  // 登录函数
  toLogin() {
    // 判断用户是否已登录
    if (this.data.isLogin) {
      // 如果已登录，跳转到用户中心页面
      wx.navigateTo({
        url: '/pages/auth/usercenter/usercenter',
      });
      return;
    }
    // 如果未登录，获取用户信息
    wx.getUserProfile({
      desc: '获取用户信息用于维护会员权益',
      success: (res) => {
        console.log('获取用户信息', res);
        // 将获取到的用户信息存入页面数据中
        this.setData({
          isLogin: true,
          userInfo: res.userInfo,
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName,
          id:res._id
        });
        // 将用户信息存入全局数据中
        app.globalData.userInfo.nickName=this.nickName
        console.log("nickName=",app.globalData.userInfo.nickName)
        app.globalData.userInfo.isLogin=true
        console.log("isLogin=",app.globalData.userInfo.isLogin)
        // 执行登录函数
        this.login();
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
      }
    });
  },

  login() {
    const db = wx.cloud.database();
    // 查询当前用户是否已注册
    db.collection('users').where({
      openid: this.data.userInfo.openid 
    }).get().then(res => {
      console.log('查询当前用户', res);
      if (res.data.length === 0) { // 如果没有查到用户，执行注册业务
        this.regist(); 
      } else { // 如果查到用户，获取用户信息和复原力数据
        const userInfo = res.data[0]; 
        this.setData({ userInfo });
        // 获取fuyuanli数据
        db.collection('users').doc(userInfo._id).get().then(res => {
          console.log('获取复原力数据', res);
          const fuyuanli = res.data.fuyuanli;
          app.globalData.userInfo.openid = res.data._openid; // 将获取到的 openid 存入全局变量
          console.log(app.globalData.userInfo.openid)
          // 更新本地数据
          this.setData({ fuyuanli });
        }).catch(err => {
          console.error('获取复原力数据失败', err);
        });
      }
    }).catch(err => {
      console.error('查询用户信息失败', err);
    });
  },

  // 页面加载时执行的函数
  onLoad: function() {
    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        // 将返回的 openid 保存到本地存储
        wx.setStorageSync('openid', res.result.openid) 
        this.setData({
          openid: res.result.openid
        })
      }
    })
  },
  
  // 注册业务  
  regist() {
    const userInfo = this.data.userInfo
    
    wx.setStorageSync('userInfo', userInfo)
  
    db.collection('users').add({
      data: {
        userInfo  
      }
    })
  },
  

  // 页面初次渲染完成时执行的函数
  onReady() {
    // 从本地存储中获取用户信息和登录状态
    let userInfo = wx.getStorageSync('userInfo');
    let isLogin = wx.getStorageSync('isLogin');
    if (userInfo && isLogin) {
      // 如果本地存储中存在用户信息和登录状态，将其存入页面数据中
      this.setData({
        userInfo: userInfo,
        isLogin: isLogin,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      });
      // 执行登录函数
      this.login();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  onShow() {
    const openid = wx.getStorageSync('openid')
    const userInfo = wx.getStorageSync('userInfo')
    const isLogin = wx.getStorageSync('isLogin')

    if (isLogin && userInfo) {
      this.setData({isLogin, userInfo})
      return 
    }

    if (openid) {
      // 使用本地的 openid 查询云数据库
      wx.cloud.database().collection('users')
        .where({
          openid  
        })
        .get()
        .then(res => {
          if (res.data.length > 0) {
            const userInfo = res.data[0]

            // 保存到本地存储
            wx.setStorageSync('userInfo', userInfo)
            wx.setStorageSync('isLogin', true)

            this.setData({userInfo, isLogin: true})
          }
        })  
    }
        // 设置页面标题
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
  
  // 增加生理值
  addSL() {
    // 更新生理值属性并保存到云数据库
    this.updateAttribute("shengli", () => {
      this.saveToCloud();
    });
  },
  
  // 增加心理值
  addXL() {
    // 更新心理值属性并保存到云数据库
    this.updateAttribute("xinli", () => {
      this.saveToCloud();
    });
  },
  
  // 增加情绪值
  addQX() {
    // 更新情绪值属性并保存到云数据库
    this.updateAttribute("qingxu", () => {
      this.saveToCloud();
    });
  },
  
  // 增加社交值
  addSJ() {
    // 更新社交值属性并保存到云数据库
    this.updateAttribute("shejiao", () => {
      this.saveToCloud();
    });
  },
  
  // 更新属性值函数
  updateAttribute(attributeName, callback) {
      // 使用当前登录用户的 _id
  const { fuyuanli, gap, Level } = this.data.userInfo;
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