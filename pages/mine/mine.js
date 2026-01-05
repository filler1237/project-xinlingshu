// pages/mine/mine.js
// pages/mine/mine.js
const app = getApp();

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
    
    // 新增：身份选择相关
    showIdentityPopup: false, // 身份选择弹窗
    selectedIdentity: '', // 用户选择的身份
    tempUserProfile: null, // 临时保存用户信息
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
    }
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
        // 保存用户信息，显示身份选择弹窗
        this.setData({
          tempUserProfile: res.userInfo,
          showIdentityPopup: true
        });
      },
      fail: () => {
        wx.showToast({ title: '授权失败', icon: 'none' });
      }
    });
  },
  
  /**
   * 3. 选择身份
   */
  onChooseIdentity(e) {
    const identity = e.currentTarget.dataset.identity;
    this.setData({
      selectedIdentity: identity
    });
    
    // 确认选择并执行登录
    wx.showModal({
      title: '身份确认',
      content: `您选择的是${this.getIdentityText(identity)}身份，确认登录吗？`,
      success: (res) => {
        if (res.confirm) {
          // 使用修复版登录
          this.loginWithIdentityFixed(identity);
        }
      }
    });
  },

  /**
   * 4. 修复版：根据选择的身份执行登录
   */
  loginWithIdentityFixed: function(identity) {
    const that = this;
    wx.showLoading({ title: '登录中...' });
    
    console.log("🎯 登录选择的身份:", identity);
    
    wx.cloud.callFunction({
      name: 'loginRegister',
      data: {
        avatarUrl: this.data.tempUserProfile.avatarUrl,
        nickName: this.data.tempUserProfile.nickName,
        identity: identity
      }
    }).then(res => {
      wx.hideLoading();
      console.log("📡 云函数返回:", res);
      
      if (res.result && res.result.userInfo) {
        const { userInfo } = res.result;
        console.log("云函数返回的身份:", userInfo.identity);
        
        // 🔥 关键修复：强制使用前端选择的身份
        const correctedUserInfo = {
          ...userInfo,
          identity: identity  // 覆盖云函数返回的身份
        };
        
        console.log("✅ 修正后的身份:", correctedUserInfo.identity);
        
        // 更新用户信息（使用修正后的身份）
        that.updateUserInfo(correctedUserInfo);
        
        // 根据前端选择的身份进行跳转
        that.redirectAfterLoginFixed(identity);
      } else {
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      }

    }).catch(err => {
      wx.hideLoading();
      console.error("登录失败:", err);
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
    });
  },

  /**
   * 5. 修复版：登录后根据身份跳转
   */
  redirectAfterLoginFixed: function(identity) {
    console.log("🚀 跳转，使用身份:", identity);
    
    // 关闭身份选择弹窗
    this.setData({ 
      showIdentityPopup: false,
      tempUserProfile: null 
    });
    
    // 显示登录成功提示
    wx.showToast({
      title: this.getIdentityText(identity) + '登录成功',
      icon: 'success',
      duration: 1500
    });
    
    // 根据身份跳转
    let targetUrl = '';
    let identityText = '';
    
    switch(identity) {
      case 'student':
        targetUrl = '/competition/pages/studenthome/studenthome';
        identityText = '学生';
        break;
      case 'admin':
        targetUrl = '/competition/pages/adminhome/adminhome';
        identityText = '管理员';
        break;
      case 'judge':
        targetUrl = '/competition/pages/judgehome/judgehome';
        identityText = '评委';
        break;
      default:
        console.log("未知身份，不跳转");
        return;
    }
    
    console.log(`📌 跳转到 ${identityText} 页面: ${targetUrl}`);
    
    // 延迟跳转，确保toast显示完整
    setTimeout(() => {
      wx.redirectTo({
        url: targetUrl,
        success: (res) => {
          console.log(`✅ ${identityText}页面跳转成功`);
        },
        fail: (err) => {
          console.error(`❌ ${identityText}页面跳转失败:`, err);
          
          // 跳转失败提示
          wx.showModal({
            title: '跳转失败',
            content: `${identityText}页面跳转失败，错误：${err.errMsg}`,
            showCancel: false
          });
        }
      });
    }, 1500);
  },

  /**
   * 6. 获取身份文本
   */
  getIdentityText(identity) {
    const identityMap = {
      'student': '学生',
      'admin': '管理员', 
      'judge': '评委'
    };
    return identityMap[identity] || '用户';
  },

  /**
   * 7. 关闭身份选择弹窗
   */
  onCloseIdentityPopup() {
    this.setData({
      showIdentityPopup: false,
      tempUserProfile: null,
      selectedIdentity: ''
    });
  },

  /**
   * 8. 统一更新用户信息的方法
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

  // ... 其他方法保持不变
  /**
   * 9. 检查身份绑定状态
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

  /**
   * 活动系统点击处理
   */
  onActivitySystemTap: function() {
    console.log("点击活动系统", this.data.isLogin, this.data.userInfo);
    
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    // 安全获取用户身份，添加更多调试信息
    const userInfo = this.data.userInfo;
    console.log("完整用户信息:", userInfo);
    
    if (!userInfo) {
      wx.showToast({
        title: '用户信息获取失败',
        icon: 'none'
      });
      return;
    }
    
    // 获取身份，如果没有身份字段则默认为学生
    const identity = userInfo.identity || 'student';
    console.log("用户身份:", identity);
    
    let targetUrl = '';
    
    switch(identity) {
      case 'student':
        targetUrl = '/competition/pages/studenthome/studenthome';
        break;
      case 'admin':
        targetUrl = '/competition/pages/adminhome/adminhome';
        break;
      case 'judge':
        targetUrl = '/competition/pages/judgehome/judgehome';
        break;
      default:
        wx.showToast({
          title: '身份信息异常',
          icon: 'none'
        });
        return;
    }
    
    console.log("跳转到:", targetUrl);
    
    wx.navigateTo({
      url: targetUrl,
      success: (res) => {
        console.log("页面跳转成功", res);
      },
      fail: (err) => {
        console.error("页面跳转失败:", err);
        this.showPathErrorDialog(identity, targetUrl, err);
      }
    });
  },

  /**
   * 显示路径错误对话框
   */
  showPathErrorDialog: function(identity, path, err) {
    wx.showModal({
      title: '跳转失败',
      content: `${identity}页面跳转失败\n路径: ${path}\n错误: ${err.errMsg}\n请检查页面是否存在且路径正确`,
      showCancel: false
    });
  },

  /**
   * 路径诊断功能
   */
  diagnoseNavigation: function() {
    console.log("=== 开始诊断跳转路径 ===");
    
    const testPaths = [
      {
        name: "管理员路径",
        url: "/competition/pages/adminhome/adminhome"
      },
      {
        name: "评委路径", 
        url: "/competition/pages/judgehome/judgehome"
      },
      {
        name: "学生路径",
        url: "/competition/pages/studenthome/studenthome"
      }
    ];
    
    testPaths.forEach((test, index) => {
      setTimeout(() => {
        console.log(`测试 ${test.name}: ${test.url}`);
        wx.navigateTo({
          url: test.url,
          success: () => {
            console.log(`✅ ${test.name} 成功`);
            // 成功后立即返回
            setTimeout(() => {
              wx.navigateBack();
            }, 500);
          },
          fail: (err) => {
            console.log(`❌ ${test.name} 失败: ${err.errMsg}`);
          }
        });
      }, index * 1000);
    });
  },

  /**
   * 清除缓存并重新登录
   */
  clearCacheAndRelogin: function() {
    // 清除本地缓存
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('openid');
    
    // 重置页面状态
    this.setData({
      isLogin: false,
      userInfo: null,
      avatarUrl: "cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/默认头像.jpeg",
      nickName: "游客，点击登录"
    });
    
    app.globalData.userInfo = null;
    app.globalData.isLogin = false;
    
    wx.showToast({
      title: '缓存已清除，请重新登录',
      icon: 'success'
    });
    
    // 重新获取openid
    this.getOpenid();
  },

  /**
   * 检查用户状态
   */
  checkUserStatus: function() {
    console.log("=== 用户状态检查 ===");
    console.log("登录状态:", this.data.isLogin);
    console.log("用户信息:", this.data.userInfo);
    console.log("用户身份:", this.data.userInfo ? this.data.userInfo.identity : "未获取");
    
    wx.showModal({
      title: '用户状态',
      content: `登录: ${this.data.isLogin}\n身份: ${this.data.userInfo ? this.data.userInfo.identity : "未获取"}`,
      showCancel: false
    });
  }
});