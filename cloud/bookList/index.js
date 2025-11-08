// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const now = new Date()

  try { 
    const res = await db
      .collection('Appointments')
      .where({
        _openid: openid,
      })
      .get()

    if (res.data.length === 0) {
      // 没有查询到记录的情况
      return { data: [] }
    } else if (res.data.length === 1) {
      // 查询到一条记录的情况
      const appointment = res.data[0]
      const appointmentTimestamp = new Date(appointment.date + ' ' + appointment.endTime).getTime()
      const status = appointmentTimestamp < now.getTime() ? '已结束' : '进行中' // 判断预约状态
      console.log("1id:",appointment._id)
      if (status === '已结束') {
        // 如果预约已结束，则将complete字段修改为已结束
        await db.collection('Appointments').doc(appointment._id).update({
          data: {
            complete: "已结束",
          },
        })
      }
      return { data: [{ ...appointment, _id:appointment._id, status }] }
    } else {
      // 查询到多条记录的情况
      const appointments = res.data.map((appointment) => {
        const appointmentTimestamp = new Date(appointment.date + ' ' + appointment.endTime).getTime()
        const status = appointmentTimestamp < now.getTime() ? '已结束' : '进行中' // 判断预约状态
        console.log("多id:",appointment._id)
        if (status === '已结束') {
          // 如果预约已结束，则将complete字段修改为已结束
          db.collection('Appointments').doc(appointment._id).update({
            data: {
              complete: "已结束",
            },
          })
        }

        return { ...appointment, _id:appointment._id , status, appointmentTimestamp }
      })
      appointments.sort((a, b) => b.appointmentTimestamp - a.appointmentTimestamp) // 按照时间戳降序排列
      return { data: appointments }
    }
  } catch (error) {
    console.error('查询预约记录失败', error)
    return { data: [] }
  }
}
