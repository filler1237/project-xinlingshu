// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {articleId} = event
  const openid = wxContext.OPENID

  if(!articleId) {
    return {
      success: false,
      message: '缺少文章ID'
    }
  }
  try {
    // 检查用户是否点赞
    const likeRecord = await db.collection('likes').where ({
      _openid: openid,
      articlesId: articleId
    }).get()

    console.log('记录有：',likeRecord.data)

    let liked = false;
    // 取消点赞
    if(likeRecord.data.length > 0) {
      await db.collection('likes').doc(likeRecord.data[0]._id).remove();
      await db.collection('articles').doc(articleId).update ({
        data: {
          likes: _.inc(-1)
        }
      });
      liked = false;
    } else {
      // 添加点赞
      await db.collection('likes').add({
        data: {
          _openid:openid,
          articlesId:articleId,
          createTime:new Date()
        }
      });
      await db.collection('articles').doc(articleId).update({
        data: {
          likes:_.inc(1)
        }
      });
      liked=true;
    }

    // 返回最新的点赞数
    const article = await db.collection('articles').doc(articleId).field({ likes: true }).get();
    return {
      success: true,
      likes: article.data.likes,
      liked: liked
    }
    
  } catch(e) {
    console.error(e)
    return {
      success: false,
      message:'点赞失败'
    }
  }  
}