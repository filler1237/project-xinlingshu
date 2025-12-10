// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('event:', event);
  const wxContext = cloud.getWXContext()
  const { articleId, collectionName } = event
  const openid = wxContext.OPENID

  if (!articleId) {
    return {
      success: false,
      message: '缺少文章ID'
    }
  }
  if (!collectionName || (collectionName !== 'articles' && collectionName !== 'drawings')) {
    return {
      success: false,
      message: '缺少或错误的集合名称'
    }
  }
  try {
    // 检查用户是否点赞
    const targetCollection = db.collection(collectionName)

    const likeRecord = await db.collection('likes').where({
      _openid: openid,
      articlesId: articleId,
      collectionName: collectionName
    }).get()

    console.log('记录有：', likeRecord.data)

    let liked = false;
    // 取消点赞
    if (likeRecord.data.length > 0) {
      await db.collection('likes').doc(likeRecord.data[0]._id).remove();
      await targetCollection.doc(articleId).update({
        data: {
          likes: _.inc(-1)
        }
      });
      liked = false;
    } else {
      // 添加点赞
      await db.collection('likes').add({
        data: {
          _openid: openid,
          articlesId: articleId,
          collectionName: collectionName,
          createTime: new Date()
        }
      });
      await targetCollection.doc(articleId).update({
        data: {
          likes: _.inc(1)
        }
      });
      liked = true;
    }

    // 返回最新的点赞数
    const article = await targetCollection.doc(articleId).field({ likes: true }).get();

    // 3. 发送通知逻辑（仅点赞时，取消赞不通知）
    if (liked) {
      try {
        // 由于上面只查了likes字段，这里需要重新查或者优化逻辑。
        // 为了方便，简单再查一次，或者其实上面 update 之前可以先查作者。
        // 这里选择追加查询作者ID
        const articleInfo = await targetCollection.doc(articleId).get();
        if (articleInfo.data) {
          const receiverOpenId = articleInfo.data._openid;
          // 自己给自己点赞不通知
          if (receiverOpenId && receiverOpenId !== openid) {
            await db.collection('notifications').add({
              data: {
                receiverOpenId: receiverOpenId,
                senderOpenId: openid,
                type: 'community_like',
                relatedId: articleId,
                content: '赞了你的帖子',
                isRead: false,
                createTime: new Date()
              }
            });
          }
        }
      } catch (notifyErr) {
        console.error('点赞通知发送失败', notifyErr);
      }
    }

    return {
      success: true,
      likes: article.data.likes,
      liked: liked
    }

  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: '点赞失败'
    }
  }
}