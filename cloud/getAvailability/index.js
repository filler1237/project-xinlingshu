// 云函数：getAvailability - 整合了所有获取可用性信息的逻辑
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// --- 默认配置 ---
const DEFAULT_START_TIME = '09:00:00';
const DEFAULT_END_TIME = '18:00:00';
const DEFAULT_INTERVAL = 60; // 60分钟
const LUNCH_BREAK_START = 12;
const LUNCH_BREAK_END = 13;

// --- 辅助函数 ---

// 格式化数字，确保两位数
function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

// 生成一天的默认可用时间段
function generateDefaultTimeSlots(dateString) {
  const timeSlots = [];
  const startTime = new Date(`${dateString}T${DEFAULT_START_TIME}`);
  const endTime = new Date(`${dateString}T${DEFAULT_END_TIME}`);
  let current = new Date(startTime);

  while (current < endTime) {
    const currentHour = current.getHours();
    // 排除午休时间
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

// --- 主函数 ---
exports.main = async (event, context) => {
  // 在真实应用中，教师列表应该从数据库中获取
  const allTeachers = [
    { id: 0, name: '王贞贞' },
    { id: 1, name: '姚双雁' },
    { id: 2, name: '李亚玲' },
  ];

  // 1. 计算需要查询的日期范围（未来7天）
  const today = new Date();
  const dateStrings = [];
  const startDayTime = today.getTime();
  const endDayTime = startDayTime + 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    dateStrings.push(date.getFullYear() + '-' + formatNumber(date.getMonth() + 1) + '-' + formatNumber(date.getDate()));
  }

  try {
    // 2. 并行查询：特定日期例外 (Availability)、周常规模板 (WeeklySchedule)、已有预约 (Appointments)
    const [availabilityRes, weeklyRes, appointmentsRes] = await Promise.all([
      db.collection('Availability').where({
        date: _.in(dateStrings)
      }).get(),
      db.collection('WeeklySchedule').get(), // 获取所有老师的周计划
      db.collection('Appointments').where({
        date: _.in(dateStrings),
        // 如果需要，可以在这里过滤掉已取消的预约，例如: complete: _.neq('已取消')
      }).get()
    ]);

    // 3. 构建索引以便快速查找
    const availabilityMap = {}; // Key: teacherId_date
    availabilityRes.data.forEach(item => {
      availabilityMap[`${item.teacherId}_${item.date}`] = item.timeSlots;
    });

    const weeklyMap = {}; // Key: teacherId_dayOfWeek (0-6)
    weeklyRes.data.forEach(item => {
      weeklyMap[`${item.teacherId}_${item.dayOfWeek}`] = item.timeSlots;
    });

    // 构建预约索引 Map<teacherId_date, Set<startTime>>
    const appointmentMap = {};
    appointmentsRes.data.forEach(appt => {
      const key = `${appt.teacherId}_${appt.date}`;
      if (!appointmentMap[key]) {
        appointmentMap[key] = new Set();
      }
      appointmentMap[key].add(appt.startTime);
    });

    // 4. 组装结果
    const result = [];
    const currentTime = new Date(); // 用于过滤已过期的具体时间点

    for (const teacher of allTeachers) {
      const teacherAvailability = {
        teacherId: teacher.id,
        teacherName: teacher.name,
        dates: []
      };

      for (let i = 0; i < 7; i++) {
        const dateObj = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        const dateString = dateStrings[i];
        const dayOfWeek = dateObj.getDay(); // 0 (Sun) - 6 (Sat)

        let finalSlots = [];
        let sourceType = 'default';

        // 优先级 1: 检查是否有特定日期的例外记录
        if (availabilityMap[`${teacher.id}_${dateString}`]) {
          // 必须深拷贝，否则修改会影响缓存（虽然这里是云函数一次性执行，但好习惯）
          finalSlots = JSON.parse(JSON.stringify(availabilityMap[`${teacher.id}_${dateString}`]));
          sourceType = 'specific';
        }
        // 优先级 2: 检查是否有周常规模板
        else if (weeklyMap[`${teacher.id}_${dayOfWeek}`]) {
          finalSlots = JSON.parse(JSON.stringify(weeklyMap[`${teacher.id}_${dayOfWeek}`]));
          sourceType = 'weekly';
        }
        // 优先级 3: 默认生成
        else {
          finalSlots = generateDefaultTimeSlots(dateString);
          sourceType = 'generated';
        }

        // 5. 核心逻辑：根据预约记录覆盖状态
        // 检查该 老师+日期 下是否有预约
        const bookedStartTimes = appointmentMap[`${teacher.id}_${dateString}`];
        if (bookedStartTimes) {
          finalSlots.forEach(slot => {
            if (bookedStartTimes.has(slot.startTime)) {
              slot.status = 'unavailable'; // 强制标记为忙碌
              slot.isBooked = true; // 额外标记，方便前端区分是“老师设置忙”还是“已被预约”
            }
          });
        }

        // 过滤：仅返回 'available' 且未过期的时间段
        const validSlots = finalSlots.map((slot, index) => {
          // 对模板时间进行日期实例化
          const slotStartTime = new Date(`${dateString}T${slot.startTime}`);
          const isExpired = slotStartTime < currentTime;
          return {
            ...slot,
            originalIndex: index, // 关键：记录在原始数组中的索引，供前端预约使用
            isExpired: isExpired
          };
        }).filter(slot => {
          // 关键：现在 student 只能看到 available 的（被预约的已经被改为 unavailable 了）
          return slot.status === 'available' && !slot.isExpired;
        });

        if (validSlots.length > 0) {
          teacherAvailability.dates.push({
            date: dateString,
            dayOfWeek: dayOfWeek,
            slots: validSlots,
            source: sourceType
          });
        }
      }

      if (teacherAvailability.dates.length > 0) {
        result.push(teacherAvailability);
      }
    }

    return {
      success: true,
      data: result
    };

  } catch (err) {
    console.error(err);
    return { success: false, message: 'Fetch availability failed', error: err };
  }
};
