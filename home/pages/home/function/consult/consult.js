const app = getApp(); // 获取小程序实例对象
const db = wx.cloud.database();
const cloud = wx.cloud.init(); // 初始化云开发
Page({
  data: {
    showTopTips: false, // 是否显示顶部提示
    userInfo: [], // 用户信息
    hourIndex: -1, // 选择的时间索引
    teacherIndex: -1, // 选择的咨询师索引
    length: 0, // 文本框输入的字符数
    formData: {}, // 表单数据
    // 咨询师列表
    teacherList: ['王贞贞', '姚双雁', '李亚玲'],
    selectedDateIndex: -1,
    // 日期列表，格式为 ['yyyy-MM-dd', 'yyyy-MM-dd', ... ]
    dateList: [],
    // 时间列表，格式为 ['hh:mm', 'hh:mm', ... ]
    hourList: [],
    // 选择的时间索引
    hourIndex: -1,
},

onLoad: function (options) { // 页面加载时执行的函数
var that = this; // 保存当前页面的上下文
this.initDateList();
this.initHourList();
this.setData({
  });
  },
   
textareaInput: function (e) { // 定义一个名为 textareaInput 的函数，传入一个事件对象 e
    this.setData({ // 更新数据
      length: e.detail.value.length, // 将 length 的值设为输入框中的字符数
     [`formData.detail`]: e.detail.value, // 将 formData.detail 的值设为输入框中的值
     });
   },
bindTeacherChange: function (e) {  // 绑定老师选择器的change事件处理函数
  var that = this;  // 缓存this指针
  const db = wx.cloud.database();
  this.setData({  // 更新页面数据
    teacherIndex: e.detail.value,  // 更新老师选择器的选中项
    selectedDateIndex: -1,  // 重置日期选择器的选中项
    hourIndex: -1,  // 重置时间选择器的选中项
  //  [`formData.teacher`]: teacher[e.detail.value],  // 更新表单数据中的老师字段
  });
  db.collection('Appointment').where({
    teacher:this.data.teacherList[this.data.teacherIndex]
  })
  .get({
   success:function(res){
     console.log(res)
   }
 })
},
initDateList: function() {
   // 创建日期列表
   const dateList = [];
   // 获取当前日期
   const today = new Date();
   // 循环添加后7天的日期
   for (let i = 0; i < 7; i++) {
     // 获取日期对象
     const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
     // 将日期格式化为字符串，添加到日期列表中
     const dateString = date.getFullYear() + '-' + this.formatNumber(date.getMonth() + 1) + '-' + this.formatNumber(date.getDate());
     dateList.push(dateString);
   }
   // 将日期列表设置到页面数据中
   this.setData({
     dateList: dateList
   });
 },
 
 // 初始化时间列表
 initHourList: function() {
   // 创建时间列表
   const hourList = [];
   // 循环添加每隔两个小时的时间
   for (let i = 9; i < 22; i += 2) {
     // 将时间格式化为字符串，添加到时间列表中
     const hourString = this.formatNumber(i) + ':00';
     hourList.push(hourString);
   }
   // 将时间列表设置到页面数据中
   this.setData({
     hourList: hourList
   });
 },
  formInputChange(e) {  // 表单输入框的输入事件处理函数
     const {
        field
     } = e.currentTarget.dataset;  // 获取输入框的绑定字段
     wx.setStorage({  // 存储数据到本地缓存
        key: field,  // 缓存的键
        data: e.detail.value,  // 缓存的值
     });
     this.setData({  // 更新页面数据
        [`formData.${field}`]: e.detail.value,  // 更新表单数据中对应字段的值
     });
  },
 // 格式化数字为两位数
formatNumber: function(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
},
// 日期选择器改变时触发
onDateChange: function(e) {
  this.setData({
    selectedDateIndex: e.detail.value
  });
  wx.cloud.callFunction({
    name: 'getAvailableTimeSlots',
    data: {
      teacherId: this.data.teacherIndex,
      date: this.data.dateList[e.detail.value  ]
  },
  fail: err => {
    console.error('[云函数] [getAvailableTimeSlots] 调用失败', err);
    if (err) return
  },
  success: res => {
    console.log(res.result);
    if (Array.isArray(res.result.data)) {
      this.setData({
        hourList: res.result.data.map(slot => slot.startTime),
        formData: res.result.formData // 将 formData 存储在页面的 data 对象中
      });
  
      console.log(this.data.formData); // 在此处添加打印语句
    } else {
      console.error('getAvailableTimeSlots 返回的结果不是数组对象');
    }
  }
  });
},
// 时间选择器改变时触发
onHourChange: function(e) {
// 将选择的时间索引设置到页面数据中
  this.setData({
  hourIndex: e.detail.value
});
},
submitForm() {
  // 若未登录，直接到登录页面
  if (app.globalData.userInfo.isLogin != true) { // 判断是否已登录
    wx.switchTab({
      url: '/pages/mine/mine' // 跳转到个人中心页面
    })
    return
  }
  // 获取表单数据
  var formdata = this.data.formData;
  // 保存 this 的值，以便在回调函数中使用
  var that = this;
  // 调用组件内的 validate 方法进行表单验证
  this.selectComponent("#form").validate((valid, errors) => {
    if (!valid) { // 如果表单校验不通过
      // 获取第一个错误信息的键名
      const firstError = Object.keys(errors);
      if (firstError.length) {
        // 将错误信息保存到 data 中
        this.setData({
          error: errors[firstError[0]].message,
        });
      }
    } else { // 如果表单校验通过
      // 如果 detail 字段为空，则将其默认为 "未填写"
      if (that.data.formData.detail == "" || that.data.formData.detail == null) {
        hat.data.formData.detail = "未填写";
      }
      // 调用云函数更新可预约时间段状态
      wx.cloud.callFunction({
        name: 'updateAvailability',
        data: {
          availabilityId: that.data.dataSchedule._id, // 可预约时间段记录的 ID
          timeSlotIndex: that.data.hourIndex, // 选择的时间索引
          status: 'expired' // 更新的状态
        },
        success: res => {
          console.log(res.result);
          // 更新成功后，跳转到预约成功页面
          wx.redirectTo({
            url: '/pages/appointment/success/success'
          });
        },
        fail: err => {
          console.error('[云函数] [updateAvailability] 调用失败', err);
          // 更新失败时，显示错误提示
          wx.showToast({
            title: '预约失败',
            icon: 'none'
          });
        }
      });
    }
  });
},
/**
* 用户点击右上角分享
*/
onShareAppMessage: function () {
   },
});