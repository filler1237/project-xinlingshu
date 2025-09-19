// home/read/read.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    articles: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getArticles();
  },

  getArticles() {
    wx.cloud.callFunction({
      name: 'getArticles',
      success: res => {
        this.setData({
          articles: res.result.data
        });
      },
      fail: err => {
        console.error('[云函数] [getArticles] 调用失败', err)
      }
    })
  },

  goToDetail(event) {
    const articleId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/home/read/detail/detail?id=${articleId}`,
    })
  },
  goToCreatePage() {
    wx.navigateTo({
      url: '/home/read/create/create',
    })
  }
})

