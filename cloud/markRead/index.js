// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const db = cloud.database()
    const _ = db.command

    // 1. 先把未读的标记为已读
    const updateRes = await db.collection('notifications').where({
      receiverOpenId: openid,
      isRead: false
    }).update({
      data: {
        isRead: true
      }
    })

    // 2. 查询消息列表（聚合查询关联用户信息）
    const listRes = await db.collection('notifications').aggregate()
      .match({
        receiverOpenId: openid
      })
      .sort({ createTime: -1 })
      .lookup({
        from: 'users',
        localField: 'senderOpenId',
        foreignField: '_openid',
        as: 'senderInfo'
      })
      .end()

    return {
      success: true,
      updated: updateRes.stats.updated,
      data: listRes.list
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      errMsg: e
    }
  }
}