// home/read/read.js
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    articles: [],
    page: 1,
    pageSize: 10,
    hasMoreData: true,
    isLoading: false,
    userOpenid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getLoginOpenid();
    this.getArticles(true); // 首次加载
  },

  onShow(){
    if (this.data.needsRefresh) {
      this.getArticles(true);
      this.setData({ needsRefresh: false });
    }
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

  getArticles(isRefresh = false) {
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });

    const page = isRefresh ? 1 : this.data.page;

    wx.cloud.callFunction({
      name: 'getArticles',
      data: {
        page: page,
        pageSize: this.data.pageSize
      },
      success: res => {
        const newArticles = res.result.data || [];
        const oldArticles = isRefresh ? [] : this.data.articles;
        
        this.setData({
          articles: oldArticles.concat(newArticles),
          page: page + 1,
          hasMoreData: newArticles.length === this.data.pageSize
        });
      },
      fail: err => {
        console.error('[云函数] [getArticles] 调用失败', err)
      },
      complete: () => {
        this.setData({ isLoading: false });
        if (isRefresh) {
          wx.stopPullDownRefresh();
        }
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getArticles(true); // 下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.hasMoreData) {
      this.getArticles(); // 上拉加载更多
    }
  },

  onToggleLike(event) {
    const articleId = event.currentTarget.dataset.id;
    const index = event.currentTarget.dataset.index;
    const article = this.data.articles[index];
    const collectionName = article.collectionName;

    // 更新ui
    const updatedLiked = !article.liked;
    const updatedLikes = updatedLiked ? article.likes + 1 : article.likes - 1;
    this.setData({
      [`articles[${index}].liked`]: updatedLiked,
      [`articles[${index}].likes`]: updatedLikes
    });

    wx.cloud.callFunction({
      name:'dianzan',
      data:{
        articleId:articleId,
        collectionName: collectionName
      },
      success: res=>{
        if(res.result && res.result.success) {
          if(res.result.likes != this.data.articles[index].likes) {
            this.setData({
              [`articles[${index}].likes`]: res.result.likes
            });
          }
        } else {
          this.setData({
            [`articles[${index}].liked`]: article.liked,
            [`articles[${index}].likes`]: article.likes
          });
        }
      },
      fail: err=>{
        // 若失败则回滚前端的更新
        this.setData({
          [`articles[${index}].liked`]: article.liked,
          [`articles[${index}].likes`]: article.likes
        });
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        console.error('dianzan云函数调用失败',err);
      }
    });
  },

  goToUserProfile(event) {
    const userId = event.currentTarget.dataset.userid;
    if(userId) {
      wx.navigateTo({
        url: `/home/profile/profile?userId=${userId}`,
      });
    }
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
  },

  deleteArticle(event) {
    const articleId = event.currentTarget.dataset.id;

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
              id: articleId
            },
            success: res => {
              wx.hideLoading()
              if (res.result.code === 0) {
                wx.showToast({
                  title: '删除成功',
                })
                // Refresh the articles list
                this.getArticles(true);
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
