// 云函数：submitVent
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const { content } = event;

  if (!content || content.trim() === '') {
    return {
      code: 1,
      message: '内容不能为空',
    };
  }

  try {
    await db.collection('vents').add({
      data: {
        _openid: openid,
        content: content,
        createdAt: new Date(),
        status: 'pending', // pending: 待回应, replied: 已回应
        echo: null,
        echoer_openid: null,
        repliedAt: null,
      },
    });

    return {
      code: 0,
      message: '提交成功',
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
