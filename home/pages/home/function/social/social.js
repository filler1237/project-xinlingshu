// home/pages/home/function/social/social.js
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    age: 15,
    newage: 20,
  },

  addAge() {
    db.collection('Train').add({
      data: {
        feedback:"",
      }
    }).then((res) => {
      console.log(res);
    });
  },

  changeAge() {
    db.collection('Appointments').doc('0375964d64e9b2ae028f286842e4fc91').get().then((res) => {
      console.log(res);
      // 在获取到最新数据后执行更新操作
      db.collection('Appointments').doc('0375964d64e9b2ae028f286842e4fc91').update({
        data: {
          "feedback": "Hello"
        }
      }).then((res) => {
        console.log(res);
      });
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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