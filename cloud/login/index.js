// 云函数入口文件
const cloud = require('wx-server-sdk')
const winston = require('winston')

cloud.init()
const db = cloud.database()
const userCollection = db.collection('user')

// 云函数入口函数
exports.main = async (event, context) => {
  const userInfo = event.userInfo
  winston.info(`userInfo: ${JSON.stringify(userInfo)}`)

  try {
    const res = await userCollection.where({
      openid: cloud.getWXContext().OPENID
    }).get()
    if (res.data.length === 0) {
      const newUser = {
        openid: cloud.getWXContext().OPENID,
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName,
        createTime: new Date(),
        updateTime: new Date()
      }
      const insertRes = await userCollection.add({
        data: newUser
      })
      newUser._id = insertRes._id
      return {
        code: 0,
        message: '登录成功',
        result: newUser
      }
    } else {
      const user = res.data[0]
      const updateRes = await userCollection.doc(user._id).update({
        data: {
          avatarUrl: userInfo.avatarUrl,
          nickName: userInfo.nickName,
          updateTime: new Date()
        }
      })
      return {
        code: 0,
        message: '登录成功',
        result: user
      }
    }
  } catch (err) {
    winston.error(`login error: ${err.message}`)
    return {
      code: -1,
      message: '登录失败',
      result: null
    }
  }
}