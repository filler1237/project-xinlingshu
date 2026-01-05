Page({
  data: {
    username: '',
    password: '',
    loginType: 'student'
  },

  onLoad() {
    // 检查是否已登录，如果已登录直接跳转到对应主页
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.redirectToHomePage(userInfo.role);
    }
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onLoginTypeChange(e) {
    this.setData({ loginType: e.detail.value });
  },

  // 登录
  onLogin() {
    const { username, password, loginType } = this.data;
    
    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '登录中...',
    });

    // 测试模式登录（不使用云函数）
    this.testLogin();
  },

  // 测试模式登录
  testLogin() {
    const { username, password, loginType } = this.data;
    
    // 模拟登录验证
    const testUsers = {
      student: { 
        username: 'student01', 
        password: '123456', 
        role: 'student', 
        department: '计算机学院',
        studentId: '20240001'
      },
      admin: { 
        username: 'admin01', 
        password: '123456', 
        role: 'admin', 
        department: '教务处'
      },
      judge: { 
        username: 'judge01', 
        password: '123456', 
        role: 'judge', 
        department: '艺术学院'
      },
      chief_judge: { 
        username: 'chief01', 
        password: '123456', 
        role: 'chief_judge', 
        department: '评审委员会'
      }
    };

    const userKey = Object.keys(testUsers).find(key => 
      testUsers[key].username === username && testUsers[key].password === password
    );

    if (userKey && testUsers[userKey].role === loginType) {
      const userInfo = testUsers[userKey];
      wx.setStorageSync('userInfo', userInfo);
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        this.redirectToHomePage(userInfo.role);
      }, 1000);
    } else {
      wx.hideLoading();
      wx.showToast({
        title: '用户名或密码错误',
        icon: 'none'
      });
    }
  },

  // 根据角色跳转到对应主页
  redirectToHomePage(role) {
    let targetPage = '';
    switch(role) {
      case 'student':
        targetPage = '/competition/pages/studenthome/studenthome';
        break;
      case 'admin':
        targetPage = '/competition/pages/adminhome/adminhome';
        break;
      case 'judge':
      case 'chief_judge':
        targetPage = '/competition/pages/judgehome/judgehome';
        break;
      default:
        targetPage = '/competition/pages/login/login';
    }
    
    wx.redirectTo({
      url: targetPage
    });
  },

  onRegister() {
    wx.navigateTo({
      url: '/competition/pages/register/register'
    });
  }
})