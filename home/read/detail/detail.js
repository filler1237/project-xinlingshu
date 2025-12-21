// home/read/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    article: {
      title: ''
    },
    userOpenid: '',
    comments: [],
    replyTo: null, // 当前正在回复的对象 { id, user, parentId }
    commentContent: '',
    currentImageIndex: 0 // 多图轮播索引
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

  onSwiperChange(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  onPreviewDetailImage(e) {
    const current = e.currentTarget.dataset.current;
    const article = this.data.article;
    // 优先使用 images 数组，如果没有则降级到 imageUrl
    const urls = (article.images && article.images.length > 0) ? article.images : [article.imageUrl];

    wx.previewImage({
      current: current,
      urls: urls,
      fail: function (err) {
        console.error('Preview fail', err);
      }
    });
  },

  getArticle(id) {
    wx.cloud.callFunction({
      name: 'getArticleById',
      data: {
        id: id
      },
      success: res => {
        if (res.result && res.result.data) {
          if (res.result.data.createTime) {
            res.result.data.createTime = this.formatTime(res.result.data.createTime);
          }
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
      name: "getComments",
      data: {
        articleId: articleId
      },
      success: res => {
        if (res.result.success) {
          const rawComments = res.result.data.reverse().map(comment => {
            comment.createTime = this.formatTime(comment.createTime);
            return comment;
          });

          const structuredComments = this.structureComments(rawComments);

          this.setData({
            comments: structuredComments
          });
        }
      },
      fail: err => {
        console.error('云函数getComments调用失败', err);
      }
    });
  },

  // 将扁平评论列表转换为嵌套结构
  structureComments(comments) {
    const commentMap = {};
    const roots = [];

    // 1. 初始化所有评论节点
    comments.forEach(c => {
      c.replies = [];
      commentMap[c._id] = c;
    });

    // 2. 组装树形结构
    comments.forEach(c => {
      if (c.parentId) {
        const parent = commentMap[c.parentId];
        // 如果找到了父评论，且父评论不是它自己（防止死循环，虽然理论上不应该）
        if (parent) {
          parent.replies.push(c);
        } else {
          // 如果找不到父评论（可能被删除），还是作为根评论显示？或者隐藏？这里选择作为根评论容错
          roots.push(c);
        }
      } else {
        roots.push(c);
      }
    });

    return roots;
  },

  // 点击回复按钮
  onTapReply(e) {
    const comment = e.currentTarget.dataset.comment;
    // 如果是回复子评论，parentId 应该是子评论所属的根评论ID (这里简化处理，假设只有两层：根评论 -> 子评论)
    // 但为了逻辑统一，我们尽量保持 parentId 指向直属父级，或者一直指向根。
    // 根据通常的社区设计（如微信朋友圈/小红书），回复通常是扁平显示在父评论下的。
    // 所以：如果回复的是根评论，parentId = comment._id
    // 如果回复的是子评论，parentId = comment.parentId (即归属于同一个根评论), 但我们需要标记回复的是谁(replyToUser)

    let parentId = comment.parentId ? comment.parentId : comment._id;

    this.setData({
      replyTo: {
        id: comment._id, // 用于 UI 显示“回复 xxx”
        user: comment.authorNickName,
        userId: comment._openid,
        parentId: parentId
      },
      // 自动聚焦输入框 (需要在 input 组件上绑定 focus 属性)
      isFileFocus: true
    });
  },

  // 取消回复状态
  onClearReply() {
    this.setData({
      replyTo: null,
      commentContent: ''
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
    if (!content.trim()) {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      });
      return;
    }
    wx.showLoading({
      title: '发布中...',
    });

    const data = {
      articleId: this.data.article._id,
      content: this.data.commentContent
    };

    // 如果是回复模式
    if (this.data.replyTo) {
      data.parentId = this.data.replyTo.parentId;
      data.replyToUserId = this.data.replyTo.userId;
      data.replyToUserName = this.data.replyTo.user;
    }

    wx.cloud.callFunction({
      name: "addComments",
      data: data,
      success: res => {
        wx.hideLoading();
        if (res.result.success) {
          wx.showToast({
            title: '评论成功',
            icon: 'success'
          });
          // 清空输入框并刷新评论列表
          this.setData({
            commentContent: '',
            replyTo: null // 重置回复状态
          });
          this.getComments(this.data.article._id);
        } else {
          wx.showToast({
            title: res.result.message || '评论失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        console.error('云函数addComment调用失败', err);
      }
    })
  },

  goToUserProfile(event) {
    const userId = event.currentTarget.dataset.userid;
    if (userId) {
      wx.navigateTo({
        url: `/home/profile/profile?userId=${userId}`,
      });
    }
  },

  onToggleArticleLike() {
    const article = this.data.article;
    const collectionName = article.collectionName || (article.isDrawing ? 'drawings' : 'articles');

    // 乐观UI更新
    const updatedLiked = !article.liked;
    const updatedLikes = updatedLiked ? (article.likes || 0) + 1 : (article.likes || 0) - 1;

    this.setData({
      'article.liked': updatedLiked,
      'article.likes': updatedLikes
    });

    wx.cloud.callFunction({
      name: 'dianzan',
      data: {
        articleId: article._id,
        collectionName: collectionName
      },
      success: res => {
        if (res.result && res.result.success) {
          // 确保使用最新的点赞数
          if (res.result.likes !== undefined) {
            this.setData({
              'article.likes': res.result.likes
            });
          }
        } else {
          // 失败回滚
          this.setData({
            'article.liked': article.liked,
            'article.likes': article.likes
          });
          wx.showToast({
            title: '操作失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        // 失败回滚
        this.setData({
          'article.liked': article.liked,
          'article.likes': article.likes
        });
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        console.error('dianzan云函数调用失败', err);
      }
    });
  },

  // 长按评论
  onLongPressComment(e) {
    const comment = e.currentTarget.dataset.comment;

    // 只有自己的评论才能删除
    if (comment._openid !== this.data.userOpenid) {
      return; // 不是自己的评论，不做任何操作
    }

    wx.showActionSheet({
      itemList: ['删除评论'],
      itemColor: '#d9534f',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.deleteComment(comment._id);
        }
      }
    });
  },

  // 删除评论
  deleteComment(commentId) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...', mask: true });

          wx.cloud.callFunction({
            name: 'deleteComment',
            data: { commentId: commentId },
            success: (res) => {
              wx.hideLoading();
              if (res.result && res.result.code === 0) {
                wx.showToast({ title: '删除成功', icon: 'success' });
                // 刷新评论列表
                this.getComments(this.data.article._id);
              } else {
                wx.showToast({ title: res.result?.msg || '删除失败', icon: 'none' });
              }
            },
            fail: (err) => {
              wx.hideLoading();
              console.error('删除评论失败:', err);
              wx.showToast({ title: '网络错误', icon: 'none' });
            }
          });
        }
      }
    });
  },

  /**
   * 格式化时间
   * @param {string} isoString ISO时间字符串
   * @returns {string} 格式化后的时间字符串
   */
  formatTime(isoString) {
    if (!isoString) return '';
    const now = new Date();
    const past = new Date(isoString);
    const diff = now - past; // 毫秒差

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return Math.floor(diff / minute) + '分钟前';
    } else if (diff < 24 * hour) {
      return Math.floor(diff / hour) + '小时前';
    } else if (diff < week) {
      return Math.floor(diff / day) + '天前';
    } else {
      // 超过一周，显示具体日期，例如 12-20
      const month = (past.getMonth() + 1).toString().padStart(2, '0');
      const date = past.getDate().toString().padStart(2, '0');
      return `${month}-${date}`;
    }
  }
})
