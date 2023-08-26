// 云函数 createAppointment
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

exports.main = async (event, context) => {
  const db = cloud.database()

  // 从 event 中获取需要的字段
  const { teacherId, openid, date, startTime, endTime, availabilityId, timeSlotIndex, status, detail, teacher } = event

  try {
    // 添加预约信息到 appointment 集合中
    const result = await db.collection('Appointments').add({
      data: {
        teacherId,
        openid,
        date,
        startTime,
        endTime,
        createTime: new Date(),
        detail,
        teacher,
        complete:"进行中",
        evaluate:"0",
        score:"0",
        feedback:"",
      }
    })

    // 如果添加成功
    if (result._id) {
      // 更新可用时间段信息
      const updateResult = await db.collection('Availability').doc(availabilityId).update({
        data: {
          [`timeSlots.${timeSlotIndex}.status`]: 'unavailable',
          [`timeSlots.${timeSlotIndex}.updatetime`]: new Date(),
        }
      })

      // 如果更新成功
      if (updateResult.stats.updated == 1) {
        return {
          success: true,
          message: '预约成功'
        }
      }
    }
  } catch (err) {
    console.log(err)
  }

  // 如果预约失败
  return {
    success: false,
    message: '预约失败'
  }
}