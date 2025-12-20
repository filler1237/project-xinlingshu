// cloud/passwordLogin/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { username, password, role } = event

  if (!username || !password || !role) {
    return {
      success: false,
      message: '缺少必要参数'
    }
  }

  try {
    // 关键点：username + password + role 一起查
    const userRes = await db.collection('users').where({
      username,
      password,
      role
    }).get()

    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '账号 / 密码 / 身份不正确'
      }
    }

    const user = userRes.data[0]

    // 登录成功，不改数据库，只返回必要信息
    return {
      success: true,
      message: '登录成功',
      userInfo: {
        _id: user._id,
        username: user.username,
        role: user.role,
        nickName: user.nickName
      }
    }

  } catch (err) {
    console.error('passwordLogin error:', err)
    return {
      success: false,
      message: '服务器异常'
    }
  }
}
