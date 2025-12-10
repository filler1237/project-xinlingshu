// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const countResult = await db.collection('notifications').where({
      receiverOpenId: openid,
      isRead: false
    }).count()

    return {
      success: true,
      count: countResult.total
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      errMsg: e
    }
  }
}