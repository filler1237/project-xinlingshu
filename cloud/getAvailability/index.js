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
  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    dateStrings.push(date.getFullYear() + '-' + formatNumber(date.getMonth() + 1) + '-' + formatNumber(date.getDate()));
  }

  // 2. 一次性查询数据库中所有相关日期的可用性记录
  const availabilityData = await db.collection('Availability').where({
      date: _.in(dateStrings)
  }).get();

  // 3. 将查询结果处理成更易于访问的结构 { teacherId: { date: record } }
  const availabilityByTeacherAndDate = {};
  availabilityData.data.forEach(item => {
      if (!availabilityByTeacherAndDate[item.teacherId]) {
          availabilityByTeacherAndDate[item.teacherId] = {};
      }
      availabilityByTeacherAndDate[item.teacherId][item.date] = item;
  });

  // 4. 组装最终结果
  const result = [];
  const currentTime = new Date();

  for (const teacher of allTeachers) {
    const teacherAvailability = {
      teacherId: teacher.id,
      teacherName: teacher.name,
      dates: [] // 使用数组更适合前端渲染
    };
    
    for (const dateString of dateStrings) {
        const dbRecord = availabilityByTeacherAndDate[teacher.id] ? availabilityByTeacherAndDate[teacher.id][dateString] : null;
        
        // 如果数据库有记录，则使用它；否则，生成默认时间段
        const timeSlots = dbRecord ? dbRecord.timeSlots : generateDefaultTimeSlots(dateString);

        // 过滤掉已过时或已被预约的时间段
        const availableSlots = timeSlots.filter(slot => {
            const slotStartTime = new Date(`${dateString}T${slot.startTime}`);
            return slot.status === 'available' && slotStartTime > currentTime;
        });

        // 如果当天有可用的时间段，则添加到结果中
        if (availableSlots.length > 0) {
            teacherAvailability.dates.push({
                date: dateString,
                slots: availableSlots,
                // 如果记录来自数据库，则传递其ID，否则为null
                availabilityId: dbRecord ? dbRecord._id : null 
            });
        }
    }

    // 如果该教师在未来7天内有任何可用时间，则将其添加到最终结果列表
    if (teacherAvailability.dates.length > 0) {
        result.push(teacherAvailability);
    }
  }

  return {
    success: true,
    data: result
  };
};
