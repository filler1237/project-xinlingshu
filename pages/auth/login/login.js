// pages/auth/login/login.js

// 登录功能一共用到两个云函数：
// passwordLogin —— 教师 / 评委（账号密码）
// loginRegister —— 学生（微信授权登录）
const app = getApp();

Page({
  data: {
    loginStep: 1, // 1: 角色选择, 2: 账密登录
    roles: ['教师', '评委'],
    roleIndex: 0,
    username: '',
    password: ''
  },

  // ======================
  // 学生：微信授权登录
  // ======================
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

  // 显示账密登录表单
  showFormLogin() {
    this.setData({
      loginStep: 2
    });
  },

  // 角色选择
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

  // ======================
  // 教师 / 评委：账号密码登录
  // ======================
  onFormLogin() {
    const { username, password } = this.data;
    // ⚠️ 关键修改：角色与数据库保持一致
    const role = this.data.roleIndex == 0 ? 'admin' : 'judge';
    if (!username || !password) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '登录中...' });
    // 正式调用云函数登录
    wx.cloud.callFunction({
      name: 'passwordLogin',
      data: {
        username,
        password,
        role
      }
    }).then(res => {
      wx.hideLoading();

      if (res.result && res.result.success) {
        const { userInfo } = res.result;

        // ⚠️ 不再从前端直接查 users 表
        app.globalData.userInfo = userInfo;
        app.globalData.isLogin = true;
        wx.setStorageSync('userInfo', userInfo);

        wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 });
        setTimeout(() => wx.navigateBack(), 1500);
      } else {
        wx.showToast({
          title: res.result.message || '登录失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '登录异常: ' + err.errMsg,
        icon: 'none'
      });
    });
  },

  // ======================
  // 微信登录（学生）
  // ======================
  loginWithWechat(role, userInfo) {
    wx.showLoading({ title: '登录中...' });

    wx.cloud.callFunction({
      name: 'loginRegister',
      data: {
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName,
        role
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
      wx.showToast({
        title: '登录失败: ' + err.errMsg,
        icon: 'none'
      });
    });
  }
});
