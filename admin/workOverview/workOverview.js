// pages/admin/workOverview/workOverview.js
Page({
  data: {
    // 统计信息
    stats: {
      total: 0,
      pending: 0,      // 待评审
      reviewing: 0,    // 评审中
      reviewed: 0,     // 已评审
      awarded: 0       // 已获奖
    },
    
    // 作品列表
    works: [],
    filteredWorks: [],
    selectedWorks: [],
    
    // 筛选条件
    searchKeyword: '',
    activityFilter: 'all',
    statusFilter: 'all',
    
    // 活动选项（从后端获取）
    activities: [],
    
    // 模态框
    showDetailModal: false,
    showReviewModal: false,
    selectedWork: null,
    
    // 评审数据
    reviewData: {
      scores: {},
      comment: '',
      status: 'reviewed'
    }
  },

  onLoad(options) {
    console.log('📱 作品总览页面加载');
    this.initPage();
  },

  // 初始化页面
  async initPage() {
    try {
      await Promise.all([
        this.loadActivities(),
        this.loadWorksData()
      ]);
    } catch (error) {
      console.error('初始化失败:', error);
    }
  },

  // 加载活动列表
  async loadActivities() {
    return new Promise((resolve) => {
      wx.request({
        url: 'http://localhost:3000/api/activities/running',
        method: 'GET',
        success: (res) => {
          if (res.data.success) {
            const activities = [
              { id: 'all', name: '全部活动' },
              ...res.data.data.map(activity => ({
                id: activity.id,
                name: activity.title
              }))
            ];
            this.setData({ activities });
          }
          resolve();
        },
        fail: () => {
          // 使用模拟数据
          const mockActivities = [
            { id: 'all', name: '全部活动' },
            { id: '1', name: '心理健康征文大赛' },
            { id: '2', name: '心理绘画创作展' },
            { id: '3', name: '心理短视频竞赛' }
          ];
          this.setData({ activities: mockActivities });
          resolve();
        }
      });
    });
  },

  // 加载作品数据
  async loadWorksData() {
    wx.showLoading({ title: '加载中...' });

    return new Promise((resolve) => {
      wx.request({
        url: 'http://localhost:3000/api/works',
        method: 'GET',
        data: {
          activityId: this.data.activityFilter === 'all' ? null : this.data.activityFilter,
          status: this.data.statusFilter === 'all' ? null : this.data.statusFilter
        },
        success: (res) => {
          wx.hideLoading();
          if (res.data.success) {
            this.processWorksData(res.data.data);
          } else {
            this.loadMockData();
          }
          resolve();
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('加载作品失败:', err);
          this.loadMockData();
          resolve();
        }
      });
    });
  },

  // 处理作品数据
  processWorksData(works) {
    const processedWorks = works.map(work => ({
      ...work,
      // 确保必要字段存在
      workId: work.id || work.workId,
      authorName: work.authorName || work.student?.name || '未知作者',
      studentId: work.studentId || work.student?.id || '未知学号',
      activityName: work.activityName || work.activity?.title || '未知活动',
      // 状态映射
      reviewStatus: this.mapReviewStatus(work.status),
      // 格式化时间
      submitTime: this.formatTime(work.createdAt || work.submitTime)
    }));

    this.setData({
      works: processedWorks,
      filteredWorks: processedWorks
    }, () => {
      this.updateStats();
      console.log('作品数据加载完成');
    });
  },

  // 状态映射
  mapReviewStatus(status) {
    const statusMap = {
      'submitted': 'pending',      // 已提交 → 待评审
      'reviewing': 'reviewing',    // 评审中
      'reviewed': 'reviewed',      // 已评审
      'awarded': 'awarded'         // 已获奖
    };
    return statusMap[status] || 'pending';
  },

  // 格式化时间
  formatTime(timestamp) {
    if (!timestamp) return '未知时间';
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
});