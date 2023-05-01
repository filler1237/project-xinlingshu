
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

        this.setData({
          isLogin: true,
          userInfo: res.userInfo,
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName
        });

        this.login();
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
      }
    });
  },

  login() {
    const db = wx.cloud.database();
    db.collection('users').where({
      openid: this.data.userInfo.openid 
    }).get().then(res => {
      console.log('查询当前用户', res);
      if (res.data.length === 0) { // 没有查到用户,执行注册业务
        this.regist(); 
      } else { 
        const userInfo = res.data[0]; 
        this.setData({ userInfo });
      }
    }).catch(err => {
      console.error('查询用户信息失败', err);
    });
  },
  
  // 注册业务  
  regist(){
    let db = wx.cloud.database() 
    db.collection('users').add({  
      userInfo:this.data.userInfo,
      data:this.data,
      success:(res)=>{  
        console.log('注册用户',res) 
        // 将新注册用户的 _id 存入全局数据
        app.globalData.userInfo._id=res._id  
      }
    })
  },
  

  onLoad: function () {
    const openid = wx.getStorageSync('openid');
    if (openid) {
      this.setData({
        openid: openid,
        isLogin: true,
      });
      this.login(openid);
    }
  },

  onReady() {
    let userInfo = wx.getStorageSync('userInfo');
    let isLogin = wx.getStorageSync('isLogin');
    if (userInfo && isLogin) {
      this.setData({
        userInfo: userInfo,
        isLogin: isLogin,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      });
      this.login();
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