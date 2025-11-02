const app = getApp(); // 获取小程序实例对象
const db = wx.cloud.database();
const cloud = wx.cloud.init(); // 初始化云开发
Page({
  data: {
    showTopTips: false,
    hourIndex: -1,
    teacherIndex: -1,
    length: 0,
    availabilityId: '',
    availabilitySlot: [],
    phone: '',
    isFormValid: false,
    formData: {
      timeSlotIndex: -1,
      timeSlot: '',
      teacherId: -1,
      userId: 0,
      date: 0,
      startTime: 0,
      endTime: 0,
      availabilityId: 0,
      timeSlotIndex: 0,
      status: 0,
      detail: 0,
      length: 0,
    },
    teacherList: [],
    selectedDateIndex: -1,
    dateList: [],
    hourList: [],
    availabilityData: [], // Store all availability data
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

// 检查表单是否有效
checkFormValidity: function() {
  const { teacherIndex, selectedDateIndex, hourIndex, phone } = this.data;
  const isFormValid = teacherIndex !== -1 &&
                      selectedDateIndex !== -1 &&
                      hourIndex !== -1 &&
                      phone.length === 11;
  this.setData({ isFormValid });
},

// 处理手机号码输入
onPhoneInput: function(e) {
  this.setData({
    phone: e.detail.value
  });
  this.checkFormValidity();
},

onLoad: function (options) {
  wx.showLoading({ title: '加载中...' });
  wx.cloud.callFunction({
    name: 'getInitialAvailability',
    success: res => {
      this.setData({
        availabilityData: res.result,
        teacherList: res.result.map(t => t.teacherName)
      });
      wx.hideLoading();
    },
    fail: err => {
      console.error(err);
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
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
bindTeacherChange: function (e) {
  const teacherIndex = e.detail.value;
  const teacherData = this.data.availabilityData[teacherIndex];
  this.setData({
    teacherIndex: teacherIndex,
    selectedDateIndex: -1,
    hourIndex: -1,
    dateList: teacherData ? Object.keys(teacherData.dates) : [],
    hourList: [],
  });
  this.checkFormValidity();
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
onDateChange: function(e) {
  const selectedDateIndex = e.detail.value;
  const teacherData = this.data.availabilityData[this.data.teacherIndex];
  const selectedDate = this.data.dateList[selectedDateIndex];
  const dateData = teacherData.dates[selectedDate];

  this.setData({
    selectedDateIndex: selectedDateIndex,
    hourIndex: -1,
    hourList: dateData ? dateData.slots.map(s => s.startTime) : [],
    availabilitySlot: dateData ? dateData.slots : [],
    'formData.availabilityId': dateData ? dateData.availabilityId : null,
    'formData.date': selectedDate,
    'formData.teacherId': teacherData.teacherId,
  });
  this.checkFormValidity();
},
// 时间选择器改变时触发
onHourChange: function(e) {
  // 将选择的时间索引设置到页面数据中
  this.setData({
    hourIndex: e.detail.value
  }, () => {
    this.checkFormValidity();
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
    const appointmentData = {
      availabilityId: this.data.formData.availabilityId,
      teacherId: this.data.formData.teacherId,
      openid: app.globalData.userInfo.openid,
      date: this.data.formData.date,
      startTime: this.data.formData.timeSlot.startTime,
      endTime: this.data.formData.timeSlot.endTime,
      timeSlotIndex: this.data.formData.timeSlotIndex,
      status: this.data.formData.timeSlot.status,
      detail: this.data.formData.detail,
      teacher: this.data.teacherList[this.data.teacherIndex]
    };

    // 调用云函数更新可预约时间段状态
    wx.cloud.callFunction({
      name: 'createAppointment', //这里要调用createAppointment云函数
      data: appointmentData,
      success: res => {
        console.log(res.result);
        this.setData({
          teacherIndex: -1, // 更新老师选择器的选中项
          selectedDateIndex: -1, // 重置日期选择器的选中项
          hourIndex: -1, // 重置时间选择器的选中项
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
goToNextStep() {
  // 检查是否已选择老师、日期和时间
  if (!this.data.isFormValid) {
    wx.showToast({
      title: '请填写所有信息',
      icon: 'none',
    });
    return;
  }

  // 将第一步的表单数据保存到本地缓存
  wx.setStorageSync('appointment_step1_data', this.data.formData);

  // 跳转到第二步
  wx.navigateTo({
    url: './next/1/1',
  });
},
/**
* 用户点击右上角分享
*/
onShareAppMessage: function () {
   },
});
