Page({
  data: {
    activities: []
  },

  onLoad() {
    console.log('活动列表页面加载');
    this.loadActivities();
  },

  onShow() {
    console.log('活动列表页面显示');
  },

  loadActivities() {
    // 模拟加载数据
    console.log('加载活动数据');
    
    // 模拟网络请求延迟
    setTimeout(() => {
      const mockActivities = [
        {
          id: '1',
          title: '心理绘画创作大赛',
          description: '围绕心理健康主题进行绘画创作，展现内心世界',
          status: '报名中',
          startTime: '2024-03-01',
          endTime: '2024-03-31',
          organizer: '心理健康中心'
        },
        {
          id: '2',
          title: '心理主题征文比赛',
          description: '分享心理健康相关故事和感悟，字数不限',
          status: '评审中',
          startTime: '2024-02-15',
          endTime: '2024-03-15',
          organizer: '学生工作处'
        }
      ];
      
      this.setData({
        activities: mockActivities
      });
      
      console.log('活动数据加载完成', mockActivities);
    }, 500);
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
})