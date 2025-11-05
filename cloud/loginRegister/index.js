// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

// 将云函数统一为一个入口main
exports.main=async(event,context)=>{
  const wxContext=cloud.getWXContext()
  const openid=wxContext.OPENID

  // 在前端接收用户授权的基本信息
  const{nickName,avatarUrl,role}=event

  // 根据openid查询用户是否已存在
  const userRes=await db.collection('users').where({
    _openid:openid
  }).get()

  let userInfo;

  // 用户是否存在
  if(userRes.data.length===0){
    console.log('用户不存在，执行注册');
    const addUserRes=await db.collection('users').add({
      data:{
        _openid:openid,
        nickName:nickName,
        avatarUrl:avatarUrl,
        role:role,
        createTime:db.serverDate(),
        // 初始化成长系统
        growthValue:0,
        treeLevel:1,
        unlockedAchievements:[],
        isIdentityBound: false
      }
    })
    userInfo=(await db.collection('users').doc(addUserRes._id).get()).data;
  } else{
    console.log('用户已存在，执行登陆');
    const userId=userRes.data[0]._id;
    await db.collection('users').doc(userId).update({
      data:{
        nickName:nickName,
        avatarUrl:avatarUrl,
        role:role
      }
    })
    userInfo = (await db.collection('users').doc(userId).get()).data;

    if(userInfo.isIdentityBound === undefined) {
      userInfo.isIdentityBound = false;
    }
  }
  return {
    userInfo:userInfo
  }
}
