// pages/growth/growth.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    growthValue: 0,
    treeLevel: 1,
    unlockedAchievements: [],
    isWatering: false, // 新增：控制浇水动画的状态
    isAnimating: false, //新增控制树木升级动画播放效果
    waterdrops: 0,
    todayTasks: [], // 初始化为空数组，将由云函数填充
    isPanelExpanded: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getGrowthData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getGrowthData();
  },

  getGrowthData() {
    return new Promise((resolve,reject)=>{
      wx.showLoading({
        title:'加载中...',
        mask:true
      }); 
    wx.cloud.callFunction({
      name: 'getUserGrowthData',
      success: res => {
        if (res.result.code === 0) {
          const data = res.result.data;
          const oldLevel = this.data.treeLevel;

          if (oldLevel !== data.treeLevel && oldLevel !== 0) {
            // 第1步：播放动画
            this.setData({
              isAnimating: true
            });

            // 第2步：等待动画播完
            setTimeout(() => {
              // 第3步：动画结束后再更新图片
              this.setData({
                growthValue: data.growthValue,
                treeLevel: data.treeLevel,
                unlockedAchievements: data.unlockedAchievements,
                waterdrops: data.waterdrops,
                isAnimating: false,
                // 补上任务列表的更新
                todayTasks: data.tasks.map(task => ({
                  id: task.id,
                  title: task.name,
                  done: task.completed
                }))
              });
            }, 1000); 

          } else {
            // 直接更新数据，包括任务列表
            this.setData({
              growthValue: data.growthValue,
              treeLevel: data.treeLevel,
              unlockedAchievements: data.unlockedAchievements,
              waterdrops: data.waterdrops,
              todayTasks: data.tasks.map(task => ({
                id: task.id,
                title: task.name,
                done: task.completed
              }))
            });
          }
          wx.hideLoading();
          resolve(data);
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading()
        console.error('[云函数][getUserGrowthData]调用失败', err)
        reject(err);
      }
    });
    });
  },


  onWatering() {
    // 如果正在浇水、生长动画播放中或水滴为0，则不触发
    if (this.data.isWatering || this.data.isAnimating || this.data.waterdrops <= 0) {
      if (this.data.waterdrops <= 0) {
        wx.showToast({
          title: '水滴不足',
          icon: 'none'
        });
      }
      return;
    }

    // 1. 显示水壶，开始动画
    this.setData({ isWatering: true });

    // 2. 播放动画期间，可以先调用云函数
    wx.cloud.callFunction({
      name: 'waterTheTree',
      success: res => {
        if (res.result.code === 0) {
          // 成功后等待动画结束再刷新数据
          setTimeout(() => {
            this.getGrowthData()
            .then(data=>{
              wx.showToast({
              title: `浇水成功`,
              icon: 'success'
            });
            })
            .catch(err=>{
              wx.showToast({
                title:err.message || '数据刷新失败',
                icon:'none'
              });
            });
          }, 2000); // 动画时长为2秒
        } else {
          wx.showToast({
            title: res.result.message || '浇水失败',
            icon: 'none'
          });
          this.setData({ isWatering: false}); //重置浇水状态
        }
      },
      fail: err => {
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
        this.setData({ isWatering: false});
        console.error('[云函数][waterTheTree]调用失败', err);
      }
    });

    // 3. 动画结束后，隐藏水壶
    setTimeout(() => {
      this.setData({ isWatering: false });
    }, 2000); // 动画时长为2秒
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  onPanelToggle(e) {
    this.setData({
      isPanelExpanded: e.detail.isExpanded
    });
  }
})
