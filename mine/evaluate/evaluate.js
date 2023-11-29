const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    Appointments: [],   // 存储查询到的记录
    evaluateList: false,   // 标识是否查询到记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const openid = app.globalData.userInfo.openid;

    // 调用云函数
    wx.cloud.callFunction({
      name: 'evaluateList',
      data: {
        openid: openid,
      },
    })
    .then(res => {
      console.log('查询到的记录', res.result);
      if (res.result.evaluateList) {
        // 查询到记录的情况
        this.setData({
          Appointments: res.result.data,
          evaluateList: true
        });
      } else {
        // 没有查询到记录的情况
        console.log('没有查询到记录');
        this.setData({
          Appointments: [],
          evaluateList: false
        });
      }
    })
    .catch(error => {
      // 处理错误
      console.error(error);
      this.setData({
        Appointments: [],
        evaluateList: false
      });
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.setNavigationBarTitle({
      title: '我的评价',   // 设置页面标题为"我的评价"
    });

    const openid = app.globalData.userInfo.openid;

    // 调用云函数
    wx.cloud.callFunction({
      name: 'evaluateList',
      data: {
        openid: openid,
      },
    })
    .then(res => {
      console.log('查询到的记录', res.result);
      if (res.result.evaluateList) {
        // 查询到记录的情况
        this.setData({
          Appointments: res.result.data,
          evaluateList: true
        });
      } else {
        // 没有查询到记录的情况
        console.log('没有查询到记录');
        this.setData({
          Appointments: [],
          evaluateList: false
        });
      }
    })
    .catch(error => {
      // 处理错误
      console.error(error);
      this.setData({
        Appointments: [],
        evaluateList: false
      });
    });
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
});