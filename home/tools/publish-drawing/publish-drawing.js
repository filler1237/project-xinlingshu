// home/tools/publish-drawing/publish-drawing.js
const db = wx.cloud.database();
const app = getApp();

Page({
  data: {
    tempFilePath: '',
    description: '',
    activity: null,
    joinActivity: true,
    isPublishing: false,
  },

  onLoad(options) {
    if (options.tempFilePath) {
      this.setData({
        tempFilePath: decodeURIComponent(options.tempFilePath)
      });
    }
    this.checkCurrentActivity();
  },

  // 查询当前是否有活动
  async checkCurrentActivity() {
    const now = new Date();
    try {
      const res = await db.collection('drawings_activities')
        .where({
          startTime: db.command.lte(now),
          endTime: db.command.gte(now)
        })
        .orderBy('startTime', 'desc')
        .limit(1)
        .get();
      
      if (res.data.length > 0) {
        this.setData({ activity: res.data[0] });
      }
    } catch (error) {
      console.error("查询活动失败:", error);
    }
  },

  onDescriptionInput(e) {
    this.setData({ description: e.detail.value });
  },

  onActivitySwitchChange(e) {
    this.setData({ joinActivity: e.detail.value });
  },

  // 发布作品
  async publishDrawing() {
    if (this.data.isPublishing) return;

    this.setData({ isPublishing: true });
    wx.showLoading({ title: '正在发布...', mask: true });

    try {
      // 1. 上传图片到云存储
      const cloudPath = `drawings/${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
      const uploadResult = await wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: this.data.tempFilePath,
      });
      const fileID = uploadResult.fileID;

      // 内容安全检测已暂时禁用，上线前请务必重新开启
      /*
      // 2. 内容安全检查 (使用fileID)
      const safeCheckResult = await wx.cloud.callFunction({
        name: 'safeCheck',
        data: {
          text: this.data.description,
          fileID: fileID
        }
      });
      
      if (!safeCheckResult.result.pass) {
        await wx.cloud.deleteFile({ fileList: [fileID] });
        throw new Error(safeCheckResult.result.reason || '内容安全检测未通过');
      }
      */

      // 3. 写入数据库
      await db.collection('drawings').add({
        data: {
          fileID: fileID,
          userId: app.globalData.openid,
          description: this.data.description,
          activityId: (this.data.activity && this.data.joinActivity) ? this.data.activity._id : null,
          createTime: db.serverDate(),
          likes: 0,
          comments: []
        }
      });

      wx.hideLoading();
      wx.showToast({ 
        title: '发布成功', 
        icon: 'success',
        duration: 1500
      });

      // 4. 返回上一页并通知刷新
      setTimeout(() => {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.route === 'home/read/read') {
          prevPage.setData({ needsRefresh: true });
        }
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      wx.hideLoading();
      this.setData({ isPublishing: false });
      wx.showToast({
        title: error.message || '发布失败，请重试',
        icon: 'none'
      });
      console.error("发布失败:", error);
    }
  }
});
