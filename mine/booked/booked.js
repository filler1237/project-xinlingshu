
// pages/mine/booked/booked.js
const app = getApp();
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    
    
    
  },
  onBackTap: function(e) {
    var pages = getCurrentPages();                       //获取当前页面
    var prePage = pages[pages.length - 2];               //获取上一页面
    prePage.setData({
      'search.page': 1                                   //给上一页面的变量赋值
    })
    wx.navigateBack({                                    //返回上一页面
      delta: 1,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
  
    wx.cloud.callFunction({
      name: 'bookList',
    })
      .then((res) => {
        console.log('预约记录', res.result.data)
  
        if (res.result.data.length === 0) {
          // 没有查询到记录的情况
          console.log('没有查询到记录')
        } else {
          const appointments = res.result.data
  
          for (const appointment of appointments) {
            const appointmentTimestamp = new Date(appointment.date + ' ' + appointment.endTime).getTime()
            const now = new Date().getTime()
            const status = appointmentTimestamp < now ? '已结束' : '进行中' // 判断预约状态  
            appointment.status = status
          }
  
          appointments.sort((a, b) => b.appointmentTimestamp - a.appointmentTimestamp) // 按照时间戳降序排列
  
          this.setData({
            Appointments: appointments,
            booklist: true,
          })
        }
      })
      .catch((error) => {
        console.error('获取预约记录失败', error)
      })
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

  cancel(e) {
    const appointmentId = e.currentTarget.dataset.id;
    console.log('获取到的 appointmentId:', appointmentId); 

    wx.showModal({
      title:'确认取消',
      content:'确定要取消本次预约吗？',
      success:(res)=> {
        if(res.confirm) {
          wx.showLoading({title:'正在取消...'});

          wx.cloud.callFunction({
            name:'cancelAppointment',
            data:{
              appointmentId: appointmentId,
            },
          }).then(res=> {
            wx.hideLoading();
            if(res.result && res.result.success) {
              wx.showToast({ title:'取消成功' });
              // 刷新列表
              this.onLoad();
            } else {
              wx.showToast({
                title: res.result.message || '取消失败',
                icon:'none',
              });
            }
          }).catch(err=>{
            wx.hideLoading();
            wx.showToast({ title:'取消失败',icon:'none'});
            console.error(err);
          });
        }
      },
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


})