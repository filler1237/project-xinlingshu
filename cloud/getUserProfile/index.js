// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const { userId } = event

  if(!userId) {
    return {
      success: false,
      message: '缺少用户ID'
    }
  }

  try{
    // 查询用户信息
    const userRes = await db.collection('users').where({
      _openid: userId
    }).limit(1).get()

    if(userRes.data.length === 0) {
      return {
        success: false,
        message: '未找到该用户'
      }
    }
    const userInfo = userRes.data[0]

    // 查询用户发布过的文章
    const articlesRes = await db.collection('articles').where({
      _openid:userId
    })
    .orderBy('createTime','desc').get()

    // 组合数据并返回
    return {
      success: true,
      data:{
        userInfo: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          // 后续可添加其他需要展示的信息
        },
        articles: articlesRes.data
      }
    }
  } catch(e) {
    console.error(e)
    return {
      success: false,
      message: '获取用户主页信息失败'
    }
  }
}