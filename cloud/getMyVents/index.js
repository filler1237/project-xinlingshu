// 云函数：getMyVents
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const result = await db.collection('vents')
      .where({
        _openid: openid,
      })
      .orderBy('createdAt', 'desc') // 按创建时间倒序
      .get();

    return {
      code: 0,
      data: result.data,
    };
  } catch (e) {
    console.error(e);
    return {
      code: 500,
      message: '数据库操作失败',
      error: e,
    };
  }
};
