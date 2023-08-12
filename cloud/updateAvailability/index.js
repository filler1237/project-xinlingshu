// 云函数 updateAvailability
exports.main = async (event, context) => {
  const cloud = require('wx-server-sdk')
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
  const db = cloud.database()

  try {
    // 从 event 参数中获取需要的字段
    const { availabilityId, timeSlotIndex, status } = event

    // 更新可用时间段信息
    const updateResult = await db.collection('Availability').doc(availabilityId).update({
      data: {
        // 使用动态字段名，将指定时间段的状态和更新时间更新为给定的值
        [`timeSlots.${timeSlotIndex}.status`]: status,
        [`timeSlots.${timeSlotIndex}.updatetime`]: new Date(),
      }
    })

    // 如果更新成功
    if (updateResult.stats.updated == 1) {
      return {
        success: true,
        message: '更新成功',
      }
    }
  } catch (err) {
    console.log(err)
  }

  // 如果更新失败
  return {
    success: false,
    message: '更新失败',
  }
}