// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const { userId } = event

  if (!userId) {
    return {
      success: false,
      message: '缺少用户ID'
    }
  }

  try {
    // 查询用户信息
    const userRes = await db.collection('users').where({
      _openid: userId
    }).limit(1).get()

    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '未找到该用户'
      }
    }
    const userInfo = userRes.data[0]

    // 查询用户发布过的文章
    const articlesRes = await db.collection('articles').where({
      _openid: userId
    })
      .orderBy('createTime', 'desc').get()

    // 查询用户发布过的画作
    const drawingsRes = await db.collection('drawings').where({
      _openid: userId
    })
      .orderBy('createTime', 'desc').get()

    // 合并文章和画作
    let mergedList = [];
    if (articlesRes.data) {
      mergedList = mergedList.concat(articlesRes.data.map(item => ({ ...item, type: 'article' })));
    }
    if (drawingsRes.data) {
      mergedList = mergedList.concat(drawingsRes.data.map(item => ({
        ...item,
        type: 'drawing',
        isDrawing: true,
        // 关键映射：适配前端字段
        imageUrl: item.fileID,
        content: item.description
      })));
    }

    // 按时间倒序排序
    mergedList.sort((a, b) => {
      const timeA = new Date(a.createTime).getTime();
      const timeB = new Date(b.createTime).getTime();
      return timeB - timeA;
    });

    // 组合数据并返回
    return {
      success: true,
      data: {
        userInfo: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
        },
        articles: mergedList
      }
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: '获取用户主页信息失败'
    }
  }
}