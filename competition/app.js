App({
  onLaunch() {
    
    wx.cloud.init({
      env: 'cloud1-1gq1rj6t215e9c4d', // 复制你的 dev-env ID 粘贴到这里
      traceUser: true
    })
  }
})

wx.cloud.callFunction({
  name: 'login',
  success: res => {
    wx.setStorageSync('openid', res.result.openid)
    console.log('openid 获取成功：', res.result.openid)
  },
  fail: err => {
    console.error('openid 获取失败：', err)
  }
})

// app.js 或者 index 页面
wx.cloud.callFunction({
  name: 'login',
  success: res => {
    const openid = res.result.openid
    wx.setStorageSync('openid', openid)
    const db = wx.cloud.database()
    db.collection('users').where({ _openid: openid }).get({
      success: res => {
        if (res.data.length > 0) {
          wx.reLaunch({ url: '/pages/home/home' })
        } else {
          wx.redirectTo({ url: '/pages/bindIdentity/bindIdentity' })
        }
      }
    })
  }
})
