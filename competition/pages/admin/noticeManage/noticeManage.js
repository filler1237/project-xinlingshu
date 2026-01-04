Page({
  data: {
    // 表单数据
    noticeTitle: '',
    noticeContent: '',
    targetType: 'all', // all: 全体学生, participants: 活动参与者
    
    // 用户信息
    userInfo: null,
    currentTime: '',
    
    // 状态
    publishing: false,
    errors: {
      title: '',
      content: ''
    },
    
    // 历史记录（本地存储）
    recentNotices: []
  },

  onLoad() {
    this.getUserInfo();
    this.updateCurrentTime();
    this.loadHistory();
    
    // 设置页面标题
    wx.setNavigationBarTitle({ title: '发布通知' });
  },

  onShow() {
    // 每次显示页面时更新时间
    this.updateCurrentTime();
    this.getUserInfo();
  },

  // 获取用户信息
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || { username: '管理员' };
    this.setData({ userInfo });
  },

  // 更新时间显示
  updateCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    
    this.setData({
      currentTime: `${year}-${month}-${date} ${hour}:${minute}`
    });
  },

  // 标题输入
  onTitleInput(e) {
    const title = e.detail.value;
    this.setData({
      noticeTitle: title,
      'errors.title': title ? '' : '请输入通知标题'
    });
  },

  // 内容输入
  onContentInput(e) {
    const content = e.detail.value;
    this.setData({
      noticeContent: content,
      'errors.content': content ? '' : '请输入通知内容'
    });
  },

  // 选择发布对象
  onTargetChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ targetType: type });
  },

  // 表单验证
  validateForm() {
    const { noticeTitle, noticeContent } = this.data;
    const errors = {};
    
    if (!noticeTitle || noticeTitle.trim() === '') {
      errors.title = '请输入通知标题';
    } else if (noticeTitle.length < 2) {
      errors.title = '标题至少2个字符';
    }
    
    if (!noticeContent || noticeContent.trim() === '') {
      errors.content = '请输入通知内容';
    } else if (noticeContent.length < 10) {
      errors.content = '内容至少10个字符';
    }
    
    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  // 发布通知
  async onPublish() {
    if (this.data.publishing || !this.validateForm()) {
      if (!this.validateForm()) {
        wx.showToast({
          title: '请完善表单信息',
          icon: 'none',
          duration: 2000
        });
      }
      return;
    }
    
    this.setData({ publishing: true });
    
    // 显示加载提示
    wx.showLoading({
      title: '发布中...',
      mask: true
    });
    
    // 准备数据
    const noticeData = {
      id: Date.now(),
      title: this.data.noticeTitle.trim(),
      content: this.data.noticeContent.trim(),
      target: this.data.targetType,
      publisher: this.data.userInfo.username || '管理员',
      time: this.data.currentTime,
      publishTime: new Date().toISOString(),
      status: '已发布'
    };
    
    console.log('📤 发布通知数据:', noticeData);
    
    // 调用云函数发布通知
    wx.cloud.callFunction({
      name: 'createNotice',
      data: {
        title: this.data.noticeTitle.trim(),
        content: this.data.noticeContent.trim(),
        targetType: this.data.targetType,
        publisherName: this.data.userInfo.username || '管理员',
        priority: 'normal',
        category: 'general'
      },
      success: (res) => {
        wx.hideLoading();
        this.setData({ publishing: false });
        
        if (res.result.success) {
          console.log('✅ 通知发布成功:', res.result);
          
          // 保存到历史记录
          this.saveToHistory({
            id: res.result.data.noticeId || Date.now(),
            title: this.data.noticeTitle.trim(),
            time: this.data.currentTime,
            target: this.data.targetType
          });
          
          // 显示成功提示
          wx.showModal({
            title: '发布成功',
            content: `通知已成功发送给${this.data.targetType === 'all' ? '全体学生' : '活动参与者'}`,
            showCancel: false,
            confirmText: '确定',
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 重置表单
                this.onReset();
              }
            }
          });
        } else {
          console.error('❌ 通知发布失败:', res.result);
          wx.showToast({
            title: res.result.message || '发布失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ publishing: false });
        console.error('❌ 云函数调用失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 保存到历史记录
  saveToHistory(noticeData) {
    try {
      const history = wx.getStorageSync('noticeHistory') || [];
      
      // 添加到历史记录（最多保留10条）
      history.unshift({
        id: noticeData.id,
        title: noticeData.title,
        time: noticeData.time,
        target: noticeData.target
      });
      
      if (history.length > 10) {
        history.splice(10); // 只保留最近10条
      }
      
      wx.setStorageSync('noticeHistory', history);
      this.setData({ recentNotices: history });
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  },

  // 加载历史记录
  loadHistory() {
    try {
      const history = wx.getStorageSync('noticeHistory') || [];
      this.setData({ recentNotices: history });
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  },

  // 重置表单
  onReset() {
    wx.showModal({
      title: '重置确认',
      content: '确定要清空当前表单内容吗？',
      confirmColor: '#ff6b6b',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            noticeTitle: '',
            noticeContent: '',
            targetType: 'all',
            errors: {
              title: '',
              content: ''
            }
          });
          
          wx.showToast({
            title: '已重置',
            icon: 'success'
          });
        }
      }
    });
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
});