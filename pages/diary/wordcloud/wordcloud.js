Page({
  data: {
    activeTab: 'personal', // 'personal' or 'global'
    loading: true,
    error: null,
    keywordList: [], // 用于存储关键词字符串数组
    days: 30, // 默认时间范围
    debugInfo: '',
    subtitle: '', // 副标题，在onLoad中初始化
    timeRanges: [ // 新增时间范围按钮数组
      { days: 7, text: '最近7天' },
      { days: 30, text: '最近30天' },
      { days: 90, text: '最近90天' },
      { days: 365, text: '最近一年' }
    ]
  },

  onLoad(options) {
    // 显式设置初始副标题
    this.setData({
      subtitle: '💡看看这段时间伴随着您的情绪印记吧！'
    });
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
        // 从返回的对象数组中提取 name 字段，生成字符串数组
        const keywordList = result.result.data.map(item => item.name);
        this.setData({
          keywordList: keywordList,
          loading: false
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
    // 使用 event.detail.index 进行判断，更加可靠
    const activeIndex = event.detail.index;
    const activeTab = activeIndex === 0 ? 'personal' : 'global';
    
    const newSubtitle = activeIndex === 0
      ? '💡看看这段时间伴随着您的情绪印记吧！' 
      : '💡原来这段时间，大家是这样想的';

    this.setData({
      activeTab: activeTab,
      subtitle: newSubtitle,
      debugInfo: '' // 清理调试信息
    });
    this.fetchWordCloudData();
  },

  onRangeChange(event) {
    const { days } = event.currentTarget.dataset;
    if (this.data.days !== days) {
      this.setData({
        days: days
      });
      this.fetchWordCloudData();
    }
  }
});
