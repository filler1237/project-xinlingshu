const app = getApp(); // 获取小程序实例对象
const db = wx.cloud.database();
const cloud = wx.cloud.init(); // 初始化云开发
Page({
  data: {
    showTopTips: false, // 是否显示顶部提示
    // userInfo: {
    //   openid,
    //   nickName,
    //   sex,
    //   age,
    //   class:0
    // }, // 用户信息
    hourIndex: -1, // 选择的时间索引
    teacherIndex: -1, // 选择的咨询师索引
    length: 0, // 文本框输入的字符数
    availabilityId: '' ,
    availabilitySlot:[],
    formData: {
      timeSlotIndex: -1,
      timeSlot: '',
      teacherId:-1, 
      userId:0,
      date:0, 
      startTime:0, 
      endTime:0, 
      availabilityId:0, 
      timeSlotIndex:0, 
      status:0, 
      detail:0,
      length: 0, // 添加一个名为 length 的字段
    },// 表单数据
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
onLoad: function (options) { // 页面加载时执行的函数
var that = this; // 保存当前页面的上下文
this.initDateList();
this.initHourList();
this.setData({
  });
  },
   
  textareaInput: function (e) {
    const { value } = e.detail; // 使用对象解构语法获取输入框的值
    const length = value.length; // 获取输入框中的字符数
    this.setData({
      [`formData.detail`]: value, // 更新 formData.detail 的值
      [`formData.length`]: length, // 更新 formData.length 的值
      detail: value, // 更新 detail 的值
      length: length, // 更新 length 的值
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

  const currentTime = new Date().toISOString(); // 获取当前日期和时间的字符串表示

  wx.cloud.callFunction({
    name: 'getAvailableTimeSlots',
    data: {
      teacherId: this.data.teacherIndex,
      date: this.data.dateList[e.detail.value],
      currentTime: currentTime, // 传递当前日期和时间
    },
    fail: err => {
      console.error('[云函数] [getAvailableTimeSlots] 调用失败', err);
      if (err) return;
    },
    success: res => {
      console.log(res.result);
      if (Array.isArray(res.result.data)) {
        this.setData({
          availabilitySlot: res.result.data,
          hourList: res.result.data.map(slot => slot.startTime),
          formData: res.result.formData || {} // 添加 "|| {}" 以确保 formData 总是一个对象
        });

        this.setData({
          [`formData.availabilityId`]: res.result.formData.availabilityId
        });
        console.log(this.data.formData); 
        console.log(this.data.hourList); 
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

  // 调用云函数查询时间段索引
  wx.cloud.callFunction({
    name: 'getTimeIndex',
    data: {
      availabilityId: this.data.formData.availabilityId,
      startTime: this.data.hourList[this.data.hourIndex]
    },
    success: res => {
      console.log(res.result);
      // 将查找到的时间段索引保存到 formData 中
      this.setData({
        [`formData.timeSlotIndex`]: res.result.index,
        [`formData.timeSlot`]: this.data.availabilitySlot[this.data.hourIndex]
      });
      console.log(this.data.formData)
    },
    fail: err => {
      console.error('[云函数] [getAvailabilityIndex] 调用失败', err);
      // 查询失败时，显示错误提示
      wx.showToast({
        title: '查询时间段索引失败',
        icon: 'none'
      });
    }
  });
},
submitForm() {
  // 若未登录,直接到登录页面
  if (app.globalData.userInfo.isLogin != true) {
    wx.switchTab({
      url: '/pages/mine/mine'
    });
    return;
  }

  // 获取表单数据
  var formdata = this.data.formData;
  formdata.detail = this.data.formData.detail; // 添加文本内容到formData
  formdata.length = this.data.formData.length; // 添加文本内容到formData
  // 保存 this 的值,以便在回调函数中使用
  var that = this;  

  // 判断老师选择器、日期选择器和时间选择器的当前选择的索引是否为-1,以及表单输入框是否有输入
  if (that.data.teacherIndex !== -1 && that.data.selectedDateIndex !== -1 && that.data.hourIndex !== -1 && this.data.formData.length) {      
    // 调用云函数更新可预约时间段状态
    wx.cloud.callFunction({
      name: 'createAppointment',   //这里要调用createAppointment云函数
      data: {
        availabilityId: this.data.formData.availabilityId,
        startTime: this.data.hourList[this.data.hourIndex],
        teacherId: this.data.formData.teacherId,
        openid: app.globalData.userInfo.openid,
        date: this.data.formData.date,
        startTime: this.data.formData.timeSlot.startTime,
        endTime: this.data.formData.timeSlot.endTime, 
        timeSlotIndex: this.data.formData.timeSlotIndex, 
        status: this.data.formData.timeSlot.status,
        detail: this.data.formData.detail,
        teacher:this.data.teacherList[this.data.formData.teacherId]
      },
      success: res => {
        console.log(res.result);
        this.setData({
          teacherIndex: -1,  // 更新老师选择器的选中项
          selectedDateIndex: -1,  // 重置日期选择器的选中项
          hourIndex: -1,  // 重置时间选择器的选中项
        })
        wx.showToast({
          title: '预约成功',
          icon: '',
        });
      },
      fail: err => {
        console.error('[云函数] [createAppointmen] 调用失败', err);
        // 更新失败时,显示错误提示
        wx.showToast({
          title: '预约失败',
          icon: 'none',
        });
      },
    });
  } else { // 如果老师选择器、日期选择器和时间选择器的当前选择的索引为-1,或表单输入框为空
    wx.showToast({
      title: '请选择老师、日期和时间,且输入框不能为空',
      icon: 'none',
    });
  }
},
/**
* 用户点击右上角分享
*/
onShareAppMessage: function () {
   },
});