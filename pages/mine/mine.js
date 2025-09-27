// pages/mine/mine.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    // 页面显示的最终数据
    avatarUrl: "/assets/默认头像.jpeg", // 使用本地默认头像
    nickName: "游客，点击登录",
    
    // 内部状态数据
    isLogin: false,
    userInfo: null, // 用于存储从数据库获取的完整用户信息，包含_id, fuyuanli等
    openid: null
  },

  /**
   * 生命周期函数--监听页面加载
   * 页面加载时，只做一件事：尝试从云函数获取 openid
   */
  onLoad: function() {
    this.getOpenid();
  },

  /**
   * 生命周期函数--监听页面显示
   * 每次进入页面时，检查本地缓存，看是否能恢复登录状态
   */
  onShow() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      console.log("从缓存中恢复登录状态", userInfo);
      this.setData({
        isLogin: true,
        userInfo: userInfo,
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName
      });
      app.globalData.userInfo = userInfo;
      app.globalData.isLogin = true;
    }
  },

  /**
   * 1. 获取 OpenID
   * 调用云函数获取用户的 openid，这是识别用户的唯一凭证
   */
  getOpenid() {
    wx.cloud.callFunction({
      name: 'login', // 调用login云函数得到openid
    }).then(res => {
      console.log("获取 openid 成功", res.result.openid);
      this.setData({
        openid: res.result.openid
      });
      wx.setStorageSync('openid', res.result.openid);
    }).catch(err => {
      console.error("获取 openid 失败", err);
    });
  },

  /**
   * 2. 用户点击登录按钮
   * 这是整个登录流程的核心触发点
   */
  handleLogin() {
    if (this.data.isLogin) {
      // 如果已登录，可以跳转到其他页面，或不执行任何操作
      console.log("用户已登录");
      return;
    }

    if (!this.data.openid) {
      wx.showToast({
        title: '网络繁忙，请稍后重试',
        icon: 'none'
      });
      this.getOpenid(); // 如果 openid 还未获取到，则再次尝试
      return;
    }

    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const profile = res.userInfo;
        console.log("获取用户 Profile 成功", profile);

        // 调用云函数，将用户信息和 openid 发送到后端进行登录或注册
        this.loginOrRegister(profile);
      },
      fail: () => {
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 3. 调用云函数进行登录或注册
   * @param {object} profile 从 wx.getUserProfile 获取的用户基本信息
   */
  loginOrRegister(profile) {
    wx.showLoading({
      title: '登录中...',
    });
    wx.cloud.callFunction({
      name: 'loginRegister', // 调用我们之前讨论过的统一登录注册云函数
      data: {
        avatarUrl: profile.avatarUrl,
        nickName: profile.nickName
        // 云函数会自动从上下文中获取 openid
      }
    }).then(res => {
      wx.hideLoading();
      const { userInfo } = res.result; // 云函数应返回完整的用户信息
      console.log("登录/注册成功，获取到用户信息", userInfo);

      // 更新页面数据和全局状态
      this.setData({
        isLogin: true,
        userInfo: userInfo,
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName
      });
      app.globalData.userInfo = userInfo;
      app.globalData.isLogin = true;

      // 将用户信息存入本地缓存，以便下次打开小程序时自动登录
      wx.setStorageSync('userInfo', userInfo);

    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
      console.error("登录/注册云函数调用失败", err);
    });
  },

  /**
   * 更新复原力属性
   * @param {string} attributeName 要更新的属性名 (shengli, xinli, etc.)
   */
  updateFuyuanli(attributeName) {
    if (!this.data.isLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    let { userInfo } = this.data;
    let fuyuanli = userInfo.fuyuanli || { max: 10, gap: 10, Level: 1, shengli: 0, xinli: 0, qingxu: 0, shejiao: 0 };

    fuyuanli[attributeName]++;

    // 检查是否升级
    if (fuyuanli.shengli >= fuyuanli.max && fuyuanli.xinli >= fuyuanli.max && fuyuanli.qingxu >= fuyuanli.max && fuyuanli.shejiao >= fuyuanli.max) {
      fuyuanli.Level++;
      fuyuanli.max += fuyuanli.gap;
      fuyuanli.gap += 5;
      // 清零或不清零，根据你的业务逻辑决定
      fuyuanli.shengli = 0;
      fuyuanli.xinli = 0;
      fuyuanli.qingxu = 0;
      fuyuanli.shejiao = 0;
    }
    
    // 更新数据库
    db.collection('users').doc(userInfo._id).update({
      data: {
        fuyuanli: fuyuanli
      }
    }).then(() => {
      console.log("复原力更新成功");
      // 更新本地数据以实时反映变化
      this.setData({
        'userInfo.fuyuanli': fuyuanli
      });
      wx.setStorageSync('userInfo', this.data.userInfo); // 同步更新缓存
    }).catch(console.error);
  },

  // 示例：点击按钮调用更新函数
  addSL() { this.updateFuyuanli("shengli"); },
  addXL() { this.updateFuyuanli("xinli"); },
  addQX() { this.updateFuyuanli("qingxu"); },
  addSJ() { this.updateFuyuanli("shejiao"); },

  /**
   * 用户点击每日签到按钮
   */
  onSignIn() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '签到中...',
    });

    wx.cloud.callFunction({
      name: 'taskSignIn',
    }).then(res => {
      wx.hideLoading();
      if (res.result.code === 0) {
        wx.showToast({
          title: `签到成功！获得 ${res.result.reward} 水滴`,
          icon: 'success'
        });
        // 可以在这里更新本地的水滴数量，如果需要实时显示的话
      } else {
        // 其他情况，例如已经签到或失败
        wx.showToast({
          title: res.result.message,
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '签到失败，请稍后再试',
        icon: 'none'
      });
      console.error("签到云函数调用失败", err);
    });
  },
});
