// 云函数 createAppointment
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

exports.main = async (event, context) => {
  const db = cloud.database();
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  console.log('前端传递的完整数据:', event);

  // 从 event 中获取需要的字段
  let { teacherId, date, startTime, endTime, availabilityId, timeSlotIndex, detail, teacher } = event;

  try {
    // 如果 availabilityId 不存在，意味着这是当天的第一个预约，需要先创建 Availability 记录
    if (!availabilityId) {
      console.log('Creating new Availability record based on WeeklySchedule or Default');

      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();

      // 尝试获取周模板
      const weeklyRes = await db.collection('WeeklySchedule').where({
        teacherId: teacherId,
        dayOfWeek: dayOfWeek
      }).get();

      let timeSlots = [];
      if (weeklyRes.data.length > 0) {
        // 使用周模板
        timeSlots = weeklyRes.data[0].timeSlots;
        console.log('Using WeeklySchedule template');
      } else {
        // 使用默认生成
        timeSlots = generateDefaultTimeSlots(date);
        console.log('Using Default generation');
      }

      const availabilityRes = await db.collection('Availability').add({
        data: {
          teacherId,
          date,
          timeSlots,
          createTime: new Date(),
          updateTime: new Date()
        }
      });
      availabilityId = availabilityRes._id;
    }

    // 53. 关键修改：先尝试锁定时间段，利用数据库原子更新防止并发冲突
    // 更新条件：_id 匹配且 该时间段状态必须为 'available'
    const updateResult = await db.collection('Availability').where({
      _id: availabilityId,
      [`timeSlots.${timeSlotIndex}.status`]: 'available'
    }).update({
      data: {
        [`timeSlots.${timeSlotIndex}.status`]: 'unavailable',
        [`timeSlots.${timeSlotIndex}.updatetime`]: new Date(),
      }
    });

    // 54. 只有当更新数量为 1 时，才表示抢占成功
    if (updateResult.stats.updated === 1) {
      // 添加预约信息到 appointment 集合中
      const result = await db.collection('Appointments').add({
        data: {
          teacherId,
          _openid: openid,
          date,
          startTime,
          endTime,
          createTime: new Date(),
          detail,
          teacher,
          complete: "进行中",
          evaluate: "0",
          score: "0",
          feedback: "",
          availabilityId: availabilityId,
          timeSlotIndex: timeSlotIndex
        }
      });

      if (result._id) {
        return {
          success: true,
          message: '预约成功'
        };
      } else {
        // 极端情况：预约表插入失败，需要回滚 Availability 状态（可选，但概率极低）
        await db.collection('Availability').doc(availabilityId).update({
          data: {
            [`timeSlots.${timeSlotIndex}.status`]: 'available'
          }
        });
        return { success: false, message: '预约记录创建失败' };
      }
    } else {
      // 抢占失败（已被他人预约）
      return {
        success: false,
        message: '该时间段刚刚已被预约，请刷新后重试'
      };
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
