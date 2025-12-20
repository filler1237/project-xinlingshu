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
    const articlesPromise = db.collection('articles').aggregate()
      .sort({ createTime: -1 })
      .skip(skip)
      .limit(pageSize)
      .lookup({
        from: 'users',
        localField: '_openid',
        foreignField: '_openid',
        as: 'authorInfo',
      })
      .lookup({
        from: 'comments',
        localField: '_id',
        foreignField: 'articleId',
        as: 'comments',
      })
      .end();

    // 同时查询 drawings 集合
    const drawingsPromise = db.collection('drawings').aggregate()
      .sort({ createTime: -1 })
      .skip(skip)
      .limit(pageSize)
      .lookup({
        from: 'users',
        localField: '_openid', // 使用系统自动记录的 _openid 字段
        foreignField: '_openid',
        as: 'authorInfo',
      })
      .lookup({
        from: 'comments', // 假设画作的评论也存在 aomments 集合
        localField: '_id',
        foreignField: 'articleId', // 假设画作评论也用 articleId
        as: 'comments',
      })
      .end();

    const [articlesRes, drawingsRes] = await Promise.all([articlesPromise, drawingsPromise]);

    let articles = articlesRes.list;
    let drawings = drawingsRes.list;

    // 将 drawings 数据转换为 articles 相似的结构
    drawings = drawings.map(item => ({
      ...item,
      content: item.description, // 使用 description 作为 content
      // drawings 特有的字段
      isDrawing: true,
      imageUrl: item.fileID,
      collectionName: 'drawings'
    }));

    articles = articles.map(item => ({
      ...item,
      collectionName: 'articles'
    }));

    // 合并两个数据源并排序
    let combinedList = [...articles, ...drawings];

    // 健壮的日期排序：处理不同格式的 createTime
    combinedList.sort((a, b) => {
      const getTimestamp = (item) => {
        if (!item.createTime) return 0;
        // 如果是 Date 对象，直接获取时间戳
        if (item.createTime instanceof Date) {
          return item.createTime.getTime();
        }
        // 如果有 $date 属性（云数据库服务器日期格式）
        if (item.createTime.$date) {
          return new Date(item.createTime.$date).getTime();
        }
        // 尝试解析为日期
        const date = new Date(item.createTime);
        return isNaN(date.getTime()) ? 0 : date.getTime();
      };
      return getTimestamp(b) - getTimestamp(a);
    });

    // 如果需要分页，合并后可能需要截取
    // 为了简单起见，这里假设两个源各取 pageSize 然后合并，前端需要能处理重复数据
    // 一个更优的方案是在数据库层面做 union，但小程序云数据库不支持
    // 所以我们取了数据后再合并排序
    articles = combinedList.slice(0, pageSize);

    // 2. 查询当前用户的所有点赞记录 (增加limit防止数据量大时查不全)
    const userLikesRes = await db.collection('likes').where({
      _openid: openid
    }).limit(1000).get();

    // 注意：dianzan云函数存的是 articlesId，不是 articleId
    const userLikedKeys = new Set(userLikesRes.data.map(like => `${like.articlesId}_${like.collectionName}`));

    // 3. 遍历合并后的列表，处理数据并添加 liked 状态
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
      item.commentsCount = item.comments ? item.comments.length : 0;

      // 添加点赞状态
      item.liked = userLikedKeys.has(`${item._id}_${item.collectionName}`);

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
