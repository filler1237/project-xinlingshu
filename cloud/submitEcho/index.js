// 云函数：submitEcho
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const { ventId, echo } = event;

  if (!ventId || !echo || echo.trim() === '') {
    return {
      code: 1,
      success: false,
      message: '参数不完整或回应内容为空',
    };
  }
  try {

    const now = new Date();
    const localDate = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const startOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
    const endOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate() + 1);

    const countResult = await db.collection('vents').where({
      echoer_openid: openid,
      repliedAt: _.gte(startOfDay).and(_.lt(endOfDay))
    }).count();
    if (countResult.total >= 5) {
      return {
        code: 102,
        message: '今天回应已经达到5次了，明天再来吧',
      }
    }
    // 更新指定的烦恼记录
    const result = await db.collection('vents').doc(ventId).update({
      data: {
        echo: echo,
        echoer_openid: openid,
        repliedAt: new Date(),
      },
    });

    if (result.stats.updated === 1) {
      // 3. 发送通知逻辑
      try {
        const ventRes = await db.collection('vents').doc(ventId).get();
        if (ventRes.data) {
          const receiverOpenId = ventRes.data._openid;
          // 这里的烦恼作者可能是匿名发布的吗？如果是匿名发布的，可能没有 _openid 吗？
          // 假设所有记录入库都有 _openid
          if (receiverOpenId && receiverOpenId !== openid) {
            await db.collection('notifications').add({
              data: {
                receiverOpenId: receiverOpenId,
                senderOpenId: openid,
                type: 'treehole_reply',
                relatedId: ventId,
                content: echo,
                isRead: false,
                createTime: new Date()
              }
            });
          }
        }
      } catch (notifyErr) {
        console.error('树洞回复通知发送失败', notifyErr);
      }

      return {
        code: 0,
        message: '回应成功',
      };
    } else {
      return {
        code: 2,
        message: '未找到需要回应的记录',
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
