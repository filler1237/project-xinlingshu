// createAppointment 云函数名

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

// 获取数据库实例
const db = cloud.database()

// 获取 Appointments 集合实例
const appointmentsCollection = db.collection('Appointments')

// 获取 Availability 集合实例
const availabilityCollection = db.collection('Availability')

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取请求参数中的 teacherId、userId、date、startTime 和 endTime
    const { teacherId, userId, date, startTime, endTime } = event

    // 查询可预约时间段记录
    const res = await availabilityCollection.where({
      teacherId, // 查询条件：咨询师 ID
      date, // 查询条件：预约日期
      'timeSlots.startTime': startTime, // 查询条件：开始时间
      'timeSlots.endTime': endTime, // 查询条件：结束时间
      'timeSlots.status': 'available' // 查询条件：状态为可预约
    }).get()

    // 如果查询结果为空，返回预约失败信息
    if (res.data.length === 0) {
      return {
        code: -1,
        msg: '该时间段已被预约'
      }
    }
// 获取可预约时间段记录的 ID 和时间段的索引
const availabilityId = res.data[0]._id
const timeSlotIndex = res.data[0].timeSlots.findIndex(slot =>
  slot.startTime === startTime && slot.endTime === endTime
)

// 使用事务进行预约和更新可预约时间段状态
const transactionRes = await db.runTransaction(async transaction => {
  // 创建预约记录
  await appointmentsCollection.add({
    data: {
      teacherId,
      userId,
      date,
      startTime,
      endTime
    }
  })

  // 更新可预约时间段状态
  await availabilityCollection.doc(availabilityId).update({
    data: {
      [`timeSlots.${timeSlotIndex}.status`]: 'booked'
    }
  })

  // 返回预约成功信息
  return {
    code: 0,
    msg: '预约成功'
  }
})

// 返回事务执行结果
return transactionRes
} catch (err) {
// 捕获异常并返回预约失败信息
console.log(err)
return {
code: -1,
msg: '预约失败'
    }
  }
}