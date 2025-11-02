// home/read/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    article: {
      title:''
    },
    userOpenid: '',
    comments: []
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
        if (res.result && res.result.data) {
          this.setData({
            article: res.result.data
          });
          this.getComments(res.result.data._id);
        } else {
          wx.showToast({
            title: '文章加载失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('[云函数] [getArticleById] 调用失败', err)
        wx.showToast({
          title: '文章加载失败',
          icon: 'none'
        });
      }
    })
  },

  getComments(articleId) {
    wx.cloud.callFunction({
      name:"getComments",
      data:{
        articleId: articleId
      },
      success: res=> {
        if(res.result.success) {
          const comments = res.result.data.map(comment => {
            comment.createTime = new Date(comment.createTime).toLocaleString();
            return comment;
          });
          this.setData({
            comments: comments
          });
        }
      },
      fail: err=>{
        console.error('云函数getComments调用失败',err);
      }
    });
  },

  // 监听评论输入
  onCommentInput(e) {
    this.setData({
      commentContent: e.detail.value
    });
  },

  // 提交评论
  submitComment() {
    const content = this.data.commentContent || '';
    if(!content.trim()) {
      wx.showToast({
        title:'评论内容不能为空',
        icon: 'none'
      });
      return;
    }
    wx.showLoading({
      title:'发布中...',
    });
    wx.cloud.callFunction({
      name:"addComments",
      data: {
        articleId: this.data.article._id,
        content: this.data.commentContent
      },
      success: res=>{
        wx.hideLoading();
        if (res.result.success) {
          wx.showToast({
            title:'评论成功',
            icon:'success'
          });
          // 清空输入框并刷新评论列表
          this.setData({
            commentContent:''
          });
          this.getComments(this.data.article._id);
        } else {
          wx.showToast({
            title:res.result.message || '评论失败',
            icon:'none'
          });
        }
      },
      fail:err=>{
        wx.hideLoading();
        wx.showToast({
          title:'网络错误，请重试',
          icon:'none'
        });
        console.error('云函数addComment调用失败',err);
      }
    })
  },

})
