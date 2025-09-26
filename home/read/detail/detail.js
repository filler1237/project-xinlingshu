// home/read/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    article: {},
    userOpenid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const articleId = options.id;
    this.getLoginOpenid();
    this.getArticle(articleId);
  },

  getLoginOpenid() {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        this.setData({
          userOpenid: res.result.openid
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  getArticle(id) {
    wx.cloud.callFunction({
      name: 'getArticleById',
      data: {
        id: id
      },
      success: res => {
        this.setData({
          article: res.result.data
        });
      },
      fail: err => {
        console.error('[云函数] [getArticleById] 调用失败', err)
      }
    })
  },

  deleteArticle() {
    wx.showModal({
      title: '提示',
      content: '确定要删除这篇文章吗？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
          })
          wx.cloud.callFunction({
            name: 'deleteArticle',
            data: {
              id: this.data.article._id
            },
            success: res => {
              wx.hideLoading()
              if (res.result.code === 0) {
                wx.showToast({
                  title: '删除成功',
                })

                // 获取页面栈
                const pages = getCurrentPages();
                if (pages.length > 1) {
                  // 获取上一页的实例
                  const prePage = pages[pages.length - 2];
                  // 调用上一页的刷新方法
                  if (typeof prePage.getArticles === 'function') {
                    prePage.getArticles();
                  }
                }

                setTimeout(() => {
                  wx.navigateBack()
                }, 1500)
              } else {
                wx.showToast({
                  title: res.result.msg || '删除失败',
                  icon: 'none'
                })
              }
              
            },
            fail: err => {
              wx.hideLoading()
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
              console.error('[云函数] [deleteArticle] 调用失败', err)
            }
          })
        }
      }
    })
  }
})
