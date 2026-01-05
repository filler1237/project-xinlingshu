// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { articleId } = event
  if(!articleId) {
    return {
      success: false,
      message: '缺少文章ID'
    }
  }

  try {
    const res = await db.collection('comments').aggregate()
    // 筛选指定文章的评论
    .match({
      articleId:articleId
    })
    // 时间排序
    .sort({
      createTime: -1
    })

    .lookup({
      from:'users',
      localField:'_openid',
      foreignField:'_openid',
      as:'authorInfo',
    })
    .end()
    // 处理返回的数据，将用户信息平铺到每个评论对象上
    const comments = res.list.map(comment => {
      if (comment.authorInfo && comment.authorInfo.length > 0) {
        comment.authorNickName = comment.authorInfo[0].nickName;
        comment.authorAvatarUrl = comment.authorInfo[0].avatarUrl;
      } else {
        comment.authorNickName = '匿名用户';
        comment.authorAvatarUrl = '/assets/默认头像.jpeg'; // 默认头像路径
      }
      delete comment.authorInfo; // 删除不再需要的 authorInfo 数组
      return comment;
    });

    return {
      success: true,
      data: comments
    }
  } catch(e) {
    console.error(e)
    return {
      success: false,
      message: '获取评论失败'
    }
  }
}