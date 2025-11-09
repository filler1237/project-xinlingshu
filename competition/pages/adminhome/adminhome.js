Page({
  data: {
    userInfo: null,
    stats: {
      activityCount: 0,
      workCount: 0,
      pendingCount: 0
    }
  },

// 返回 ，放js文件
  goBack: function() {
    // wx.navigateBack({
    //   delta: 1
    // });
    wx.switchTab({ url: '/pages/home/home' });
  },

  onLoad() {
    this.getUserInfo();
    this.loadStats();
  },

  onShow() {
    this.getUserInfo();
  },

  onPullDownRefresh() {
    this.loadStats();
    wx.stopPullDownRefresh();
  },

  getUserInfo() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({ userInfo });
    } else {
      // 如果全局没有用户信息，可以给一个提示或者返回上一页
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000,
        complete: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }
  },

  loadStats() {
    this.setData({
      stats: {
        activityCount: 12,
        workCount: 156,
        pendingCount: 8
      }
    });
  },

  // 管理员功能跳转
  toApplyActivity() {
    wx.navigateTo({
      url: '/competition/pages/admin/applyActivity/applyActivity'
    });
  },

  toManageActivity() {
    wx.navigateTo({
      url: '/competition/pages/admin/manageActivity/manageActivity'
    });
  },

  toWorkOverview() {
    wx.navigateTo({
      url: '/competition/pages/admin/workOverview/workOverview'
    });
  },

  toJudgeManage() {
    wx.navigateTo({
      url: '/competition/pages/admin/judgeManage/judgeManage'
    });
  },

  toCreditConfig() {
    wx.navigateTo({
      url: '/competition/pages/admin/creditConfig/creditConfig'
    });
  },

  // 扫码核销
  scanCode() {
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果', res);
        const appointmentId = res.result;
        if (appointmentId) {
          // 调用云函数进行核销
          wx.cloud.callFunction({
            name: 'getScan',
            data: {
              appointmentId: appointmentId
            },
            success: (cloudRes) => {
              if (cloudRes.result.success) {
                wx.showToast({
                  title: '核销成功',
                  icon: 'success'
                });
              } else {
                wx.showToast({
                  title: cloudRes.result.message || '核销失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('云函数调用失败', err);
              wx.showToast({
                title: '核销失败，请重试',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '无效的二维码',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.log('扫码失败', err);
        wx.showToast({
          title: '扫码取消或失败',
          icon: 'none'
        });
      }
    });
  },

})
