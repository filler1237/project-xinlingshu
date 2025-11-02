// 云函数 getAvailableDates
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { teacherId } = event;
  const today = new Date();
  const availableDates = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const dateString = date.getFullYear() + '-' + formatNumber(date.getMonth() + 1) + '-' + formatNumber(date.getDate());

    const res = await db.collection('Availability').where({
      teacherId: teacherId,
      date: dateString,
    }).get();

    if (res.data.length > 0) {
      const availability = res.data[0];
      const hasAvailableSlot = availability.timeSlots.some(slot => slot.status === 'available');
      if (hasAvailableSlot) {
        availableDates.push(dateString);
      }
    } else {
      // If no record, assume it's available as getAvailableTimeSlots will create it
      availableDates.push(dateString);
    }
  }

  return {
    availableDates,
  };
};

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}
