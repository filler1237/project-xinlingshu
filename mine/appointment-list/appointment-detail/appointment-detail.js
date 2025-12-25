// pages/mine/appointment-list/appointment-detail/appointment-detail.js
const db = wx.cloud.database();
const format = null; // Removing dependency on missing utils/util.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    appointment: null,
    studentInfo: null,
    isLoading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.fetchDetail(options.id);
    }
  },

  fetchDetail(appointmentId) {
    this.setData({ isLoading: true });

    // 1. 获取预约详情
    db.collection('Appointments').doc(appointmentId).get()
      .then(res => {
        const appointment = res.data;

        // 格式化时间显示
        appointment.simpleStartTime = appointment.startTime; // Assuming startTime is already HH:mm or handle accordingly
        appointment.simpleEndTime = appointment.endTime;

        // 处理创建时间显示
        if (appointment._createTime) {
          const date = new Date(appointment._createTime);
          appointment.createTimeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }

        this.setData({ appointment });

        // 2. 根据 openid 获取学生详细信息 (从 user 集合)
        if (appointment._openid || appointment.openid) {
          this.fetchStudentInfo(appointment._openid || appointment.openid);
        } else {
          this.setData({ isLoading: false });
        }
      })
      .catch(err => {
        console.error('获取预约详情失败', err);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
        this.setData({ isLoading: false });
      });
  },

  fetchStudentInfo(openid) {
    // 1. 优先尝试直接从数据库查询（获取详细信息）
    db.collection('users').where({
      _openid: openid
    }).get().then(res => {
      console.log('数据库查询学生信息成功:', res);
      if (res.data.length > 0) {
        this.setData({ studentInfo: res.data[0] });
      }
      this.setData({ isLoading: false });
    }).catch(err => {
      console.error('前端查询 users 失败，尝试调用 getUserProfile 降级:', err);

      // 2. 如果数据库查询失败（通常是权限问题），则调用 getUserProfile 云函数作为兜底
      // 虽然 getUserProfile 可能只返回昵称头像，但总比空白强
      wx.cloud.callFunction({
        name: 'getUserProfile',
        data: { userId: openid }
      }).then(cloudRes => {
        console.log('getUserProfile 降级查询结果:', cloudRes);
        if (cloudRes.result && cloudRes.result.success && cloudRes.result.data) {
          this.setData({ studentInfo: cloudRes.result.data.userInfo });
        }
        this.setData({ isLoading: false });
      }).catch(e => {
        console.error('所有获取学生信息尝试均失败:', e);
        this.setData({ isLoading: false });
      })
    });
  },

  makePhoneCall(e) {
    const phone = e.currentTarget.dataset.phone;
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone,
      });
    }
  }
})