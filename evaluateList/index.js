// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const openid = event.openid
  const now = new Date()
  const currentDate = now.toISOString().split('T')[0] // 当前日期
  const currentTime = now.toISOString().split('T')[1].split('.')[0] // 当前时间

  // 构建查询条件1
  const queryCondition1 = {
    openid: openid,
    complete: '已结束',
    evaluate: '0',
    date: db.command.lt(currentDate), // date小于今天
  }

  // 构建查询条件2
  const queryCondition2 = {
    openid: openid,
    complete: '已结束',
    evaluate: '0',
    date: currentDate, // 当天日期
    endTime: db.command.lt(currentTime) // 结束时间小于当前时间
  }

  try {
    const res1 = await db
      .collection('Appointments')
      .where(queryCondition1) // 应用查询条件1
      .get()
    const res2 = await db
      .collection('Appointments')
      .where(queryCondition2) // 应用查询条件2
      .get()
      
    const combinedData = [...res1.data, ...res2.data];

    if (combinedData.length === 0) {
      // 没有查询到记录的情况
      return {
        data: [],
        evaluateList: false,
      }
    } else {
      // 查询到记录的情况
      return {
        data: combinedData,
        evaluateList: true,
      }
    }
  } catch (error) {
    // 处理错误
    console.error(error)
    return {
      data: [],
      evaluateList: false,
      error: error,
    }
  }
}