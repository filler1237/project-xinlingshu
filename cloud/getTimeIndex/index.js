// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取云数据库实例
  const db = cloud.database()
  // 获取 Availability 集合的引用 
  const availabilityCollection = db.collection('Availability')
  // 获取请求事件中的availabilityId 和 startTime
  const { availabilityId, startTime } = event

  try {
    // 查询记录
    const res = await availabilityCollection.doc(availabilityId).get()
    const timeSlots = res.data.timeSlots || []
    // 查找与传入的 startTime 相同值的 startTime
    const index = timeSlots.findIndex(timeSlot => timeSlot.startTime === startTime)
    // 返回查找结果
    return {
      code: 0,
      index: index
    }
  } catch(err) {
    // 打印错误信息
    console.log(err)

    // 返回错误信息
    return {
      code: -1,
      msg: '查询时间段索引失败'
    }
  }
}