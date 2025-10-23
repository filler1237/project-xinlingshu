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

  /**
   * 页面加载时，立即检查登录和身份状态
   */
  onLoad() {
    // onLoad 阶段可以先不用检查，因为 onShow 会立即执行
    // this.checkLoginAndRole(); 
  },

  /**
   * 每次页面显示时，都严格检查登录和身份状态
   * 这是统一登录的核心
   */
  onShow() {
    this.checkLoginAndRole();
  },

  /**
   * [重写] 检查登录状态、身份绑定和角色权限
   */
  checkLoginAndRole() {
    const userInfo = wx.getStorageSync('userInfo');

    // 1. 检查是否登录
    if (!userInfo) {
      wx.showModal({
        title: '尚未登录',
        content: '您需要先登录才能访问比赛系统，是否前往登录页面？',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            // 跳转到主项目的“我的”页面进行统一登录
            wx.switchTab({
              url: '/pages/mine/mine'
            });
          } else {
            // 用户取消登录，可以返回上一页或停留在当前页（但功能受限）
            wx.navigateBack({ delta: 1 });
          }
        }
      });
      return; // 终止后续操作
    }

    // 2. 检查是否已绑定身份
    if (!userInfo.isIdentityBound) {
      wx.showModal({
        title: '尚未绑定身份',
        content: '您需要先绑定身份才能访问比赛系统，是否前往绑定页面？',
        confirmText: '去绑定',
        success: (res) => {
          if (res.confirm) {
            // 同样跳转到“我的”页面，登录后会自动弹出绑定提示
            wx.switchTab({
              url: '/pages/auth/usercenter/usercenter'
            });
          } else {
            wx.navigateBack({ delta: 1 });
          }
        }
      });
      return; // 终止后续操作
    }

    // 3. 检查角色是否为学生
    if (userInfo.role !== 'student') {
      wx.showModal({
        title: '权限不足',
        content: '此页面仅限学生访问。',
        showCancel: false,
        confirmText: '返回',
        success: () => {
          // 可以跳转到主页或“我的”页面
          wx.switchTab({
            url: '/pages/mine/mine'
          });
        }
      });
      return; // 终止后续操作
    }

    // 4. 所有检查通过，加载页面数据
    this.setData({ userInfo });
    this.loadData(); // 调用您原来的数据加载函数
  },

  /**
   * [重写] 退出登录逻辑
   */
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('openid'); // 建议也清除 openid
          // 退出后，跳转到主项目的“我的”页面
          wx.switchTab({
            url: '/pages/mine/mine'
          });
        }
      }
    });
  },

  loadData() {
    console.log('加载学生数据...');
  },

  onBackTap() {
    // 处理点击返回的逻辑
    wx.navigateBack();
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

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.redirectTo({
            url: '/competition/pages/login/login'
          });
        }
      }
    });
  }
})