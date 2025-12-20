const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const db = cloud.database();

  const users = [
    { _id: 'test-admin-01', username: 'admin01', password: '123456', role: 'admin', nickName: '测试管理员' },
    { _id: 'test-judge-01', username: 'judge01', password: '123456', role: 'judge', nickName: '测试评委' },
    { _id: 'test-admin-wangzhenzhen', username: 'wangzhenzhen', password: '123456', role: 'admin', nickName: '王贞贞' },
    { _id: 'test-admin-yaoshuangyan', username: 'yaoshuangyan', password: '123456', role: 'admin', nickName: '姚双雁' },
    { _id: 'test-admin-liyalin', username: 'liyaling', password: '123456', role: 'admin', nickName: '李亚玲' }
  ];

  try {
    for (const user of users) {
      await db.collection('users').doc(user._id).set({ data: user });
    }
    return { success: true, message: 'Users added successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};