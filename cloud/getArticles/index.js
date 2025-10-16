// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let articlesRes = await db.collection('articles').aggregate()
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

    let articles = articlesRes.list.map(item=>{
      if(item.authorInfo && item.authorInfo.length > 0) {
        item.authorNickName = item.authorInfo[0].nickName;
        item.authorAvatarUrl = item.authorInfo[0].avatarUrl;

      }
      else {
        item.authorNickName='匿名用户';
        item.authorAvatarUrl='\image\a.jpg';
      }
      delete item.authorInfo;

      //创造内容摘要
      if(item.content) {
        item.summary = item.content.substring(0,10) + '...';

      }
      else {
        item.summary='';
      }
      item.likes = item.likes || 0;
      item.commentsCount = item.commentsCount || 0;
      
      return item;
    });

    return {
      data: articles,
      success: true
    };
  }
  catch(e) {
    console.error(e);
    return {
      success: false,
      message: '获取文章列表失败'
    };
  }
}
