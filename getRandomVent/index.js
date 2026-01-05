// 云函数：getRandomVent
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 使用聚合操作随机获取一条不属于当前用户且待回应的烦恼
    const result = await db.collection('vents').aggregate()
      .match({
        status: 'pending',
        _openid: _.neq(openid) // 确保不是自己的烦恼
      })
      .sample({
        size: 1
      })
      .end();

    if (result.list.length > 0) {
      return {
        code: 0,
        data: result.list[0],
      };
    } else {
      return {
        code: 2,
        message: '暂时没有需要回应的烦恼',
        data: null,
      };
    }
  } catch (e) {
    console.error(e);
    return {
      code: 500,
      message: '数据库操作失败',
      error: e,
    };
  }
};
