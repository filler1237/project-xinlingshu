Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    department: '',
    registerType: 'student'
  },

  onRegisterTypeChange(e) {
    this.setData({ registerType: e.detail.value });
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  onStudentIdInput(e) {
    this.setData({ studentId: e.detail.value });
  },

  onDepartmentInput(e) {
    this.setData({ department: e.detail.value });
  },

  onRegister() {
    const { username, password, confirmPassword, registerType, studentId, department } = this.data;
    
    // 验证逻辑
    if (!username || !password) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' });
      return;
    }
    
    if (password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' });
      return;
    }
    
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }
    
    if (registerType === 'student' && !studentId) {
      wx.showToast({ title: '请输入学号', icon: 'none' });
      return;
    }

    if (!department) {
      wx.showToast({ title: '请输入院系或部门', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '注册中...' });

    // 模拟注册成功
    setTimeout(() => {
      wx.hideLoading();
      
      const userInfo = {
        username: username,
        role: registerType,
        department: department,
        studentId: registerType === 'student' ? studentId : undefined
      };
      
      wx.setStorageSync('userInfo', userInfo);
      
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        this.redirectToHomePage(registerType);
      }, 1000);
    }, 1500);
  },

  // 根据角色跳转到对应主页
  redirectToHomePage(role) {
    let targetPage = '';
    switch(role) {
      case 'student':
        targetPage = '/pages/studenthome/studenthome';
        break;
      case 'admin':
        targetPage = '/pages/adminhome/adminhome';
        break;
      case 'judge':
        targetPage = '/pages/judgehome/judgehome';
        break;
      default:
        targetPage = '/pages/login/login';
    }
    
    wx.redirectTo({
      url: targetPage
    });
  },

  onBackToLogin() {
    wx.navigateBack();
  }
})