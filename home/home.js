Page({
  data: {
    userInfo: {}
  },

  onLoad: function () {
    const db = wx.cloud.database()
    const openid = wx.getStorageSync('openid')
    if (!openid) {
      console.error('openid 不存在，请先调用云函数获取 openid')
      return
    }
    const that = this
    db.collection('users').where({ _openid: openid }).get({
      success: function (res) {
        if (res.data.length > 0) {
          that.setData({ userInfo: res.data[0] })
        } else {
          console.warn('数据库中找不到该 openid 对应的用户记录')
        }
      },
      fail: console.error
    })
  }

  
})
