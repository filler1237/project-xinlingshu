// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  // 从前端接收用户授权的基本信息
  const { nickName, avatarUrl, role } = event

  // 根据 openid 查询用户是否已存在
  const userRes = await db.collection('users').where({
    _openid: openid
  }).get()

  let userInfo;

  // 用户是否存在
  if (userRes.data.length === 0) {
    // --- 用户不存在，执行注册 ---
    console.log('用户不存在，执行注册');
    const addUserRes = await db.collection('users').add({
      data: {
        _openid: openid,
        nickName: nickName, // 使用前端传来的微信昵称
        avatarUrl: avatarUrl, // 使用前端传来的微信头像
        role: role || 'student', // 优先使用前端选择的角色，否则默认为学生
        createTime: db.serverDate(),
        // 初始化成长系统
        growthValue: 0,
        treeLevel: 1,
        waterDrops: 0, // 初始化水滴
        unlockedAchievements: [],
        isIdentityBound: false,
        // 初始化所有任务日期，避免后续查询出错
        lastSignInDate: 0,
        lastDiaryDate: 0,
        lastVentDate: 0,
        lastListenDate: 0,
        lastArticleDate: 0
      }
    })
    userInfo = (await db.collection('users').doc(addUserRes._id).get()).data;
  } else {
    // --- 用户已存在，直接返回用户信息 ---
    console.log('用户已存在，执行登录');
    userInfo = userRes.data[0];

    // (可选) 更新用户的角色字段，如果它不存在的话
    // 逻辑：如果数据库中没有 role 字段，则用本次登录选择的 role 更新它
    if (!userInfo.role && role) {
      const userId = userInfo._id;
      await db.collection('users').doc(userId).update({
        data: {
          role: role
        }
      });
      userInfo.role = role; // 更新内存中的 userInfo
    }
  }

  // 确保旧用户也有 isIdentityBound 字段，避免前端出错
  if (userInfo.isIdentityBound === undefined) {
    userInfo.isIdentityBound = false;
  }

  return {
    userInfo: userInfo
  }
}
