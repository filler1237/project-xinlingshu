Page({
  data: {
    currentFilter: 'all',
    workList: [],
    totalCount: 0,
    pendingCount: 0
  },

  onLoad: function(options) {
    if (options && options.filter) {
      this.setData({
        currentFilter: options.filter
      });
    }
    this.loadWorkList();
  },

  onShow: function() {
    this.loadWorkList();
  },

  // 加载活动列表
  loadWorkList: function() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    });

    // 模拟API调用
    setTimeout(function() {
      wx.hideLoading();
      var mockData = that.getMockWorkData();
      that.processWorkList(mockData);
    }, 1000);
  },

  // 处理活动列表数据
  processWorkList: function(data) {
    var pendingCount = 0;
    var workList = data;
    
    // 根据当前筛选条件过滤
    if (this.data.currentFilter === 'pending') {
      workList = data.filter(function(item) {
        return item.status === 'pending';
      });
    } else if (this.data.currentFilter === 'reviewed') {
      workList = data.filter(function(item) {
        return item.status === 'reviewed';
      });
    }
    
    // 统计待评审数量
    for (var i = 0; i < data.length; i++) {
      if (data[i].status === 'pending') {
        pendingCount++;
      }
    }
    
    this.setData({
      workList: workList,
      totalCount: data.length,
      pendingCount: pendingCount
    });
  },

  // 获取模拟数据
  getMockWorkData: function() {
    return [
      {
        id: '1',
        title: '心理健康与压力管理讲座',
        organizer: '心理健康教育中心',
        type: '专题讲座',
        status: 'pending',
        createTime: '2024-01-15',
        description: '帮助学生了解压力来源，学习压力管理技巧，提升心理韧性。'
      },
      {
        id: '2',
        title: '情绪管理团体辅导',
        organizer: '心理协会',
        type: '团体活动',
        status: 'reviewed',
        createTime: '2024-01-10',
        score: 85.5,
        description: '通过团体互动学习情绪识别和调节方法，提升情绪管理能力。'
      },
      {
        id: '3',
        title: '人际交往技巧培训',
        organizer: '学生工作处',
        type: '工作坊',
        status: 'pending',
        createTime: '2024-01-08',
        description: '提升学生人际沟通和交往能力，改善人际关系。'
      },
      {
        id: '4',
        title: '心理危机干预演练',
        organizer: '心理健康教育中心',
        type: '实践活动',
        status: 'reviewed',
        createTime: '2024-01-05',
        score: 92.0,
        description: '心理危机识别和干预的实践演练，提升应对能力。'
      },
      {
        id: '5',
        title: '正念冥想体验活动',
        organizer: '心理协会',
        type: '体验活动',
        status: 'pending',
        createTime: '2024-01-03',
        description: '通过正念冥想练习，帮助学生缓解焦虑，提升专注力。'
      }
    ];
  },

  // 切换筛选条件
  switchFilter: function(e) {
    var filter = e.currentTarget.dataset.filter;
    this.setData({
      currentFilter: filter
    });
    this.loadWorkList();
  },

  // 查看活动详情
  viewWorkDetail: function(e) {
    var workId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/judge/judgePanel/judgePanel?activityId=' + workId
    });
  },

  // 开始评审
  startReview: function(e) {
    var workId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/judge/judgePanel/judgePanel?activityId=' + workId
    });
  },

  // 返回
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  }
});