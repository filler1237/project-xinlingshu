const app = getApp(); // 获取小程序实例对象

Page({
  data: {
    formData: {}, // 用于存储从上一步获取的表单数据
    detail: '', // 用于存储本页textarea的输入
    length: 0, // 当前输入的字数
    teacherList: ['王贞贞', '姚双雁', '李亚玲'], // 与第一页保持一致的咨询师列表
    isButtonActive: false, // 控制按钮状态
    showQrCode: false, // 控制显示二维码
    appointmentId: null,
    qrCodeDataURL: '', // 用于存储二维码图片数据
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
      isButtonActive: value.length > 0
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
        // 提交成功后，清除缓存
        wx.removeStorageSync('appointment_step1_data');
        
        const appointmentId = res.result._id; // 假设云函数返回结果中包含预约ID
        this.setData({
          showQrCode: true,
          appointmentId: appointmentId
        });
        this.generateQrCode(appointmentId);
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

  generateQrCode: function(text) {
    wx.showLoading({
      title: '二维码生成中...',
    });
    wx.cloud.callFunction({
      name: 'generateQrCode',
      data: {
        text: text
      },
      success: res => {
        wx.hideLoading();
        if (res.result.success) {
          this.setData({
            qrCodeDataURL: res.result.qrCodeDataURL
          });
        } else {
          wx.showToast({
            title: '二维码生成失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '二维码生成失败',
          icon: 'none'
        });
      }
    });
  },

  saveQrCode: function() {
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/qrcode.png`;
    const base64Data = this.data.qrCodeDataURL.replace(/^data:image\/\w+;base64,/, '');

    fs.writeFile({
      filePath: filePath,
      data: base64Data,
      encoding: 'base64',
      success: () => {
        wx.saveImageToPhotosAlbum({
          filePath: filePath,
          success: () => {
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            });
          },
          fail: () => {
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            });
          }
        });
      },
      fail: () => {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },

  confirm: function() {
    wx.switchTab({
      url: '/pages/home/home',
    });
  }
});
