// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    const { type, teacherId, data } = event;
    const wxContext = cloud.getWXContext();

    // 简单的权限校验：确保只有管理员或本人操作 (这里假设调用方已校验，或者简单校验)
    // 实际项目中应加入鉴权逻辑

    try {
        if (type === 'get') {
            // 新增：获取数据的逻辑
            const { queryType, queryData } = data; // queryType: 'weekly' or 'specific'

            if (queryType === 'weekly') {
                const { dayOfWeek } = queryData;
                const res = await db.collection('WeeklySchedule').where({
                    teacherId: teacherId,
                    dayOfWeek: dayOfWeek
                }).get();
                return { success: true, data: res.data };
            }
            else if (queryType === 'specific') {
                const { date, dayOfWeek } = queryData; // 同时传 date 和 dayOfWeek 以便计算继承

                // 并行查询 Specific 和 Weekly
                const p1 = db.collection('Availability').where({
                    teacherId: teacherId,
                    date: date
                }).get();

                const p2 = db.collection('WeeklySchedule').where({
                    teacherId: teacherId,
                    dayOfWeek: dayOfWeek
                }).get();

                const [resSpecific, resWeekly] = await Promise.all([p1, p2]);

                return {
                    success: true,
                    data: {
                        specific: resSpecific.data,
                        weekly: resWeekly.data
                    }
                };
            }
            return { success: false, message: 'Invalid query type for get' };
        } else if (type === 'weekly') {
            // 更新周计划模板
            // data 应包含: dayOfWeek (0-6), timeSlots
            const { dayOfWeek, timeSlots } = data;

            if (dayOfWeek === undefined || !timeSlots) {
                return { success: false, message: 'Missing parameters for weekly update' };
            }

            // 查找并更新，如果不存在则插入 (Upsert)
            const res = await db.collection('WeeklySchedule').where({
                teacherId: teacherId,
                dayOfWeek: dayOfWeek
            }).get();

            if (res.data.length > 0) {
                await db.collection('WeeklySchedule').doc(res.data[0]._id).update({
                    data: {
                        timeSlots: timeSlots,
                        updateTime: new Date()
                    }
                });
            } else {
                await db.collection('WeeklySchedule').add({
                    data: {
                        teacherId,
                        dayOfWeek,
                        timeSlots,
                        createTime: new Date(),
                        updateTime: new Date()
                    }
                });
            }
            return { success: true, message: 'Weekly schedule updated' };

        } else if (type === 'specific') {
            // 更新特定日期（例外）
            // data 应包含: date (YYYY-MM-DD), timeSlots
            const { date, timeSlots } = data;

            if (!date || !timeSlots) {
                return { success: false, message: 'Missing parameters for specific update' };
            }

            const res = await db.collection('Availability').where({
                teacherId: teacherId,
                date: date
            }).get();

            if (res.data.length > 0) {
                await db.collection('Availability').doc(res.data[0]._id).update({
                    data: {
                        timeSlots: timeSlots,
                        updateTime: new Date()
                    }
                });
            } else {
                await db.collection('Availability').add({
                    data: {
                        teacherId,
                        date,
                        timeSlots,
                        createTime: new Date(),
                        updateTime: new Date()
                    }
                });
            }
            return { success: true, message: 'Specific date availability updated' };

        } else {
            return { success: false, message: 'Invalid update type' };
        }
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Database operation failed', error: e };
    }
}
