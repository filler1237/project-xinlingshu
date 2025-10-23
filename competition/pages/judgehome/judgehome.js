Page({
  data: {
    userInfo: null,
    isChiefJudge: false,
    stats: {
      assignedWorks: 0,
      reviewedWorks: 0,
      pendingWorks: 0
    }
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
    if (userInfo.role !== 'judge') {
      wx.showModal({
        title: '权限不足',
        content: '此页面仅限评委访问。',
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
    console.log('加载评委数据...');
  },

  loadStats() {
    this.setData({
      stats: {
        assignedWorks: 25,
        reviewedWorks: 18,
        pendingWorks: 7
      }
    });
  },

  // 评委功能跳转
  toJudgePanel() {
    wx.navigateTo({
      url: '/pages/judge/judgePanel/judgePanel'
    });
  },

  toWorkList() {
    wx.navigateTo({
      url: '/pages/judge/workList/workList'
    });
  },

  toScoreStandard() {
    wx.navigateTo({
      url: '/pages/judge/scoreStandard/scoreStandard'
    });
  },

  toScoreSummary() {
    wx.navigateTo({
      url: '/pages/judge/scoreSummary/scoreSummary'
    });
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
            url: '/pages/login/login'
          });
        }
      }
    });
  }
})