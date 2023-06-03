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

  try {
    // 查询是否存在对应的时间段记录
    const res = await db.collection('Availability')
      .where({
        teacherId: event.teacherId,
        date: event.date
      })
      .get()

    if (res.data.length === 0) {
      // 如果不存在时间段记录，则创建新的时间段记录
      const timeSlots = []

      // 使用默认的开始时间、结束时间和间隔
      const startTime = new Date(`${event.date} ${DEFAULT_START_TIME}`)
      const endTime = new Date(`${event.date} ${DEFAULT_END_TIME}`)
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
          msg: '无可预约时间段',
          data: []
        }
      }

      // 添加日期和时间段记录
      const result = await db.collection('Availability').add({
        data: {
          teacherId: event.teacherId,
          date: event.date,
          timeSlots
        }
      })

      // 将记录的 id 存储到 formData 列表中
      const formData = {
        teacherId: event.teacherId,
        date: event.date,
        timeSlot: timeSlots[0],
        availabilityId: result._id
      }

      // 返回结果
      return {
        code: 0,
        data: timeSlots,
        formData: formData
      }
    } else {
      // 如果存在时间段记录，则更新已过期的时间段状态，并返回所有状态为 available 的时间段
      const availability = res.data[0]
      const timeSlots = availability.timeSlots.map(timeSlot => {
        if (new Date(timeSlot.endTime) < new Date(Date.now())) {
          if (timeSlot.status !== 'expired') { // 添加检查，确保已过期的时间段状态不会被更新为可预约的状态
            return { ...timeSlot, status: 'expired' } // 将过期的时间段状态更新为不可预约
          } else {
            return timeSlot
          }
        } else {
          return timeSlot
        }
      })

      // 更新时间段状态
      await db.collection('Availability')
        .doc(availability._id)
        .update({
          data: {
            timeSlots: timeSlots
          }
        })

      // 过滤出状态为 available 的时间段
      const availableTimeSlots = timeSlots.filter(timeSlot => timeSlot.status === 'available')
      const data = availableTimeSlots.length > 0 ? availableTimeSlots.map(timeSlot => timeSlot.startTime) : []

      // 将记录的 id 存储到 formData 列表中
      const formData= {
        teacherId: event.teacherId,
        date: event.date,
        timeSlot: availableTimeSlots[0],
        availabilityId: availability._id
      }

      // 返回结果
      return {
        code: 0,
        data: data,
        formData: formData
      }
    }
  } catch (e) {
    console.error(e)
    // 返回错误响应
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