// home/read/create/create.js
Page({
  data: {
    title: '',
    content: ''
  },

  publishArticle() {
    const { title, content } = this.data;
    if (!title || !content) {
      wx.showToast({
        title: '标题和内容不能为空',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '发表中...',
    });

    wx.cloud.callFunction({
      name: 'createArticle',
      data: {
        title: title,
        content: content
      },
      success: res => {
        wx.hideLoading();
        wx.showToast({
          title: '发表成功',
        });
        // 返回上一页并刷新
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        prevPage.getArticles(); // 调用上一页的getArticles方法刷新列表
        wx.navigateBack();
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '发表失败，请重试',
          icon: 'none'
        });
        console.error('[云函数] [createArticle] 调用失败', err);
      }
    });
  }
});
