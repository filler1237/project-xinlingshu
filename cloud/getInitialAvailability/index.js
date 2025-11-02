// 云函数 getInitialAvailability
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const DEFAULT_START_TIME = '09:00:00';
const DEFAULT_END_TIME = '18:00:00';
const DEFAULT_INTERVAL = 60; // 1 hour

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

function generateDefaultTimeSlots(dateString) {
    const timeSlots = [];
    const startTime = new Date(`${dateString}T${DEFAULT_START_TIME}`);
    const endTime = new Date(`${dateString}T${DEFAULT_END_TIME}`);
    const interval = DEFAULT_INTERVAL;
    let current = new Date(startTime);
    const end = new Date(endTime);
    while (current < end) {
        if (current.getHours() !== 12 && current.getHours() !== 13) { // Assuming lunch break
            timeSlots.push({
                startTime: current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                endTime: new Date(current.getTime() + interval * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                status: 'available',
            });
        }
        current = new Date(current.getTime() + interval * 60 * 1000);
    }
    return timeSlots;
}

exports.main = async (event, context) => {
  const allTeachers = [
    { id: 0, name: '王贞贞' },
    { id: 1, name: '姚双雁' },
    { id: 2, name: '李亚玲' },
  ];

  const today = new Date();
  const dateStrings = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    dateStrings.push(date.getFullYear() + '-' + formatNumber(date.getMonth() + 1) + '-' + formatNumber(date.getDate()));
  }

  const availabilityData = await db.collection('Availability').where({
      date: _.in(dateStrings)
  }).get();

  const availabilityByTeacherAndDate = {};
  availabilityData.data.forEach(item => {
      if (!availabilityByTeacherAndDate[item.teacherId]) {
          availabilityByTeacherAndDate[item.teacherId] = {};
      }
      availabilityByTeacherAndDate[item.teacherId][item.date] = item;
  });

  const result = [];

  for (const teacher of allTeachers) {
    const teacherAvailability = {
      teacherId: teacher.id,
      teacherName: teacher.name,
      dates: {}
    };
    let hasAnyAvailability = false;

    for (const dateString of dateStrings) {
        const availabilityRecord = availabilityByTeacherAndDate[teacher.id] ? availabilityByTeacherAndDate[teacher.id][dateString] : null;
        let timeSlots = availabilityRecord ? availabilityRecord.timeSlots : generateDefaultTimeSlots(dateString);

        const currentTime = new Date();
        const availableSlots = timeSlots.filter(slot => {
            const startTime = new Date(`${dateString}T${slot.startTime}`);
            return slot.status === 'available' && startTime > currentTime;
        });

        if (availableSlots.length > 0) {
            teacherAvailability.dates[dateString] = {
                slots: availableSlots,
                availabilityId: availabilityRecord ? availabilityRecord._id : null // Will need to create if null
            };
            hasAnyAvailability = true;
        }
    }

    if (hasAnyAvailability) {
        result.push(teacherAvailability);
    }
  }

  return result;
};
