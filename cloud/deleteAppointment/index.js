// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { appointmentId } = event

  console.log('--- 云函数 deleteAppointment 入口 ---');
  console.log('传入参数 event:', event);
  console.log('调用者 OPENID:', wxContext.OPENID);

  if (!appointmentId) {
    console.error('错误：appointmentId 为空');
    return {
      success: false,
      message: '缺少预约ID',
    }
  }

  try {
    const query = {
      _id: appointmentId,
      _openid: wxContext.OPENID, // 权限控制，确保是本人操作
    };
    console.log('数据库查询条件 query:', query);

    // 只有创建者才能删除自己的预约记录
    const result = await db.collection('Appointments').where(query).remove()

    console.log('数据库 remove 操作返回结果:', result);

    if (result.stats.removed > 0) {
      console.log('成功：删除了', result.stats.removed, '条记录');
      return {
        success: true,
        message: '删除成功',
      }
    } else {
      console.warn('警告：没有记录被删除，可能记录不存在或 OPENID 不匹配');
      return {
        success: false,
        message: '记录不存在或无权限删除',
      }
    }
  } catch (e) {
    console.error('数据库操作异常 catch:', e)
    return {
      success: false,
      message: '数据库操作失败',
      error: e,
    }
  }
}
