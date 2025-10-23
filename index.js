// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  // 在前端接收用户授权的基本信息和身份选择
  const { nickName, avatarUrl, identity = 'student' } = event

  console.log("=== loginRegister 云函数开始执行 ===");
  console.log("接收到的身份参数:", identity);
  console.log("用户openid:", openid);

  // 验证身份参数
  const validIdentities = ['student', 'admin', 'judge']
  const userIdentity = validIdentities.includes(identity) ? identity : 'student'
  
  console.log("最终使用的身份:", userIdentity);

  try {
    // 根据openid查询用户是否已存在
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get()

    let userInfo;

    // 用户是否存在
    if (userRes.data.length === 0) {
      console.log('用户不存在，执行注册，身份为:', userIdentity);
      const addUserRes = await db.collection('users').add({
        data: {
          _openid: openid,
          nickName: nickName,
          avatarUrl: avatarUrl,
          identity: userIdentity, // 确保保存身份字段
          createTime: db.serverDate(),
          // 初始化成长系统
          growthValue: 0,
          treeLevel: 1,
          unlockedAchievements: [],
          isIdentityBound: false
        }
      })
      userInfo = (await db.collection('users').doc(addUserRes._id).get()).data;
      console.log("新用户注册成功:", userInfo);
    } else {
      console.log('用户已存在，执行登录');
      const userId = userRes.data[0]._id;
      const existingUser = userRes.data[0];
      
      console.log("现有用户数据:", existingUser);
      
      // 构建更新数据
      const updateData = {
        nickName: nickName,
        avatarUrl: avatarUrl,
        lastLoginTime: db.serverDate()
      };
      
      // 如果用户之前没有身份字段，或者需要更新身份，则添加身份字段
      if (!existingUser.identity || existingUser.identity !== userIdentity) {
        updateData.identity = userIdentity;
        console.log("更新用户身份为:", userIdentity);
      }
      
      await db.collection('users').doc(userId).update({
        data: updateData
      });
      
      userInfo = (await db.collection('users').doc(userId).get()).data;
      console.log("更新后的用户信息:", userInfo);

      // 确保必要的字段存在
      if (userInfo.isIdentityBound === undefined) {
        userInfo.isIdentityBound = false;
      }
      
      // 确保identity字段存在
      if (!userInfo.identity) {
        userInfo.identity = userIdentity;
        console.log("为用户添加默认身份字段:", userIdentity);
      }
    }
    
    console.log("最终返回的用户信息:", userInfo);
    return {
      userInfo: userInfo
    }
  } catch (err) {
    console.error("云函数执行错误:", err);
    return {
      error: err.message
    }
  }
}