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

  if (!articleId || !content) {
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
        parentId: event.parentId || null, // 父评论ID
        replyToUserId: event.replyToUserId || null, // 被回复人ID
        replyToUserName: event.replyToUserName || null, // 被回复人昵称
        createTime: new Date()
      }
    })

    // 更新article中的commentCount字段
    await db.collection('articles').doc(articleId).update({
      data: {
        commentCount: _.inc(1)
      }
    })

    // 3. 发送通知逻辑
    let receiverOpenId = null;
    let type = '';

    // 情况A：回复某人
    if (event.replyToUserId) {
      receiverOpenId = event.replyToUserId;
      type = 'community_reply';
    }
    // 情况B：评论文章（获取不到直接的 receiverOpenId，需要查文章作者）
    else {
      // 这里的逻辑稍微有点复杂，因为 event 里没有文章作者 ID
      // 为了通知文章作者，我们需要查库
      try {
        const articleRes = await db.collection('articles').doc(articleId).get();
        if (articleRes.data) {
          receiverOpenId = articleRes.data._openid;
          type = 'community_comment';
        }
      } catch (err) {
        console.error('获取文章作者失败，无法发送通知', err);
      }
    }

    // 执行发送通知（非自己给自己）
    if (receiverOpenId && receiverOpenId !== openid) {
      try {
        await db.collection('notifications').add({
          data: {
            receiverOpenId: receiverOpenId,
            senderOpenId: openid,
            type: type, // 'community_reply' or 'community_comment'
            relatedId: articleId, // 关联的文章ID
            content: content,
            isRead: false,
            createTime: new Date()
          }
        });
      } catch (notifyErr) {
        console.error('发送通知失败', notifyErr);
      }
    }

    return {
      success: true,
      message: '评论成功'
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: '评论失败'
    }
  }
}
