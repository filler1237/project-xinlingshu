Page({
  data: {
    userInfo: null,
    activities: [
      {
        id: '1',
        title: '心理绘画创作大赛',
        description: '围绕心理健康主题进行绘画创作',
        status: '报名中',
        startTime: '2024-03-01',
        endTime: '2024-03-31',
        organizer: '心理健康中心'
      },
      {
        id: '2',
        title: '心理主题征文比赛',
        description: '分享心理健康相关故事和感悟',
        status: '评审中',
        startTime: '2024-02-15',
        endTime: '2024-03-15',
        organizer: '学生工作处'
      }
    ],
    myWorks: [
      {
        id: '1',
        title: '心灵的色彩',
        activity: '心理绘画创作大赛',
        submitTime: '2024-03-10',
        status: '已评审',
        score: 88
      },
      {
        id: '2',
        title: '成长的故事',
        activity: '心理主题征文比赛',
        submitTime: '2024-02-20',
        status: '评审中',
        score: null
      }
    ]
    
  },
  onBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  onLoad() {
    this.getUserInfo();
    this.loadData();
  },

  onShow() {
    this.getUserInfo();
  },

  onPullDownRefresh() {
    this.loadData();
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

  loadData() {
    console.log('加载学生数据...');
  },

  // 学生功能跳转
  toActivityList() {
    console.log('✅ 活动列表按钮被点击了'); // 确认方法是否执行
    
    // 检查页面是否存在
    console.log('📁 尝试跳转到:', '/competition/pages/student/activityList/activityList');
    
    wx.navigateTo({
      url: '/competition/pages/student/activityList/activityList',
      success: () => {
        console.log('🎉 跳转成功');
      },
      fail: (err) => {
        console.error('❌ 跳转失败:', err);
        // 显示具体错误信息
        wx.showModal({
          title: '跳转失败',
          content: JSON.stringify(err),
          showCancel: false
        });
      }
    });
},

  toSubmitWork() {
    console.log('点击了提交作品按钮');
    wx.navigateTo({
      url: '/competition/pages/student/submitWork/submitWork'
    });
  },

  toViewResult() {
    console.log('点击了查看评价按钮');
    wx.navigateTo({
      url: '/competition/pages/student/viewResult/viewResult'
    });
  },

  toCreditReward() {
    console.log('点击了学分奖励按钮');
    wx.navigateTo({
      url: '/competition/pages/student/creditReward/creditReward'
    });
  },

  // 查看活动详情
  onActivityTap(e) {
    const activityId = e.currentTarget.dataset.id;
    console.log('查看活动详情:', activityId);
  },

  // 查看作品详情
  onWorkTap(e) {
    const workId = e.currentTarget.dataset.id;
    console.log('查看作品详情:', workId);
  },

})
