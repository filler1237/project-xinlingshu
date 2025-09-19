// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const users = db.collection('users')

// 登录函数
exports.login = async (event, context) => {
  const { userInfo } = event
  const user = await users.where({
    _openid: userInfo.openid
  }).get()

  if (user.data.length === 0) {
    // 如果用户不存在，注册
    await users.add({
      data: {
        userInfo: userInfo,
        data: event.data,
        treeLevel:1,
        unlockedAchievements:[]
      }
    })
  } else {
    // 如果用户已存在，更新用户信息
    await users.doc(user.data[0]._id).update({
      data: {
        userInfo: userInfo,
        data: event.data
      }
    })
  }

  return {
    success: true
  }
}

// 注册函数
exports.register = async (event, context) => {
  const { userInfo } = event
  await users.add({
    data: {
      userInfo: userInfo,
      data: event.data,
      treeLevel:1,
      unlockedAchievements:[]
    }
  })

  return {
    success: true
  }
}