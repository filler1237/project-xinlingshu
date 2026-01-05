// cloud/updateActivityStatus/index.js
// 更新活动状态云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  const {
    activityId,    // 活动ID
    status         // 新状态 (notStarted, running, ended)
  } = event

  // 参数验证
  if (!activityId) {
    return {
      success: false,
      code: 400,
      message: '活动ID不能为空'
    }
  }

  if (!status || !['notStarted', 'running', 'ended'].includes(status)) {
    return {
      success: false,
      code: 400,
      message: '状态值无效'
    }
  }

  const statusMap = {
    'notStarted': '未开始',
    'running': '进行中',
    'ended': '已结束'
  }

  try {
    // 更新活动状态
    const result = await db.collection('activities').doc(activityId).update({
      data: {
        status: status,
        statusType: status,
        statusText: statusMap[status],
        manualStatus: true, // 标记为手动设置
        updatedAt: db.serverDate()
      }
    })

    if (result.stats.updated === 1) {
      return {
        success: true,
        code: 200,
        message: '状态更新成功',
        data: {
          activityId: activityId,
          status: status
        }
      }
    } else {
      return {
        success: false,
        code: 404,
        message: '活动不存在或更新失败'
      }
    }
  } catch (error) {
    console.error('更新活动状态失败:', error)
    return {
      success: false,
      code: 500,
      message: '更新活动状态失败',
      error: error.message
    }
  }
}



