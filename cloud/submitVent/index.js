// 云函数：submitVent (带调试信息)
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { content } = event;

  // --- 调试日志 1: 打印基础信息 ---
  console.log('--- submitVent 开始执行 ---');
  console.log('用户 OPENID:', openid);
  console.log('提交内容:', content);

  if (!content || content.trim() === '') {
    return {
      code: 400,
      message: '内容不能为空',
    };
  }

  try {
    
    // --- 检查当日发布次数的逻辑 ---
    const now = new Date();
    // 确保时区正确，云函数默认是 UTC+0，我们需要转换为 UTC+8
    const localDate = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    
    const startOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
    const endOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate() + 1);
    
    // 将查询时间转换回 UTC 标准时间
    const startOfDayUTC = new Date(startOfDay.getTime() - (8 * 60 * 60 * 1000));
    const endOfDayUTC = new Date(endOfDay.getTime() - (8 * 60 * 60 * 1000));


    // --- 调试日志 2: 打印时间范围 ---
    console.log('检查时间范围 (startOfDay UTC):', startOfDayUTC.toISOString());
    console.log('检查时间范围 (endOfDay UTC):', endOfDayUTC.toISOString());
    
    const countResult = await db.collection('vents').where({
      _openid: openid,
      createdAt: _.gte(startOfDayUTC).and(_.lt(endOfDayUTC))
    }).count();

    // --- 调试日志 3: 打印查询到的数量 ---
    console.log('查询到今日已发布数量:', countResult.total);

    if (countResult.total >= 5) {
      // --- 调试日志 4: 记录已达到上限 ---
      console.log('已达到上限 (>=5)，准备返回限制信息。');
      return {
        code: 101, // 自定义错误码：达到上限
        message: '今天已经倾诉5次了，明天再来吧',
      };
    }
    
    // --- 调试日志 5: 记录允许发布 ---
    console.log('未达到上限 (<5)，准备写入数据库。');

    await db.collection('vents').add({
      data: {
        _openid: openid,
        content: content,
        createdAt: new Date(), // 存储的是标准的 UTC 时间
        status: 'reviewing',
        reviewComment: '',
        echo: null,
        echoer_openid: null,
        repliedAt: null,
      },
    });
    
    console.log('--- 数据库写入成功 ---');

    return {
      success: true,
      code: 200,
      message: '提交成功, 内容正在审核中',
    };
  } catch (e) {

    console.error('!!! 函数执行出错 !!!', e);
    return {
      code: 500,
      message: '服务器开小差了，请稍后再试',
      error: e.message,
    };
  }
};
