Page({
  data: {
    success: false,
    studentName: '',
    studentId: '',
    college: '',
    major: '',
    phoneNumber: '',
    message: ''
  },

  onLoad: function (options) {
    if (options.success === 'true') {
      this.setData({
        success: true,
        studentName: decodeURIComponent(options.studentName),
        studentId: decodeURIComponent(options.studentId),
        college: decodeURIComponent(options.college),
        major: decodeURIComponent(options.major),
        phoneNumber: decodeURIComponent(options.phoneNumber)
      });
    } else {
      this.setData({
        success: false,
        message: decodeURIComponent(options.message)
      });
    }
  },

  goBack() {
    wx.navigateBack();
  }
});
