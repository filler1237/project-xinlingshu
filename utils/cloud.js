// utils/cloud.js

const updateUserFuyuanli = (openid, fuyuanli, successCallback, failCallback) => {
    wx.cloud.callFunction({
      name: 'updateUserInfo',
      data: {
        _openid: openid,
        fuyuanli: fuyuanli
      },
      success: res => {
        if (successCallback) successCallback(res)
      },
      fail: err => {
        if (failCallback) failCallback(err)
      }
    })
  }
  
  module.exports = {
    updateUserFuyuanli: updateUserFuyuanli
  }