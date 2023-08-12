// pages/mine/booked/booked.js
const app = getApp();
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    Appointments: [],
    booklist:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const openid = app.globalData.userInfo.openid;
    const now = new Date(); // 获取当前时间
    // 查询预约记录
    db.collection('Appointments')
    .where({
      openid: openid,
    })
    .get()
      .then((res) => {
        console.log('预约记录', res);
        console.log('openid:',openid);
        if (res.data.length === 0) {
          // 没有查询到记录的情况
          console.log('没有查询到记录');
        } else if (res.data.length === 1) {
          // 查询到一条记录的情况
          const appointment = res.data[0];
          console.log('查询到一条记录', appointment);
          const appointmentTimestamp = new Date(appointment.date + ' ' + appointment.endTime).getTime();
          const status = appointmentTimestamp < now.getTime() ? '已结束' : '进行中'; // 判断预约状态
          this.setData({ Appointments: [{ ...appointment, status }] ,
            booklist:true
          });
        } else {
          // 查询到多条记录的情况
          console.log('查询到多条记录', res.data);
          const appointments = res.data.map((appointment) => {
            const appointmentTimestamp = new Date(appointment.date + ' ' + appointment.endTime).getTime();
            const status = appointmentTimestamp < now.getTime() ? '已结束' : '进行中'; // 判断预约状态
            return { ...appointment, status, appointmentTimestamp };
          });
          appointments.sort((a, b) => b.appointmentTimestamp - a.appointmentTimestamp); // 按照时间戳降序排列
          this.setData({ Appointments: appointments ,
          booklist:true
          });
        }
      });
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
    wx.setNavigationBarTitle({
      title: '我的预约',
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