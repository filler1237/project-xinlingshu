Page({
  data: {
    activeTab: 'personal', // 'personal' or 'global'
    loading: true,
    error: null,
    keywordList: [], // 用于存储关键词字符串数组
    days: 30, // 默认时间范围
    debugInfo: '' // 用于存储调试信息
  },

  onLoad(options) {
    this.fetchWordCloudData();
  },

  async fetchWordCloudData() {
    this.setData({ loading: true, error: null });
    try {
      const result = await wx.cloud.callFunction({
        name: 'getWordCloudData',
        data: {
          scope: this.data.activeTab,
          days: this.data.days
        }
      });

      if (result.result.ok) {
        console.log('【词云调试信息】:', result.result.debug);
        // 从返回的对象数组中提取 name 字段，生成字符串数组
        const keywordList = result.result.data.map(item => item.name);
        this.setData({
          keywordList: keywordList,
          loading: false,
          debugInfo: JSON.stringify(result.result.debug) // 更新调试信息
        });
      } else {
        throw new Error(result.result.error || '加载失败');
      }
    } catch (e) {
      this.setData({
        loading: false,
        error: e.message
      });
    }
  },

  onTabChange(event) {
    this.setData({
      activeTab: event.detail.name
    });
    this.fetchWordCloudData();
  },

  onDaysChange(event) {
    this.setData({
      days: parseInt(event.detail)
    });
    this.fetchWordCloudData();
  }
});
