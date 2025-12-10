// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { id } = event

  try {
    let collectionName = 'articles';
    let res = await db.collection(collectionName).aggregate()
      .match({
        _id: id
      })
      .lookup({
        from: 'users',
        localField: '_openid',
        foreignField: '_openid',
        as: 'authorInfo',
      }).end();

    // 如果在 articles 集合中没找到，就去 drawings 集合中找
    if (res.list.length === 0) {
      collectionName = 'drawings';
      res = await db.collection(collectionName).aggregate()
        .match({
          _id: id
        })
        .lookup({
          from: 'users',
          localField: '_openid',
          foreignField: '_openid',
          as: 'authorInfo',
        }).end();
    }

    if (res.list.length > 0) {
      const item = res.list[0];

      // 数据结构转换
      if (collectionName === 'drawings') {
        item.title = '画作分享'; // 画作可能没有标题，给一个默认的
        item.content = item.description;
        item.isDrawing = true;
        item.imageUrl = item.fileID;
      }

      if (item.authorInfo && item.authorInfo.length > 0) {
        item.authorNickname = item.authorInfo[0].nickName;
        item.authorAvatarUrl = item.authorInfo[0].avatarUrl;
      }
      delete item.authorInfo;

      // 查询当前用户是否点赞
      const wxContext = cloud.getWXContext();
      const openid = wxContext.OPENID;

      const likeRecord = await db.collection('likes').where({
        _openid: openid,
        articlesId: id,
        collectionName: collectionName // 精确匹配集合名
      }).count();

      item.liked = likeRecord.total > 0;

      return {
        success: true,
        data: item
      }
    } else {
      return {
        success: false,
        message: '内容不存在'
      }
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: '查询失败'
    }
  }
}
