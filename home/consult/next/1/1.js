const app = getApp(); // 获取小程序实例对象

Page({
  data: {
    formData: {}, // 用于存储从上一步获取的表单数据
    detail: '', // 用于存储本页textarea的输入
    length: 0, // 当前输入的字数
    teacherList: ['王贞贞', '姚双雁', '李亚玲'], // 与第一页保持一致的咨询师列表
  },

  onLoad(options) {
    // 页面加载时，从本地缓存读取第一步的表单数据
    const step1Data = wx.getStorageSync('appointment_step1_data');
    if (step1Data) {
      this.setData({
        formData: step1Data
      });
    } else {
      // 如果没有数据，提示用户并返回上一页
      wx.showToast({
        title: '数据加载失败，请重试',
        icon: 'none',
        duration: 2000,
        complete: () => {
          wx.navigateBack();
        }
      });
    }
  },

  // 监听textarea输入
  textareaInput: function (e) {
    const { value } = e.detail;
    this.setData({
      detail: value,
      length: value.length,
    });
  },

  // 提交预约
  submitAppointment() {
    // 检查是否已登录，改为检查 openid 是否存在，更可靠
    if (!app.globalData.userInfo || !app.globalData.userInfo._openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      });
      // 跳转到登录页面
      wx.switchTab({
        url: '/pages/mine/mine'
      });
      return;
    }

    // 检查是否输入了内容
    if (this.data.length === 0) {
      wx.showToast({
        title: '请简述您的问题',
        icon: 'none',
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '正在提交...',
    });

    // 准备提交到云函数的完整数据
    const finalData = {
      ...this.data.formData,
      detail: this.data.detail,
      openid: app.globalData.userInfo._openid, // 确保使用 _openid
      teacher: this.data.teacherList[this.data.formData.teacherId]
    };

    // 调用云函数
    wx.cloud.callFunction({
      name: 'createAppointment',
      data: finalData,
      success: res => {
        wx.hideLoading();
        // 提交成功后，清除缓存并跳转到成功页面
        wx.removeStorageSync('appointment_step1_data');
        wx.showToast({
          title: '预约成功',
          icon: 'success',
        });
        wx.navigateTo({
          url: './2/2',
        });
      },
      fail: err => {
        wx.hideLoading();
        console.error('[云函数] [createAppointment] 调用失败', err);
        wx.showToast({
          title: '预约失败，请重试',
          icon: 'none',
        });
      },
    });
  },

  onBackTap: function(e) {
    wx.navigateBack({
      delta: 1,
    });
  },
});
