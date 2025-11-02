// 云函数 getAvailableTeachers
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  // In a real app, you might get this from a 'teachers' collection
  const allTeachers = [
    { id: 0, name: '王贞贞' },
    { id: 1, name: '姚双雁' },
    { id: 2, name: '李亚玲' },
  ];
  const availableTeachers = [];

  for (const teacher of allTeachers) {
    const res = await cloud.callFunction({
      name: 'getAvailableDates',
      data: {
        teacherId: teacher.id
      }
    });
    
    if (res.result.availableDates.length > 0) {
      availableTeachers.push(teacher.name);
    }
  }

  return {
    availableTeachers,
  };
};
