// cloud/passwordLogin/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { username, password, role } = event;

  console.log('--- passwordLogin 云函数 ---');
  console.log('接收到的参数 (event):', event);

  if (!username || !password || !role) {
    return {
      success: false,
      message: '缺少必要参数',
    };
  }

  try {
    // 根据用户名查询用户
    const userRes = await db.collection('users').where({
      username: username
    }).get();

    if (userRes.data.length === 0) {
      return {
        success: false,
        message: '用户不存在',
      };
    }

    const user = userRes.data[0];

    // 验证密码
    if (user.password !== password) {
      return {
        success: false,
        message: '密码错误',
      };
    }

    // 密码正确，更新角色并返回用户信息
    await db.collection('users').doc(user._id).update({
      data: {
        role: role
      }
    });

    // 获取更新后的用户信息
    const updatedUserRes = await db.collection('users').doc(user._id).get();

    return {
      success: true,
      message: '登录成功',
      userInfo: updatedUserRes.data,
    };

  } catch (e) {
    console.error('登录异常', e);
    return {
      success: false,
      message: '登录异常，请稍后再试',
    };
  }
};
