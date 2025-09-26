// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db=cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try{
    const userRes=await db.collection('users').where({
      _openid: wxContext.OPENID
    }).get()
    if (userRes.data.length===0)
    {
      console.log('未找到用户, openid:', wxContext.OPENID)
      return {code:-1,msg:'用户不存在'}
    }
    const user=userRes.data[0]
    console.log('查询到的用户信息:', user)

    // 查询徽章成就
    const achievementsRes=await db.collection('achievements').where({
      _id:db.command.in(user.unlockedAchievements || [])
    }).get()
  return {
    code:0,
    data:{
      growthValue:user.growthValue,
      treeLevel:user.treeLevel,
      unlockedAchievements:achievementsRes.data
    }
  }
} catch(e){
  console.error(e)
  return { code : -1,msg:'查询失败',error: e}
 }
}
