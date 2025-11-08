// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const { appointmentId } = event;
  const wxContext = cloud.getWXContext();

  try {
    const appointmentRes = await db.collection('Appointments').doc(appointmentId).get();
    const appointment = appointmentRes.data;

    if(appointment._openid !== wxContext.OPENID) {
      return {success: false,message:'无权限操作' };

    }

    // 删除预约记录
    await db.collection('Appointments').doc(appointmentId).remove();
    
    // 恢复集合中的时间段状态
    if(appointment.availabilityId && appointment.timeSlotIndex !== undefined) {
      await db.collection('Availability').doc(appointment.availabilityId).update({
        data: {
          [`timeSlots.${appointment.timeSlotIndex}.status`]: 'available',
        },
      });
    }

    return {
      success: true,
      message: '预约已取消'
    };

  } catch(e) {
    console.error(e);
    return {
      success: false,
      message: '预约取消失败，请重试'
    };
  }
};
