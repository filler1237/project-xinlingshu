// cloud/createArticle/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { title, content } = event

  try {
    const addRes =await db.collection('articles').add({
      data: {
        _openid: wxContext.OPENID, // 记录创建者的openid
        title: title,
        content: content,
        createTime: db.serverDate() // 记录服务器时间
      }
    })
    await cloud.callFunction({
      name:'grantGrowth',
      data:{
        _openId:wxContext.OPENID,
        growthAmount:10
      }
    })
    return {
      success:true,
      data:addRes
    }
  } catch (e) {
    console.error(e)
    return{
      success:false,
      error:e.message
    }
  }
}
