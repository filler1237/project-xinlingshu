// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { articleId, content } = event

  if(!articleId || !content) {
    return {
      success: false,
      message: '缺少必要参数'
    }
  }
  // 可以后续添加审核机制
  try {
    await db.collection('comments').add({
      data: {
        _openid: openid,
        articleId: articleId,
        content: content,
        createTime: new Date()
      }
    })

    // 更新article中的commentCount字段
    await db.collection('articles').doc(articleId).update({
      data: {
        commentCount:_.inc(1)
      }
    })

    return {
      success: true,
      message: '评论成功'
    }
  } catch(e) {
    console.error(e)
    return {
      success: false,
      message: '评论失败'
    }
  }
}
