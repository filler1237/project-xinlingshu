// cloud/createArticle/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { title, content } = event

  try {
    return await db.collection('articles').add({
      data: {
        _openid: wxContext.OPENID, // 记录创建者的openid
        title: title,
        content: content,
        createTime: db.serverDate() // 记录服务器时间
      }
    })
  } catch (e) {
    console.error(e)
  }
}
