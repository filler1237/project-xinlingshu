// home/read/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    content: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const articleId = options.id;
    this.getArticle(articleId);
  },

  getArticle(id) {
    wx.cloud.callFunction({
      name: 'getArticleById', // I will create this cloud function later
      data: {
        id: id
      },
      success: res => {
        const article = res.result.data;
        this.setData({
          title: article.title,
          content: article.content
        });
      },
      fail: err => {
        console.error('[云函数] [getArticleById] 调用失败', err)
      }
    })
  }
})
