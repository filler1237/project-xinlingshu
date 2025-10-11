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
        if (res.result.code === 0) {
          wx.showToast({ title: '投入成功！', icon: 'success' });
          this.setData({ ventText: '' });
        } else {
          wx.showToast({ title: res.result.message || '提交失败', icon: 'none' });
        }
      },
      fail: err => {
        wx.showToast({ title: '提交失败，请重试', icon: 'none' });
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
        if (res.result.code === 0) {
          wx.showToast({ title: '回应成功！', icon: 'success' });
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

  onShow() {
    // 每次进入页面时，根据当前Tab刷新数据
    if (this.data.activeTab === 'listen') {
      this.getRandomVent();
    } else if (this.data.activeTab === 'myEchoes') {
      this.getMyVents();
    }
  }
})
