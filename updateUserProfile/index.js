// cloud/updateUserProfile/index.js
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const usersCollection = db.collection('users');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const { isBindingIdentity, identityInfo, nickName, avatarUrl } = event;
    
    let updateData = {};
    let hasDataToUpdate = false; // 新增一个标志位

    if (isBindingIdentity) {
      // --- 处理身份绑定 ---
      if (!identityInfo || !identityInfo.realName || !identityInfo.studentId) {
        return { success: false, message: '身份信息不完整' };
      }
      updateData = { ...identityInfo, isIdentityBound: true };
      hasDataToUpdate = true;
    } else {
      // --- 处理个人信息更新 ---
      if (nickName) {
        updateData.nickName = nickName;
        hasDataToUpdate = true;
      }
      if (avatarUrl) {
        updateData.avatarUrl = avatarUrl;
        hasDataToUpdate = true;
      }
    }

    // 如果没有任何需要更新的字段，直接返回成功
    if (!hasDataToUpdate) {
        return { success: true, message: '没有需要更新的数据' };
    }

    // 统一添加时间戳
    updateData.updatedAt = new Date();

    // 先查找用户是否存在
    const userQuery = await usersCollection.where({ _openid: openid }).get();

    if (userQuery.data.length === 0) {
      return { success: false, message: '未找到对应的用户' };
    }

    // 执行更新操作
    await usersCollection.where({
      _openid: openid
    }).update({
      data: updateData
    });

    // 只要前面的步骤没有抛出错误，就认为操作成功
    return { success: true, message: '更新成功' };

  } catch (error) {
    console.error('Update user profile failed:', error);
    return {
      success: false,
      message: '更新失败，请查看云函数日志',
      error: error.message
    };
  }
};
