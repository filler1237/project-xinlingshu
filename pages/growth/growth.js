// pages/growth/growth.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    growthValue: 0,
    treeLevel: 1,
    unlockedAchievements: [],
    animationState: ''
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

  getGrowthData(){
    wx.showLoading({
      title:'加载中...',
    })
      wx.cloud.callFunction({
        name:'getUserGrowthData',
        success:res=>{
          wx.hideLoading()
          if (res.result.code === 0) {
            const data = res.result.data;
            const oldLevel = this.data.treeLevel;

            if (oldLevel !== data.treeLevel) {
              // Level changed, trigger animation
              this.setData({
                animationState: ''
              });
              setTimeout(() => {
                this.setData({
                  growthValue: data.growthValue,
                  treeLevel: data.treeLevel,
                  unlockedAchievements: data.unlockedAchievements,
                  animationState: 'animated'
                });
              }, 100); // A short delay to allow the DOM to update
            } else {
              // Initial load or no level change
              this.setData({
                growthValue: data.growthValue,
                treeLevel: data.treeLevel,
                unlockedAchievements: data.unlockedAchievements,
                animationState: 'animated' // Make it visible on first load
              });
            }
          }
          else{
            wx.showToast({
              title: '获取数据失败',
              icon:'none'
            });
          }
        },
        fail: err=>{
          wx.hideLoading()
          console.error('[云函数][getUserGrowthData]调用失败',err)
        }
      })
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

  }
})
