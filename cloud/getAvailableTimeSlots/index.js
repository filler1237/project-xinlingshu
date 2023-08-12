// 引入云函数 SDK
const cloud = require('wx-server-sdk');
// 初始化云函数
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 定义默认的开始时间、结束时间和间隔
const DEFAULT_START_TIME = '09:00:00';
const DEFAULT_END_TIME = '18:00:00';
const DEFAULT_INTERVAL = 60; // 1 小时

// 定义云函数入口函数 main
async function main(event) {
  // 获取云数据库实例
  const db = cloud.database();

  try {
    // 获取当前日期
    const currentDate = new Date();
    console.log('Current Date:', currentDate.toISOString().split('T')[0]);
    // 查询是否存在对应的时间段记录
    const res = await db
      .collection('Availability')
      .where({
        teacherId: event.teacherId,
        date: event.date,
      })
      .get();

    if (res.data.length === 0) {
      // 如果不存在时间段记录，则创建新的时间段记录
      const timeSlots = [];
      // 使用默认的开始时间、结束时间和间隔
      const startTime = new Date(`${event.date}T${DEFAULT_START_TIME}`);
      const endTime = new Date(`${event.date}T${DEFAULT_END_TIME}`);
      const interval = DEFAULT_INTERVAL;
      // 循环生成时间段记录
      let current = new Date(startTime);
      const end = new Date(endTime);
      while (current < end) {
        if (current.getHours() !== 12 && current.getHours() !== 13) {
          timeSlots.push({
            startTime: current.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
            endTime: new Date(
              current.getTime() + interval * 60 * 1000
            ).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
            status: 'available', // 设置时间段状态为可预约
          });
        }
        current = new Date(current.getTime() + interval * 60 * 1000);
      }

      if (timeSlots.length === 0) {
        // 如果未生成任何时间段，则返回错误响应
        return {
          code: -1,
          msg: '无可预约时间段',
          data: [],
        };
      }

      // 添加日期和时间段记录
      const result = await db.collection('Availability').add({
        data: {
          teacherId: event.teacherId,
          date: event.date,
          timeSlots,
        },
      });

      // 将记录的 id 存储到 formData 列表中
      const formData = {
        teacherId: event.teacherId,
        date: event.date,
        timeSlot: timeSlots[0],
        availabilityId: result._id,
      };
      // 返回结果
      return {
        code: 0,
        data: timeSlots,
        formData: formData,
      };
    } else {
      // 如果存在时间段记录，则更新已过期的时间段状态
      const availability = res.data[0];
      const currentTime = new Date(event.currentTime);
      const timeSlots = availability.timeSlots.map((timeSlot) => {
        const startTime = new Date(`${event.date}T${timeSlot.startTime}`);
        const endTime = new Date(`${event.date}T${timeSlot.endTime}`);

        console.log('startTime:', startTime);
        console.log('endTime:', endTime);
        console.log('currentTime:', currentTime);

        if (endTime <= currentTime) {
          // 将过期的时间段状态更新为不可预约
          console.log('Updating time slot:', timeSlot);
          return { ...timeSlot, status: 'unavailable' };
        }
        return timeSlot;
      });

      // 更新时间段状态
      console.log('Updated time slots:', timeSlots);
      await db.collection('Availability').doc(availability._id).update({
        data: {
          timeSlots: timeSlots,
        },
      });

      // 打印更新后的时间段数组
      console.log(timeSlots);
      // 过滤出状态为 available 的时间段
      const availableTimeSlots = timeSlots.filter(
        (timeSlot) => timeSlot.status === 'available'
      );
      const data =
        availableTimeSlots.length > 0
          ? availableTimeSlots.map((timeSlot) => timeSlot.startTime)
          : [];

      // 将记录的 id 存储到 formData 列表中
      const formData = {
        teacherId: event.teacherId,
        date: event.date,
        timeSlot: availableTimeSlots[0],
        availabilityId: availability._id,
      };

      // 返回结果
      return {
        code: 0,
        data: availableTimeSlots,
        formData: formData,
      };
    }
  } catch (e) {
    console.error(e);
    // 返回错误响应
    return {
      code: -1,
      msg: '预约失败',
      data: [],
    };
  }
}

// 导出云函数入口函数
module.exports = {
  main,
};