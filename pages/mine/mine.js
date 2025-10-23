// pages/mine/mine.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    // 页面显示的最终数据
    avatarUrl: "cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/默认头像.jpeg",
    nickName: "游客，点击登录",
    
    // 内部状态数据
    isLogin: false,
    userInfo: null,
    openid: null,

    // 编辑弹窗相关
    showEditProfilePopup: false,
    editingNickName: '',
    tempAvatarUrl: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.getOpenid();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次页面显示时，检查缓存并尝试从服务器刷新用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo._id) {
      this.setData({
        isLogin: true,
        userInfo: userInfo,
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName
      });
      app.globalData.userInfo = userInfo;
      app.globalData.isLogin = true;
      // 刷新用户信息，以同步最新的身份绑定状态等
      this.refreshUserInfo(userInfo._id);
    }
  },

  /**
   * 从数据库刷新最新的用户信息
   */
  refreshUserInfo(userId) {
    db.collection('users').doc(userId).get().then(res => {
      const freshUserInfo = res.data;
      console.log("刷新用户信息成功", freshUserInfo);
      this.updateUserInfo(freshUserInfo); // 使用统一的函数来更新数据
      this.checkIdentityBound(freshUserInfo);
    }).catch(err => {
      console.error("刷新用户信息失败", err);
    });
  },

  /**
   * 1. 获取 OpenID
   */
  getOpenid() {
    wx.cloud.callFunction({
      name: 'login',
    }).then(res => {
      console.log("获取 openid 成功", res.result.openid);
      this.setData({ openid: res.result.openid });
      wx.setStorageSync('openid', res.result.openid);
    }).catch(err => {
      console.error("获取 openid 失败", err);
    });
  },

  /**
   * 2. 用户点击登录按钮
   */
  handleLogin() {
    if (this.data.isLogin) return;
    if (!this.data.openid) {
      wx.showToast({ title: '网络繁忙，请稍后重试', icon: 'none' });
      this.getOpenid();
      return;
    }
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.loginOrRegister(res.userInfo);
      },
      fail: () => {
        wx.showToast({ title: '授权失败', icon: 'none' });
      }
    });
  },

  /**
   * 3. 调用云函数进行登录或注册
   */
  loginOrRegister(profile) {
    const that = this; // 保存页面实例的 this 上下文
    wx.showLoading({ title: '登录中...' });
    wx.cloud.callFunction({
      name: 'loginRegister',
      data: {
        avatarUrl: profile.avatarUrl,
        nickName: profile.nickName
      }
    }).then(res => {
      wx.hideLoading();
      const { userInfo } = res.result;
      console.log("登录/注册成功", userInfo);

      // 使用保存的 that 来调用页面函数
      that.updateUserInfo(userInfo);
      that.checkIdentityBound(userInfo);

    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '登录失败', icon: 'none' });
      console.error("登录/注册云函数调用失败", err);
    });
  },

  /**
   * 4. 统一更新用户信息的方法 (这个函数必须存在)
   */
  updateUserInfo(userInfo) {
    this.setData({
      isLogin: true,
      userInfo: userInfo,
      avatarUrl: userInfo.avatarUrl,
      nickName: userInfo.nickName
    });
    app.globalData.userInfo = userInfo;
    app.globalData.isLogin = true;
    wx.setStorageSync('userInfo', userInfo);
  },

  /**
   * 5. 检查身份绑定状态 (这个函数也必须存在)
   */
  checkIdentityBound(userInfo) {
    if (userInfo && !userInfo.isIdentityBound) {
      wx.showModal({
        title: '身份绑定提示',
        content: '为了更好地为您服务，请绑定您的身份信息。',
        confirmText: '去绑定',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/auth/usercenter/usercenter',
            });
          } 
        }
      });
    }
  },

  // --- 编辑个人信息相关方法 ---
  onEditProfileTap() {
    if (!this.data.isLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    this.setData({
      showEditProfilePopup: true,
      editingNickName: this.data.userInfo.nickName,
      tempAvatarUrl: this.data.userInfo.avatarUrl,
    });
  },

  onCloseEditProfilePopup() {
    this.setData({ showEditProfilePopup: false });
  },

  onNickNameInput(e) {
    this.setData({ editingNickName: e.detail.value });
  },

  onChangeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ tempAvatarUrl: res.tempFiles[0].tempFilePath });
      },
    });
  },

  async onSaveProfile() {
    wx.showLoading({ title: '保存中...' });
    let newAvatarUrl = this.data.userInfo.avatarUrl;
    if (this.data.tempAvatarUrl !== this.data.userInfo.avatarUrl) {
      try {
        newAvatarUrl = await this.uploadFileToCloud(this.data.tempAvatarUrl);
      } catch (e) {
        wx.hideLoading();
        wx.showToast({ title: '头像上传失败', icon: 'none' });
        return;
      }
    }
    wx.cloud.callFunction({
      name: 'updateUserProfile',
      data: {
        nickName: this.data.editingNickName,
        avatarUrl: newAvatarUrl,
      },
    }).then(res => {
      wx.hideLoading();
      if (res.result.success) {
        wx.showToast({ title: '保存成功' });
        const newUserInfo = { ...this.data.userInfo, nickName: this.data.editingNickName, avatarUrl: newAvatarUrl };
        this.updateUserInfo(newUserInfo);
        this.onCloseEditProfilePopup();
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' });
      }
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  },

  uploadFileToCloud(filePath) {
    return new Promise((resolve, reject) => {
      const cloudPath = `user_avatars/${this.data.openid}-${Date.now()}.png`;
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success: res => resolve(res.fileID),
        fail: err => reject(err),
      });
    });
  },
  
  doNothing() {
    // 用于阻止事件冒泡
  },

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
          title: `签到成功！+${res.result.reward}水滴`,
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
