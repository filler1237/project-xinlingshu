// 云函数 updateAvailability
exports.main = async (event, context) => {
  const db = cloud.database()
  const { availabilityId, timeSlotIndex, status } = event
  const result = await db.collection('Availability').doc(availabilityId).update({
    data: {
      status,
      updateTime: new Date(),
    }
  })
  if (result.stats.updated == 1) {
    return {
      success: true,
      message: '更新成功',
    }
  } else {
    return {
      success: false,
      message: '更新失败',
    }
  }
}