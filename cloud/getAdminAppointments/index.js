// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const myOpenId = wxContext.OPENID
  const now = new Date()


  try {

    // 筛选日期 >= 今天 (简单字符串比较 yyyy-mm-dd)
    const todayStr = now.toISOString().split('T')[0]

    // 1. 获取当前用户信息，检查是否有 teacherId 绑定
    const { username } = event;
    console.log('--- Step 1: Matching User ---');
    console.log('Caller OpenID:', myOpenId);
    console.log('Caller Username:', username);

    let userQueryCondition = {};
    if (username) {
      // 如果前端传了 username，优先用 username 查 (解决管理员没有 openid 的问题)
      userQueryCondition = { username: username };
    } else {
      // 否则回退到用 OpenID 查
      userQueryCondition = { _openid: myOpenId };
    }

    const userRes = await db.collection('users').where(userQueryCondition).get();

    console.log('DB User Search Result:', JSON.stringify(userRes.data));

    let filterTeacherId = null;
    if (userRes.data.length > 0) {
      const userInfo = userRes.data[0];
      console.log('User Found. teacherId field:', userInfo.teacherId);

      // 如果用户有 teacherId 字段 (0, 1, 2...)，则只显示该老师的预约
      if (userInfo.teacherId !== undefined && userInfo.teacherId !== null) {
        filterTeacherId = userInfo.teacherId;
      }
    } else {
      console.log('WARNING: No user record found matching condition:', JSON.stringify(userQueryCondition));
    }

    console.log('--- Step 2: Final Filter Decision ---');
    console.log('Teacher ID determined:', filterTeacherId);

    // 2. 构建查询条件
    const query = {
      date: _.gte(todayStr),
      complete: _.neq("已取消")
    };

    // 如果识别到了特定的老师身份，加上筛选条件
    if (filterTeacherId !== null && filterTeacherId !== undefined) {
      // 关键修正：数据库里的 Appointments.teacherId 可能是数字也可能是字符串
      // 为了保险，我们同时匹配这两种情况
      query.teacherId = _.in([filterTeacherId, String(filterTeacherId)]);
    } else {
      // 安全机制（Fail-Closed）：如果无法识别当前用户的老师身份（没找到记录或没绑定teacherId）
      // 则直接返回空列表，而不是显示所有人的数据。这能防止隐私泄露。
      console.log('Access Denied: No teacherId found for current user.', myOpenId);
      return {
        success: true,
        data: [],
        total: 0,
        message: '未绑定教师身份，无权查看预约'
      };
    }

    const res = await db.collection('Appointments')
      .where(query)
      .orderBy('date', 'asc')
      .orderBy('startTime', 'asc')
      .limit(100)
      .get()

    console.log('Admin查询预约结果:', res.data);

    // 3. 数据后处理：判断是否过期，格式化
    const appointments = res.data.map((appointment) => {
      const appointmentTimestamp = new Date(appointment.date + ' ' + appointment.endTime).getTime()

      // 动态计算状态：如果时间已过，视为已过期/已结束
      // 注意：这里只是显示逻辑，不通过此接口写数据库（避免频繁写），写操作由定时任务或触发器完成更佳
      // 但为了显示一致性，这里返回 computedStatus

      let computedStatus = appointment.complete;
      if (computedStatus === '进行中' && appointmentTimestamp < now.getTime()) {
        computedStatus = '已结束';
      }

      return {
        ...appointment,
        status: computedStatus,
        isExpired: appointmentTimestamp < now.getTime()
      }
    });

    // 4. 再次过滤，如果只想看“新预约”（未来的），可以过滤掉已结束的
    // 根据需求："可以看到学生预约的各种信息...各种时间的排版"，通常管理员也需要看刚刚过去的，
    // 但重点是未来的。我们返回全量让前端分类，或者只返回未来的。
    // 需求中提到 "有新学生预约"，通常暗示未处理的/未来的。
    const validAppointments = appointments.filter(app => app.status === '进行中' && !app.isExpired);

    return {
      success: true,
      data: validAppointments,
      total: validAppointments.length
    }

  } catch (err) {
    console.error('获取管理员预约列表失败', err)
    return {
      success: false,
      data: [],
      error: err
    }
  }
}