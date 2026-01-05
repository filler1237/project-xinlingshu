Page({
  data: {
    envInfo: ''
  },
  
  onLoad() {
    this.checkEnvironment();
  },
  
  checkEnvironment() {
    const envList = require('../../envList.js').envList;
    const currentEnv = envList[0]; // 默认第一个
    
    this.setData({
      envInfo: JSON.stringify(currentEnv, null, 2)
    });
    
    // 测试接口
    wx.request({
      url: `${currentEnv.baseUrl}/health`,
      success: (res) => {
        console.log('优化版服务健康检查:', res.data);
        wx.showToast({
          title: '优化版连接成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('连接失败:', err);
        wx.showToast({
          title: '连接失败',
          icon: 'error'
        });
      }
    });
  }
});