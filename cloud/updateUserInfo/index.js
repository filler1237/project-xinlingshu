// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const userInfo = db.collection('users')
  try {
    const res = await userInfo.where({
      _openid: event.userInfo._openid
    }).update({
      data: {
        fuyuanli: event.fuyuanli,
        Level: event.Level,
        max: event.max,
        gap: event.gap
      }
    })
    return res
  } catch (err) {
    console.log(err)
    return err
  }
}