// 云函数 createAppointment
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

exports.main = async (event, context) => {
  const db = cloud.database()
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  // 从 event 中获取需要的字段
  let { teacherId, date, startTime, endTime, availabilityId, timeSlotIndex, status, detail, teacher } = event

  try {
    // 如果 availabilityId 不存在，意味着这是当天的第一个预约，需要先创建 Availability 记录
    if (!availabilityId) {
      // 注意：这里的默认时间段生成逻辑需要与 getAvailability 中的保持一致
      const timeSlots = generateDefaultTimeSlots(date); 
      const availabilityRes = await db.collection('Availability').add({
        data: {
          teacherId,
          date,
          timeSlots,
        }
      });
      availabilityId = availabilityRes._id;
    }

    // 添加预约信息到 appointment 集合中
    const result = await db.collection('Appointments').add({
      data: {
        teacherId,
        _openid: openid, // 手动添加 _openid
        date,
        startTime: event.timeSlot.startTime, // 修正：使用 timeSlot 内部的时间
        endTime: event.timeSlot.endTime,     // 修正：使用 timeSlot 内部的时间
        createTime: new Date(),
        detail,
        teacher,
        complete:"进行中",
        evaluate:"0",
        score:"0",
        feedback:"",
        availabilityId: availabilityId,
        timeSlotIndex: timeSlotIndex
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

// 这个函数需要与 getAvailability 中的 generateDefaultTimeSlots 保持一致
function generateDefaultTimeSlots(dateString) {
    const timeSlots = [];
    const DEFAULT_START_TIME = '09:00:00';
    const DEFAULT_END_TIME = '18:00:00';
    const DEFAULT_INTERVAL = 60;
    const LUNCH_BREAK_START = 12;
    const LUNCH_BREAK_END = 13;

    const startTime = new Date(`${dateString}T${DEFAULT_START_TIME}`);
    const endTime = new Date(`${dateString}T${DEFAULT_END_TIME}`);
    let current = new Date(startTime);

    while (current < endTime) {
        const currentHour = current.getHours();
        if (currentHour !== LUNCH_BREAK_START && currentHour !== LUNCH_BREAK_END) {
            const slotEndTime = new Date(current.getTime() + DEFAULT_INTERVAL * 60 * 1000);
            timeSlots.push({
                startTime: current.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                endTime: slotEndTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                status: 'available',
            });
        }
        current.setTime(current.getTime() + DEFAULT_INTERVAL * 60 * 1000);
    }
    return timeSlots;
}
