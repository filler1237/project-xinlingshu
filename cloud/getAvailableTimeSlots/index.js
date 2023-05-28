// 引入云函数 SDK
const cloud = require('wx-server-sdk')
// 初始化云函数
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
// 定义默认的开始时间、结束时间和间隔
const DEFAULT_START_TIME = '09:00:00'
const DEFAULT_END_TIME = '18:00:00'
const DEFAULT_INTERVAL = 60 // 1 小时

// 定义云函数入口函数 main
async function main(event) {
  // 获取云数据库实例
  const db = cloud.database()
  // 如果 teacherId 为 -1，直接返回空的时间段列表
 if (event.teacherId === -1) {
    return {
      code: 0,
      data: []
    }
  }

  // 获取 Availability 集合的引用 
  const availabilityCollection = db.collection('Availability')

  // 获取请求事件中的 teacherId 和 date
  const { teacherId, date } = event

  try {
    // 开始一个事务
    const transaction = await db.startTransaction()

    // 根据 teacherId 和 date 查询对应的可预约时间段记录
    const res = await transaction.collection('Availability')
      .where({
        teacherId,
        date
      })
      .get()

    // 如果查询结果为空或没有可预约的时间段，则创建时间段
    if (!res.data || res.data.length === 0 || !res.data[0].timeSlots || res.data[0].timeSlots.length === 0) {
      const timeSlots = []

      // 使用默认的开始时间、结束时间和间隔
      const startTime = new Date(`${date} ${DEFAULT_START_TIME}`)
      const endTime = new Date(`${date} ${DEFAULT_END_TIME}`)
      const interval = DEFAULT_INTERVAL

      // 循环生成时间段记录
      let current = new Date(startTime);
      const end = new Date(endTime);
      while (current < end) {
        if (current.getHours() !== 12 && current.getHours() !== 13) {
          timeSlots.push({
            startTime: current.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}),
            endTime: new Date(current.getTime() + interval * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}),
            status: 'available' // 设置时间段状态为可预约
          });
        }
        current = new Date(current.getTime() + interval * 60 * 1000);
      }
      
      if (timeSlots.length === 0) {
        // 如果未生成任何时间段，则返回错误响应
        return {
          code: -1,
          msg: '无可预约时间段'
        }
      }

      // 添加日期和时间段记录
      const result = await transaction.collection('Availability').add({
        data: {
          teacherId,
          date,
          timeSlots
        }
      })

      // 查询新添加的记录
      const newRes = await transaction.collection('Availability')
        .doc(result._id)
        .get()

      // 提交事务
      await transaction.commit()

      // 返回查询结果
      return {
        code: 0,
        data: timeSlots
      }
    } else {
      // 更新过期的时间段状态为不可预约
      const currentTime = new Date()
      const updateTimes = res.data[0].timeSlots.map(timeSlot => {
        if (new Date(timeSlot.endTime) < currentTime) {
          return { ...timeSlot, status: 'expired' } // 将过期的时间段状态更新为不可预约
        } else {
          return timeSlot
        }
      })
      // 更新时间段状态
      await transaction.collection('Availability')
        .doc(res.data[0]._id)
        .update({
          data: {
            timeSlots: updateTimes
          }
        })
      // 提交事务
      await transaction.commit()
      // 返回查询结果
      const availableTimeSlots = res.data[0].timeSlots.filter(timeSlot => timeSlot.status === 'available')
      const data = availableTimeSlots.length > 0 ? availableTimeSlots.map(timeSlot => timeSlot.startTime) : []

      // 将记录的 id 存储到 formData 列表中
      const recordId = res.data[0]._id
      const formData = {
        teacherId: teacherId,
        date: date,
        timeSlot: availableTimeSlots[0],
        recordId: recordId
      }

      return {
        code: 0,
        data: availableTimeSlots,
        formData: formData
}
    }
  } catch (err) {
    // 打印错误信息
    console.log(err)

    // 返回错误信息
    return {
      code: -1,
      msg: '查询可预约时间段失败'
    }
  }
}

// 导出云函数入口函数
module.exports = {
  main: main
}