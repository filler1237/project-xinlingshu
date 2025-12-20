// mine/record/detail/detail.js
Page({
  data: {
    recordDetail: null,
    isLoading: true,
  },

  onLoad: function (options) {
    if (options && options.id) {
      this.getRecordDetail(options.id);
    } else {
      this.setData({ isLoading: false });
      wx.showToast({
        title: '无效的记录ID',
        icon: 'none'
      });
    }
  },

  getRecordDetail: function (recordId) {
    this.setData({ isLoading: true });
    wx.showLoading({
      title: '加载中...',
    });

    wx.cloud.callFunction({
      name: 'getDivinationHistory',
      data: {
        recordId: recordId
      },
      success: res => {
        if (res.result && res.result.success) {
          let recordDetail = res.result.data;

          recordDetail.formattedDate = new Date(recordDetail.createdAt).toLocaleString();

          if (recordDetail.type === 'hexagram' && !recordDetail.question) {
            recordDetail.question = '无';
          }

          if (recordDetail.type === 'hexagram' && recordDetail.result) {
            recordDetail.analysis = recordDetail.result;
          }

          // 解析 Markdown 格式
          if (recordDetail.analysis) {
            recordDetail.analysisHtml = this.parseMarkdown(recordDetail.analysis);
          }

          this.setData({
            recordDetail: recordDetail,
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('Failed to fetch record detail', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
        wx.hideLoading();
      }
    });
  },

  /**
   * 简易 Markdown 解析器
   */
  parseMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  }
});
