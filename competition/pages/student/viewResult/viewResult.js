Page({
  data: {
    // 总学分
    totalCredits: 0,
    
    // 学分列表
    creditList: [],
    
    // 加载状态
    loading: true,
    error: false,
    
    // API配置
    apiBaseUrl: 'https://your-api-domain.com/api', // 替换为真实API地址
    isTestData: false
  },

  onLoad: function (options) {
    console.log('学分查看页面加载');
    this.loadCreditData();
  },

  onShow: function () {
    // 页面显示时刷新数据
    if (this.data.creditList.length > 0) {
      this.refreshData();
    }
  },

  onPullDownRefresh: function () {
    // 下拉刷新
    this.refreshData();
  },

  // 加载学分数据 - 准备接入真实API
  loadCreditData: function () {
    this.setData({ 
      loading: true,
      error: false 
    });
    
    // 真实API调用示例 - 取消注释并配置正确的API地址
    /*
    wx.request({
      url: `${this.data.apiBaseUrl}/credits`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getApp().globalData.token}`, // 从全局获取token
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          const creditData = res.data.data;
          this.handleCreditData(creditData);
        } else {
          this.handleLoadError('数据加载失败');
        }
      },
      fail: (err) => {
        console.error('API请求失败:', err);
        this.handleLoadError('网络请求失败');
      },
      complete: () => {
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
      }
    });
    */
    
    // 临时使用模拟数据 - 上线前删除这部分
    setTimeout(() => {
      // 这里可以设置为空数据来测试空状态
      // const mockData = { totalCredits: 0, creditList: [] }; // 空数据测试
      const mockData = this.getMockData(); // 测试数据
      
      this.setData({
        totalCredits: mockData.totalCredits,
        creditList: mockData.creditList,
        loading: false,
        error: false,
        isTestData: true // 标记为测试数据
      });
      
      wx.stopPullDownRefresh();
    }, 1200);
  },

  // 处理学分数据
  handleCreditData: function (creditData) {
    this.setData({
      totalCredits: creditData.totalCredits,
      creditList: creditData.creditList,
      error: false,
      isTestData: false
    });
  },

  // 处理加载错误
  handleLoadError: function (errorMsg) {
    this.setData({
      error: true,
      totalCredits: 0,
      creditList: []
    });
    
    wx.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 2000
    });
  },

  // 刷新数据
  refreshData: function () {
    this.loadCreditData();
  },

  // 返回上一页
  onBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },

  // 生成测试数据
  createTestData: function () {
    const mockData = this.getMockData();
    this.setData({
      totalCredits: mockData.totalCredits,
      creditList: mockData.creditList,
      isTestData: true
    });
  },

  // 模拟数据 - 上线前删除
  getMockData: function () {
    return {
      totalCredits: 45.5,
      creditList: [
        {
          id: 1,
          activityName: "心理健康主题讲座",
          creditValue: 2.0,
          obtainTime: "2024-01-20 14:30"
        },
        {
          id: 2,
          activityName: "团队协作能力训练",
          creditValue: 3.5,
          obtainTime: "2024-01-18 10:15"
        },
        {
          id: 3,
          activityName: "心理素质拓展活动",
          creditValue: 4.0,
          obtainTime: "2024-01-15 09:00"
        },
        {
          id: 4,
          activityName: "情绪管理 workshop",
          creditValue: 2.5,
          obtainTime: "2024-01-12 16:20"
        },
        {
          id: 5,
          activityName: "心理健康知识竞赛",
          creditValue: 3.0,
          obtainTime: "2024-01-10 14:00"
        }
      ]
    };
  },

  onShareAppMessage: function () {
    return {
      title: '我的学分记录',
      path: '/pages/student/creditReward/creditReward'
    };
  }
});