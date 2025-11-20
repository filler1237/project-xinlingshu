// pages/auth/login/login.js


//登录功能一共用到两个云函数：passwordLogin loginRegister 前者面向教师评委，后者面向学生（使用微信的授权登录）
const app = getApp();

Page({
  data: {
    loginStep: 1, // 1: 角色选择, 2: 账密登录
    roles: ['教师', '评委'],
    roleIndex: 0,
    username: '',
    password: ''
  },

  onStudentLogin() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.loginWithWechat('student', res.userInfo);
      },
      fail: () => {
        wx.showToast({ title: '授权失败', icon: 'none' });
      }
    });
  },

  showFormLogin() {
    this.setData({
      loginStep: 2
    });
  },

  onRoleChange(e) {
    this.setData({
      roleIndex: e.detail.value
    });
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  onFormLogin() {
    const { username, password } = this.data;
    const role = this.data.roleIndex == 0 ? 'admin' : 'judge';

    if (!username || !password) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '登录中...' });

    // --- 新增：本地测试账号登录 ---
    const testUsers = [
      { _id: 'test-admin-01', username: 'admin01', password: '123456', role: 'admin', nickName: '测试管理员' },
      { _id: 'test-judge-01', username: 'judge01', password: '123456', role: 'judge', nickName: '测试评委' },
      { _id: 'test-admin-02', username: 'wangzhenzhen', password: '123456', role: 'admin', nickName: '王贞贞' },
      { _id: 'test-admin-03', username: 'yaoshuangyan', password: '123456', role: 'admin', nickName: '姚双雁' },
      { _id: 'test-admin-04', username: 'liyaling', password: '123456', role: 'admin', nickName: '李亚玲' }
    ];

    const matchedUser = testUsers.find(user =>
      user.username === username && user.password === password && user.role === role
    );

    if (matchedUser) {
      // 匹配到测试用户，模拟登录
      wx.hideLoading();
      const userInfo = matchedUser;
      app.globalData.userInfo = userInfo;
      app.globalData.isLogin = true;
      wx.setStorageSync('userInfo', userInfo);
      wx.showToast({ title: '登录成功 (测试模式)', icon: 'success', duration: 1500 });
      setTimeout(() => wx.navigateBack(), 1500);
      return; // 结束函数执行
    }
    // --- 本地测试账号登录结束 ---

    // 如果不是测试用户，则继续调用云函数
    wx.cloud.callFunction({
      name: 'passwordLogin',
      data: { username, password, role }
    }).then(res => {
      wx.hideLoading();
      if (res.result && res.result.success) {
        const { userInfo } = res.result;
        
        // 强制刷新用户信息，确保获取最新角色
        const db = wx.cloud.database();
        db.collection('users').doc(userInfo._id).get().then(userRes => {
          const refreshedUserInfo = userRes.data;
          app.globalData.userInfo = refreshedUserInfo;
          app.globalData.isLogin = true;
          wx.setStorageSync('userInfo', refreshedUserInfo);
          wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 });
          setTimeout(() => wx.navigateBack(), 1500);
        }).catch(err => {
          // 如果刷新失败，仍然使用云函数返回的数据
          app.globalData.userInfo = userInfo;
          app.globalData.isLogin = true;
          wx.setStorageSync('userInfo', userInfo);
          wx.showToast({ title: '登录成功 (数据可能延迟)', icon: 'success', duration: 1500 });
          setTimeout(() => wx.navigateBack(), 1500);
        });
      } else {
        wx.showToast({ title: res.result.message || '登录失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '登录异常: ' + err.errMsg, icon: 'none' });
    });
  },

  loginWithWechat(role, userInfo) {
    wx.showLoading({ title: '登录中...' });
    
    wx.cloud.callFunction({
      name: 'loginRegister',
      data: {
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName,
        role: role
      }
    }).then(res => {
      wx.hideLoading();
      if (res.result && res.result.userInfo) {
        const { userInfo } = res.result;
        app.globalData.userInfo = userInfo;
        app.globalData.isLogin = true;
        wx.setStorageSync('userInfo', userInfo);
        wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 });
        setTimeout(() => wx.navigateBack(), 1500);
      } else {
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '登录失败: ' + err.errMsg, icon: 'none' });
    });
  }
});
