// home/read/create/create.js
Page({
  data: {
    title: '',
    content: '',
    tempImages: [] // 本地临时图片路径
  },

  // 选择图片
  chooseImage() {
    const currentCount = this.data.tempImages.length;
    wx.chooseMedia({
      count: 9 - currentCount, // 剩余可选数量
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(file => file.tempFilePath);
        this.setData({
          tempImages: this.data.tempImages.concat(tempFiles)
        });
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.src;
    wx.previewImage({
      current: current,
      urls: this.data.tempImages
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.tempImages;
    images.splice(index, 1);
    this.setData({
      tempImages: images
    });
  },

  // 发布文章
  async publishArticle() {
    const { title, content, tempImages } = this.data;

    // 简单校验：标题和内容不能全空，或者只有标题没内容
    // 根据需求，可以允许仅发图，但通常建议至少有点文字或标题
    if (!title && !content && tempImages.length === 0) {
      wx.showToast({ title: '请输入内容或添加图片', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '发布中...', mask: true });

    try {
      let imageFileIds = [];

      // 1. 如果有图片，先上传图片
      if (tempImages.length > 0) {
        // 并发上传所有图片
        const uploadTasks = tempImages.map((filePath, index) => {
          const ext = filePath.match(/\.[^.]+?$/)[0]; // 获取扩展名
          // 命名规则：user_image/时间戳_随机数_索引.jpg
          const cloudPath = `user_image/${Date.now()}_${Math.floor(Math.random() * 1000)}_${index}${ext}`;

          return wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: filePath
          });
        });

        const uploadResults = await Promise.all(uploadTasks);
        imageFileIds = uploadResults.map(res => res.fileID);
      }

      // 2. 调用云函数创建文章
      wx.cloud.callFunction({
        name: 'createArticle',
        data: {
          title: title,
          content: content,
          images: imageFileIds // 传递图片fileID数组
        },
        success: res => {
          wx.hideLoading();
          wx.showToast({ title: '发表成功' });

          this.triggerTasksAndGoBack();
        },
        fail: err => {
          wx.hideLoading();
          wx.showToast({ title: '发表失败，请重试', icon: 'none' });
          console.error('[云函数] [createArticle] 调用失败', err);
        }
      });

    } catch (err) {
      wx.hideLoading();
      console.error('图片上传失败', err);
      wx.showToast({ title: '图片上传失败', icon: 'none' });
    }
  },

  // 触发任务并返回（逻辑分离，保持整洁）
  triggerTasksAndGoBack() {
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
          duration: 2000
        });
      }
      this.goBackWithRefresh(2000);

    }).catch(err => {
      console.error('任务调用失败', err);
      wx.showToast({ title: '奖励获取失败', icon: 'none' });
      this.goBackWithRefresh(1500);
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
