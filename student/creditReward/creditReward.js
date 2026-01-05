Page({
  data: {
    // 总学分
    totalCredits: 0,
    
    // 学分列表
    creditList: [],
    
    // 加载状态
    loading: true,
    error: false
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

  // 加载学分数据
  loadCreditData: function () {
    this.setData({ 
      loading: true,
      error: false 
    });
    
    // 模拟API调用 - 实际项目中替换为真实的API调用
    setTimeout(() => {
      const mockData = this.getMockData();
      
      this.setData({
        totalCredits: mockData.totalCredits,
        creditList: mockData.creditList,
        loading: false,
        error: false
      });
      
      wx.stopPullDownRefresh();
    }, 1000);
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

  // 模拟数据 - 实际项目中删除此方法，使用真实API
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
        },
        {
          id: 6,
          activityName: "心理剧表演活动",
          creditValue: 5.0,
          obtainTime: "2024-01-08 19:30"
        },
        {
          id: 7,
          activityName: "心理咨询技能培训",
          creditValue: 4.5,
          obtainTime: "2024-01-05 13:45"
        },
        {
          id: 8,
          activityName: "心理健康主题征文",
          creditValue: 3.0,
          obtainTime: "2024-01-03 11:00"
        },
        {
          id: 9,
          activityName: "心理测量与评估",
          creditValue: 2.5,
          obtainTime: "2023-12-28 15:20"
        },
        {
          id: 10,
          activityName: "团体心理辅导",
          creditValue: 4.0,
          obtainTime: "2023-12-25 10:30"
        },
        {
          id: 11,
          activityName: "心理危机干预培训",
          creditValue: 3.5,
          obtainTime: "2023-12-20 14:15"
        },
        {
          id: 12,
          activityName: "心理健康宣传周",
          creditValue: 2.0,
          obtainTime: "2023-12-15 09:45"
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