// home/read/create/create.js
Page({
  data: {
    title: '',
    content: ''
  },

    publishArticle() {
    const { title, content } = this.data;
    if (!title || !content) {
      wx.showToast({ title: '标题和内容不能为空', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '发表中...' });

    wx.cloud.callFunction({
      name: 'createArticle',
      data: {
        title: title,
        content: content
      },
      success: res => {
        wx.hideLoading();
        wx.showToast({ title: '发表成功' });

        // 先调用任务函数
        wx.cloud.callFunction({
          name: 'taskSignIn',
          data: { taskId: 'publishArticle' }
        }).then(taskRes => {
          if (taskRes.result.code === 0 && taskRes.result.reward > 0) {
            // 任务成功，用 Toast 显示奖励信息
            wx.showToast({
              title: taskRes.result.message,
              icon: 'none',
              duration: 2000 // 显示 2 秒
            });
          }
          // 不管任务成功与否，都在 2 秒后返回
          this.goBackWithRefresh(2000);

        }).catch(err => {
          // 即使任务函数调用失败，也要保证页面能返回
          console.error('任务调用失败', err);
          wx.showToast({ title: '奖励获取失败', icon: 'none' });
          this.goBackWithRefresh(1500); // 1.5秒后返回
        });
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({ title: '发表失败，请重试', icon: 'none' });
        console.error('[云函数] [createArticle] 调用失败', err);
      }
    });
  },

  // 辅助函数，用于延迟返回上一页并刷新
  goBackWithRefresh(delay = 0) {
    setTimeout(() => {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        const prevPage = pages[pages.length - 2];
        if (prevPage && typeof prevPage.getArticles === 'function') {
          prevPage.setData({ needsRefresh: true }); 
        }
        wx.navigateBack();
      }
    }, delay);
  }

});
