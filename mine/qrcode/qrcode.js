// mine/qrcode/qrcode.js
import drawQrcode from '../../utils/weapp.qrcode.esm.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    appointmentId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({
        appointmentId: options.id
      });
      this.generateQrCode(options.id);
    } else {
      console.error("No appointment ID provided");
      wx.showToast({
        title: '无法生成二维码',
        icon: 'none'
      });
    }
  },

  generateQrCode(id) {
    drawQrcode({
      width: 200,
      height: 200,
      canvasId: 'qrcode',
      text: id,
      callback: (res) => {
        if (res && res.errMsg && res.errMsg.indexOf(':ok') === -1) {
          console.error('drawQrcode callback error:', res);
          wx.showToast({
            title: '二维码生成失败',
            icon: 'none'
          });
        } else {
          console.log('qrcode finished');
        }
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    // Optional: You can allow sharing the QR code
    return {
      title: '我的预约二维码',
      path: `/mine/qrcode/qrcode?id=${this.data.appointmentId}`
    }
  }
})
