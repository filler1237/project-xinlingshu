// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  // 分页参数
  const page = event.page || 1;
  const pageSize = event.pageSize || 10;
  const skip = (page - 1) * pageSize;

  try {
    // 1. 聚合查询，获取文章列表和作者信息
    let articlesRes = await db.collection('articles').aggregate()
      .sort({ createTime: -1 })
      .skip(skip)
      .limit(pageSize)
      .lookup({
        from: 'users',
        localField: '_openid',
        foreignField: '_openid',
        as: 'authorInfo',
      })
      .end()

    let articles = articlesRes.list;

    // 2. 查询当前用户的所有点赞记录
    const userLikesRes = await db.collection('likes').where({
      _openid: openid
    }).get();
    
    const userLikedArticleIds = new Set(userLikesRes.data.map(like => like.articleId));

    // 3. 遍历文章列表，处理数据并添加 liked 状态
    articles = articles.map(item => {

      if (item.authorInfo && item.authorInfo.length > 0) {
        item.authorNickName = item.authorInfo[0].nickName;
        item.authorAvatarUrl = item.authorInfo[0].avatarUrl;
      } else {
        item.authorNickName = '匿名用户';
        item.authorAvatarUrl = 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/a.jpg'; // 确保路径正确
      }
      delete item.authorInfo;

      // 处理内容摘要
      if (item.content) {
        item.summary = item.content.substring(0, 50) + '...';
      } else {
        item.summary = '';
      }
      
      // 初始化计数字段
      item.likes = item.likes || 0;
      item.commentsCount = item.commentsCount || 0;

      // 添加点赞状态
      item.liked = userLikedArticleIds.has(item._id);

      return item;
    });

    return {
      data: articles,
      success: true
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: '获取文章列表失败'
    };
  }
}
