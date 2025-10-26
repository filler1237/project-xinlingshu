// pages/admin/applyActivity/applyActivity.js
Page({
  data: {
    activityName: '',
    startDate: '',
    endDate: '',
    activityTheme: '',
    formType: '',
    activityDescription: '',
    canSubmit: false
  },

  // 返回 ，放js文件
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },
  
  // 监听输入变化
  onActivityNameInput(e) {
    this.setData({ activityName: e.detail.value });
    this.checkFormValidity();
  },

  onThemeInput(e) {
    this.setData({ activityTheme: e.detail.value });
    this.checkFormValidity();
  },

  onDescriptionInput(e) {
    this.setData({ activityDescription: e.detail.value });
    this.checkFormValidity();
  },

  // 时间选择
  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value });
    this.checkFormValidity();
  },

  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value });
    this.checkFormValidity();
  },

  // 选择活动形式
  onFormTypeSelect(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ formType: type });
    this.checkFormValidity();
  },

  // 检查表单是否可提交
  checkFormValidity() {
    const { activityName, startDate, endDate, activityTheme, formType, activityDescription } = this.data;
    const isValid = activityName && startDate && endDate && activityTheme && formType && activityDescription;
    
    this.setData({ canSubmit: !!isValid });
  },

  // 提交申请
  onSubmit() {
    if (!this.data.canSubmit) return;

    const formData = {
      activityName: this.data.activityName,
      startDate: this.data.startDate,
      endDate: this.data.endDate,
      activityTheme: this.data.activityTheme,
      formType: this.data.formType,
      activityDescription: this.data.activityDescription
    };

    // 显示加载状态
    wx.showLoading({
      title: '提交中...',
    });

    // 调用后端接口
    wx.request({
      url: 'https://your-api-domain.com/api/activity/apply',
      method: 'POST',
      data: formData,
      success: (res) => {
        wx.hideLoading();
        if (res.data.success) {
          wx.showToast({
            title: '申请提交成功',
            icon: 'success',
            duration: 2000
          });
          
          // 延迟返回adminhome页面
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/adminhome/adminhome'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.message || '提交失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 返回功能 - 返回到adminhome页面
  onBack() {
    wx.redirectTo({
      url: '/pages/adminhome/adminhome'
    });
  },

  onLoad() {
    // 页面加载时的初始化
  }
});