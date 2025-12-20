// pages/echoWall/echoWall.js
Page({

  data: {
    activeTab: 'vent',
    ventText: '',
    echoText: '',
    randomVent: null,
    myVents: [],
    isSubmitting: false, // 防止重复提交
  },

  onLoad(options) {
    // 初始加载时不需要执行任何操作
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab !== this.data.activeTab) {
      this.setData({ activeTab: tab });
      if (tab === 'listen') {
        this.getRandomVent();
      } else if (tab === 'myEchoes') {
        this.getMyVents();
      }
    }
  },

  submitVent() {
    if (!this.data.ventText.trim()) {
      wx.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }
    if (this.data.isSubmitting) return;
    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '投入中...' });

    wx.cloud.callFunction({
      name: 'submitVent',
      data: { content: this.data.ventText },
      success: res => {
        if (res.result.success) {
          this.setData({ ventText: '' });
          wx.showToast({
            title: '投入成功！',
            icon: 'success',
            complete: () => {
              // 使用 setTimeout 稍微延迟跳转，给用户反应时间，体验更好
              setTimeout(() => {
                this.setData({ activeTab: 'myEchoes' }, () => {
                  this.getMyVents();
                });
              }, 200); // 延迟200毫秒
            }
          });

          wx.cloud.callFunction({
            name: 'taskSignIn',
            data: { taskId: 'ventInEchoWall' }
          }).then(taskRes => {
            if (taskRes.result.code === 0 && taskRes.result.reward > 0) {
              const waterDrop = this.selectComponent('#waterDrop');
              if (waterDrop) {
                waterDrop.play(taskRes.result.reward);
              }
            }
          });
        } else {
          wx.showToast({ title: res.result.message || '提交失败', icon: 'none' });
        }
      },
      fail: err => {
        wx.showModal({
          title: '网络错误',
          content: '提交失败，请检查您的网络连接并重试',
          showCancel: false,
        });
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ isSubmitting: false });
      }
    });
  },

  getRandomVent() {
    wx.showLoading({ title: '寻找中...' });
    wx.cloud.callFunction({
      name: 'getRandomVent',
      success: res => {
        if (res.result.code === 0) {
          this.setData({ randomVent: res.result.data, echoText: '' });
        } else {
          this.setData({ randomVent: null });
          wx.showToast({ title: res.result.message || '暂时没有啦', icon: 'none' });
        }
      },
      fail: err => {
        wx.showToast({ title: '获取失败，请重试', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  submitEcho() {
    if (!this.data.echoText.trim()) {
      wx.showToast({ title: '回应不能为空', icon: 'none' });
      return;
    }
    if (this.data.isSubmitting) return;
    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '传送中...' });

    wx.cloud.callFunction({
      name: 'submitEcho',
      data: {
        ventId: this.data.randomVent._id,
        echo: this.data.echoText
      },
      success: res => {
        if (res.result.success) {
          wx.showToast({ title: '回应成功！', icon: 'success' });

          wx.cloud.callFunction({
            name: 'taskSignIn',
            data: { taskId: 'listenInEchoWall' }
          }).then(taskRes => {
            if (taskRes.result.code === 0 && taskRes.result.reward > 0) {
              const waterDrop = this.selectComponent('#waterDrop');
              if (waterDrop) {
                waterDrop.play(taskRes.result.reward);
              }
            }
          });
          this.getRandomVent(); // 自动获取下一个
        } else {
          wx.showToast({ title: res.result.message || '回应失败', icon: 'none' });
        }
      },
      fail: err => {
        wx.showToast({ title: '回应失败，请重试', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ isSubmitting: false });
      }
    });
  },

  getMyVents() {
    wx.showLoading({ title: '加载中...' });
    wx.cloud.callFunction({
      name: 'getMyVents',
      success: res => {
        if (res.result.code === 0) {
          this.setData({ myVents: res.result.data });
        } else {
          wx.showToast({ title: '加载失败', icon: 'none' });
        }
      },
      fail: err => {
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 举报烦恼
  reportVent() {
    if (!this.data.randomVent) return;

    const reasons = ['色情低俗', '政治敏感', '攻击谩骂', '广告垃圾', '其他'];
    wx.showActionSheet({
      itemList: reasons,
      success: (res) => {
        const selectedReason = reasons[res.tapIndex];
        wx.showLoading({ title: '提交中...', mask: true });

        wx.cloud.callFunction({
          name: 'reportContent',
          data: {
            targetId: this.data.randomVent._id,
            targetType: 'vent',
            targetCollection: 'vents',
            targetContent: this.data.randomVent.content.substring(0, 200),
            targetUserId: this.data.randomVent._openid || '',
            reason: selectedReason
          },
          success: (callRes) => {
            wx.hideLoading();
            if (callRes.result && callRes.result.code === 0) {
              wx.showModal({
                title: '举报成功',
                content: '感谢您的反馈，我们会尽快处理',
                showCancel: false,
                confirmText: '我知道了',
                success: () => {
                  this.getRandomVent(); // 换一个
                }
              });
            } else if (callRes.result && callRes.result.code === -2) {
              wx.showModal({
                title: '提示',
                content: callRes.result.msg || '您已举报过该内容',
                showCancel: false
              });
            } else {
              wx.showToast({ title: callRes.result?.msg || '举报失败', icon: 'none' });
            }
          },
          fail: (err) => {
            wx.hideLoading();
            console.error('举报云函数调用失败:', err);
            wx.showToast({ title: '网络错误，请重试', icon: 'none' });
          }
        });
      }
    });
  },

  onShow() {
    // 每次进入页面时，根据当前Tab刷新数据
    if (this.data.activeTab === 'listen') {
      this.getRandomVent();
    } else if (this.data.activeTab === 'myEchoes') {
      this.getMyVents();
    }
  }
})
