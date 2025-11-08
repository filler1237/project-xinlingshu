const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const debugInfo = {}; // 初始化调试信息对象

  // 以管理员权限操作数据库
  const dbAdmin = cloud.database({
    config: {
      env: cloud.DYNAMIC_CURRENT_ENV
    }
  });
  const wxContext = cloud.getWXContext();
  const { appointmentId } = event;
  debugInfo.传入的预约ID = appointmentId;

  if (!appointmentId) {
    return {
      success: false,
      message: '无效的预约ID',
      debug: debugInfo
    };
  }

  try {
    // 1. 查找预约记录
    debugInfo.步骤1_查找预约 = `在 Appointments 表中查找 _id 为 ${appointmentId} 的记录`;
    const appointmentRes = await dbAdmin.collection('Appointments').doc(appointmentId).get();
    const appointment = appointmentRes.data;
    debugInfo.步骤1_结果 = appointment ? '找到记录' : '未找到记录';

    if (!appointment) {
      return {
        success: false,
        message: '未找到该预约记录',
        debug: debugInfo
      };
    }

    // 2. 检查预约状态
    debugInfo.步骤2_检查状态 = `记录状态为: ${appointment.status}`;
    if (appointment.status === 'used') {
      return {
        success: false,
        message: '该预约码已被使用',
        debug: debugInfo
      };
    }

    // 3. 更新预约状态为已使用
    debugInfo.步骤3_更新状态 = '将 status 更新为 used';
    await dbAdmin.collection('Appointments').doc(appointmentId).update({
      data: {
        status: 'used',
        scannedBy: wxContext.OPENID, // 记录是被哪个管理员核销的
        scannedAt: new Date()
      }
    });
    debugInfo.步骤3_结果 = '更新成功';

    // 4. 查找学生信息
    // 从预约记录中获取学生的 _openid
    const studentOpenid = appointment._openid;
    debugInfo.步骤4_获取学生OpenID = `从预约记录的 _openid 字段获取到值为: ${studentOpenid}`;
    if (!studentOpenid) {
      return {
        success: true,
        studentName: '未知',
        studentId: '未知',
        message: '核销成功，但预约记录中未包含学生OpenID',
        debug: debugInfo
      };
    }

    // 使用学生的 openid 去 users 集合中查找对应的用户记录
    debugInfo.步骤4_查找学生 = `在 users 表中查找 _openid 为 ${studentOpenid} 的记录`;
    const userRes = await dbAdmin.collection('users').where({
      _openid: studentOpenid
    }).limit(1).get();
    debugInfo.步骤4_结果 = userRes.data.length > 0 ? '找到学生' : '未找到学生';

    let studentName = '未知';
    let studentId = '未知';
    let college = '未知';
    let major = '未知';
    let phoneNumber = '未知';

    if (userRes.data.length > 0) {
      const studentInfo = userRes.data[0];
      studentName = studentInfo.realName || studentInfo.nickName; // 优先使用 realName
      studentId = studentInfo.studentId || '未绑定'; // 获取学号
      college = studentInfo.college || '未提供';
      major = studentInfo.major || '未提供';
      phoneNumber = studentInfo.phoneNumber || '未提供';
      debugInfo.获取的学生信息 = { 
        realName: studentInfo.realName, 
        nickName: studentInfo.nickName, 
        studentId: studentInfo.studentId,
        college: studentInfo.college,
        major: studentInfo.major,
        phoneNumber: studentInfo.phoneNumber
      };
    }

    // 5. 返回成功信息
    return {
      success: true,
      studentName: studentName,
      studentId: studentId,
      college: college,
      major: major,
      phoneNumber: phoneNumber,
      debug: debugInfo
    };

  } catch (error) {
    console.error('核销失败', error);
    debugInfo.全局错误 = error.message;
    return {
      success: false,
      message: '数据库操作失败，请稍后重试',
      debug: debugInfo
    };
  }
};
