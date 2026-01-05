

Page({
  
  data: { // 页面的初始数据
    role: 'student', // 默认角色为学生
    realName: '',
    studentId: '',
    phoneNumber: '',
    college: '',
    major: '',
  },

  
  
  
  onLoad:function (options) { 
    wx.setNavigationBarTitle({
      title:'身份绑定'
    });

  },

  onRoleChange(event) {
    this.setData({
      role:event.detail,
    });
  },

  onInput(e){
    const{ field } = e.currentTarget.dataset;
    this.setData({
      [field]:e.detail.trim()
    });
  },

  submitIdentity() {
    const { role, realName, studentId, phoneNumber, college, major } = this.data;

    // 完整性校验
    if (!role || !realName || !studentId || !phoneNumber || !college || !major) {
      wx.showToast({ title: '请填写所有必填项', icon: 'none' });
      return;
    }

    // 手机号格式简单校验
    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
      wx.showToast({ title: '请输入正确的手机号码', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '正在绑定...' });

    // 准备要发送到云函数的数据
    const identityInfo = {
      role,
      realName,
      studentId,
      phoneNumber,
      college,
      major
    };

    wx.cloud.callFunction({
      name: 'updateUserProfile',
      data: {
        isBindingIdentity: true,
        identityInfo: identityInfo
      },
    }).then(res => {
      wx.hideLoading();
      if (res.result && res.result.success) {
        wx.showToast({ title: '绑定成功！', icon: 'success', duration: 1500 });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: res.result.message || '绑定失败，请重试', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '请求失败，请检查网络', icon: 'none' });
      console.error("调用身份绑定云函数失败", err);
    });
  },

  onReady() { // 生命周期函数--监听页面初次渲染完成
    
  },

  onHide() { // 生命周期函数--监听页面隐藏

  },

  onUnload() { // 生命周期函数--监听页面卸载

  },

  onPullDownRefresh() { // 页面相关事件处理函数--监听用户下拉动作

  },

  onReachBottom() { // 页面上拉触底事件的处理函数

  },

  onShareAppMessage() { // 用户点击右上角分享时触发的函数

  }
})