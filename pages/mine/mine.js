
const cloud = require('../../utils/cloud.js')
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
    nickName: "Hi,游客,点击去登录吧!",
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
      }, },
    //登录函数
//登录 函数
  //登录函数
  toLogin() {
    if (this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/auth/usercenter/usercenter',
      });
      return;
    }
    wx.getUserProfile({
      desc: '获取用户信息用于维护会员权益',
      success: (res) => {
        console.log('获取用户信息', res);

        // 登录成功，将用户数据存入data，更新UI
        this.setData({
          isLogin: true,
          userInfo: res.userInfo,
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName
        });

        // 去自己家数据库进行查询，看一下当前用户的最新数据
        this.login();
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
      }
    });
  },

  login() {
    const userInfo = this.data.userInfo;
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        const openid = res.result.openid;
        this.setData({ openid });
        db.collection('users').where({
          openid: openid,
        }).get().then(res => {
          console.log('查询当前用户', res);
          if (res.data.length === 0) {
            // 没有查到用户，执行注册业务
            try {
              this.regist();
            } catch (err) {
              console.error('注册用户失败', err);
            }
          } else {
// 查到了用户
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
      fail: err => {
        console.error('调用云函数失败', err);
      }
    });
  },

  regist() {
    const userInfo = this.data.userInfo;
    db.collection('users').add({
      data: {
        userInfo: userInfo,
        data: this.data,
        openid: this.data.openid
      },
      success: (res) => {
        console.log('注册用户', res);
      },
      fail: (err) => {
        console.error('注册用户失败', err);
      }
    });
  },

  onLoad(options) {
    wx.login({
      timeout: 0,
      success: (result) => {},
      fail: (res) => {},
      complete: (res) => {},
    });
  },

  onReady() {
    let userInfo = wx.getStorageSync('userInfo');
    let isLogin = wx.getStorageSync('isLogin');
    if (userInfo && isLogin) {
      this.setData({
        userInfo: userInfo,
        isLogin: isLogin,
        avatarUrl: userInfo.avatarUrl
      });
    } else {
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