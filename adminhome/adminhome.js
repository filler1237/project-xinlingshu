// pages/admin/home/home.js
Page({
  data: {
    userInfo: null,
    currentDate: '',
    stats: {
      activityCount: 0,
      workCount: 0
    }
  },

  onLoad() {
    this.getUserInfo();
    this.loadStats();
    this.setCurrentDate();
  },

  onShow() {
    this.loadStats();
  },

  onPullDownRefresh() {
    this.loadStats();
    wx.stopPullDownRefresh();
  },

  setCurrentDate() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[now.getDay()];
    this.setData({
      currentDate: `${month}月${date}日 周${weekDay}`
    });
  },

  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.redirectTo({
        url: '/competition/pages/login/login'
      });
      return;
    }
    this.setData({ userInfo });
  },

  loadStats() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // 调用云函数获取统计数据
    Promise.all([
      // 获取活动统计
      wx.cloud.callFunction({
        name: 'getActivities',
        data: {
          status: 'all',
          page: 1,
          pageSize: 1000
        }
      }),
      // 获取作品统计
      new Promise((resolve) => {
        const db = wx.cloud.database();
        db.collection('works')
          .where({
            status: db.command.neq('deleted')
          })
          .count()
          .then(res => resolve({ result: { total: res.total } }))
          .catch(err => resolve({ result: { total: 0 } }));
      })
    ]).then(([activitiesRes, worksRes]) => {
      wx.hideLoading();
      
      // 统计进行中的活动
      let runningActivities = 0;
      if (activitiesRes.result.success && activitiesRes.result.data) {
        runningActivities = activitiesRes.result.data.filter(a => 
          a.statusType === 'running' || a.status === 'running'
        ).length;
      }
      
      // 获取作品总数
      const totalWorks = worksRes.result.total || 0;
      
      this.setData({
        stats: {
          activityCount: runningActivities,
          workCount: totalWorks
        }
      });
    }).catch(err => {
      wx.hideLoading();
      console.error('加载统计数据失败:', err);
      // 失败时使用默认值
      this.setData({
        stats: {
          activityCount: 0,
          workCount: 0
        }
      });
    });
  },

  // ========== 四个核心功能导航 ==========
  toCreateActivity() {
    wx.navigateTo({
      url: '/competition/pages/admin/applyActivity/applyActivity'
    });
  },

  toWorkList() {
    wx.navigateTo({
      url: '/competition/pages/admin/workOverview/workOverview'
    });
  },

  toManageActivity() {
    wx.navigateTo({
      url: '/competition/pages/admin/manageActivity/manageActivity'
    });
  },

  toExportResults() {
    wx.navigateTo({
      url: '/competition/pages/admin/exportResults/exportResults'
    });
  },

  toNoticeManage() {
    wx.navigateTo({
      url: '/competition/pages/admin/noticeManage/noticeManage'
    });
  },

  // ========== 返回主页 ==========
  goBack() {
    wx.switchTab({ url: '/pages/home/home' });
  }
})