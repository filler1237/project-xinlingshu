// mine/record/record.js
Page({
  data: {
    tarotRecords: [],
    zhouyiRecords: [],
    isLoading: true,
    isTarotExpanded: false,
    isZhouyiExpanded: false,
  },

  onLoad: function (options) {
    this.getRecordList();
  },

  getRecordList: function () {
    this.setData({ isLoading: true });

    wx.cloud.callFunction({
      name: 'getDivinationHistory',
      success: res => {
        if (res.result && res.result.success) {
          const records = res.result.data;
          
          const tarotRecords = records
            .filter(item => item.type === 'tarot')
            .map(item => ({
              _id: item._id,
              type: item.type,
              question: item.question,
              date: new Date(item.createdAt).toLocaleDateString().replace(/\//g, '.')
            }));
          
          const zhouyiRecords = records
            .filter(item => item.type === 'hexagram')
            .map(item => ({
              _id: item._id,
              type: item.type,
              question: item.question,
              hexagram: item.hexagrams.original.name || '未知卦象',
              date: new Date(item.createdAt).toLocaleDateString().replace(/\//g, '.')
            }));
          
          this.setData({
            tarotRecords,
            zhouyiRecords,
            isTarotExpanded: tarotRecords.length <= 3,
            isZhouyiExpanded: zhouyiRecords.length <= 3,
          });
        } else {
          wx.showToast({ title: '记录加载失败', icon: 'none' });
        }
      },
      fail: err => {
        console.error('Failed to fetch record list', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  toggleTarotCollapse: function() {
    this.setData({
      isTarotExpanded: !this.data.isTarotExpanded
    });
  },

  toggleZhouyiCollapse: function() {
    this.setData({
      isZhouyiExpanded: !this.data.isZhouyiExpanded
    });
  },

  goToDetail: function (e) {
    const { id, type } = e.currentTarget.dataset;
    if (id) {
      wx.navigateTo({
        url: `/mine/record/detail/detail?id=${id}&type=${type}`
      });
    } else {
      console.error('goToDetail: id is undefined', e.currentTarget.dataset);
      wx.showToast({
        title: '无法查看详情',
        icon: 'none'
      });
    }
  },

  onPullDownRefresh: function () {
    this.getRecordList();
    wx.stopPullDownRefresh();
  }
});
