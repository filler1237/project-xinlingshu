const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取数据库实例
  const db = cloud.database()

  // 获取 Availability 集合实例
  const availabilityCollection = db.collection('Availability')

  try {
    // 获取请求参数中的 availabilityId、timeSlotIndex 和 status
    const { availabilityId, timeSlotIndex, status } = event

    // 更新可预约时间段状态
    await availabilityCollection.doc(availabilityId).update({
      data: {
        [`timeSlots.${timeSlotIndex}.status`]: status
      }
    })

    // 返回更新成功信息
    return {
      code: 0,
      msg: '更新可预约时间段成功'
    }
  } catch (err) {
    // 捕获异常并返回更新失败信息
    console.log(err)
    return {
      code: -1,
      msg: '更新可预约时间段失败'
    }
  }
}