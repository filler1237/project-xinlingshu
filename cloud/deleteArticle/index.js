// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { id } = event

  try {
    // 查找文章
    const articleRes = await db.collection('articles').doc(id).get()
    const article = articleRes.data

    // 验证权限
    if (article._openid !== wxContext.OPENID) {
      return { code: -1, msg: '无权限删除' }
    }

    // 删除文章
    await db.collection('articles').doc(id).remove()

    return { code: 0, msg: '删除成功' }

  } catch (e) {
    console.error(e)
    return { code: -1, msg: '删除失败', error: e }
  }
}
