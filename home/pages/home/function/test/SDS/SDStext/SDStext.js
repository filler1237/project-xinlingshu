// pages/home/function/1/SDS/SDStext/SDStext.js
Page({

  Goresult(){
    wx.navigateTo({
      url: '../result/result',
    })
  },

  /**
   * 页面的初始数据
   */
  data: {
        options: [
            { level: '没有或很少时间', value: '0', checked: false },
            { level: '少部分时间', value: '1', checked: false },
            { level: '相当多时间', value: '2', checked: false },
            { level: '绝大部分或全部时间', value: '3', checked: false },
          ],
      },
      serviceValChange: function (e) {
        var options = this.data.options;
        var checkArr = e.detail.value;
        for (var i = 0; i < options.length; i++) {
          if (checkArr.indexOf(i + "") != -1) {
            options[i].checked = true;
          } else {
            options[i].checked = false;
          }
        }
        this.setData({
          options: options
        })
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
})