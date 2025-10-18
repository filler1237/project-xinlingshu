// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { id } = event
  
  try {
    const res = await db.collection('articles').aggregate()
    .match({
      _id: id
    })
    .lookup({
      from: 'users',
      localField:'_openid',
      foreignField:'_openid',
      as:'authorInfo',
    }).end()

    if(res.list.length > 0) {
      const article = res.list[0];
      if(article.authorInfo && article.authorInfo.length > 0) {
        article.authorNickname = article.authorInfo[0].nickName;
        article.authorAvatarUrl = article.authorInfo[0].avatarUrl;
      }
      delete article.authorInfo;
      return {
        success: true,
        data: article
      }
    } else {
      return {
        success: false,
        message: '文章不存在'
      }
    }
  } catch(e) {
    console.error(e)
    return {
      success: false,
      message: '查询失败'
    }
  }
}
