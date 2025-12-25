// mine/appointment-list/appointment-list.js
const app = getApp();

Page({
  data: {
    isLoading: true,
    appointmentList: [],
    groupedList: [],
    totalCount: 0
  },

  onLoad(options) {
    this.fetchAppointments();

    // 记录本次查看时间，用于消除红点
    // 注意：这里需要配合 mine.js 中的逻辑，确保 mine.js 是比较 "上次查看时间" 和 "预约创建时间"
    // 简单起见，这里设置 storage，mine.js onShow 时读取
    wx.setStorageSync('lastAdminViewTime', Date.now());
  },

  onPullDownRefresh() {
    this.fetchAppointments().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  fetchAppointments() {
    this.setData({ isLoading: true });

    return wx.cloud.callFunction({
      name: 'getAdminAppointments',
      data: {
        username: app.globalData.userInfo ? app.globalData.userInfo.username : ''
      }
    }).then(res => {
      console.log('Admin Appointment Res:', res);
      if (res.result.success) {
        const rawList = res.result.data || [];
        this.processData(rawList);
      } else {
        wx.showToast({
          title: '获取失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error(err);
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
      this.setData({ isLoading: false });
    });
  },

  processData(list) {
    // 1. 简单格式化时间
    const processedList = list.map(item => {
      return {
        ...item,
        // 将 09:00:00 截取为 09:00
        simpleStartTime: (item.startTime || '').substring(0, 5),
        simpleEndTime: (item.endTime || '').substring(0, 5),
      };
    });

    // 2. 按日期分组
    // 结构: [ { date: '2023-12-25', list: [...], displayDate: '今天', weekDay: '周一' } ]
    const groups = {};
    const todayStr = new Date().toISOString().split('T')[0];

    // 计算明天的日期字符串
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    const tmrStr = tmr.toISOString().split('T')[0];

    processedList.forEach(item => {
      const d = item.date;
      if (!groups[d]) {
        groups[d] = [];
      }
      groups[d].push(item);
    });

    // 转换为数组并排序
    const sortedDates = Object.keys(groups).sort();

    const finalGrouped = sortedDates.map(dateStr => {
      let displayDate = dateStr;
      if (dateStr === todayStr) displayDate = '今天';
      else if (dateStr === tmrStr) displayDate = '明天';

      // 计算星期几
      const weekArray = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      const dateObj = new Date(dateStr);
      const weekDay = weekArray[dateObj.getDay()];

      return {
        date: dateStr,
        displayDate: displayDate,
        weekDay: weekDay,
        list: groups[dateStr]
      };
    });

    this.setData({
      appointmentList: processedList,
      groupedList: finalGrouped,
      totalCount: processedList.length,
      isLoading: false
    });
  }
})