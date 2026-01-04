// cloud/updateActivity/index.js
// 更新活动信息云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  const {
    activityId,    // 活动ID
    theme,          // 活动主题
    startTime,      // 开始时间
    endTime,        // 结束时间
    description     // 活动描述
  } = event

  // 参数验证
  if (!activityId) {
    return {
      success: false,
      code: 400,
      message: '活动ID不能为空'
    }
  }

  if (!theme || !theme.trim()) {
    return {
      success: false,
      code: 400,
      message: '活动主题不能为空'
    }
  }

  if (!startTime || !endTime) {
    return {
      success: false,
      code: 400,
      message: '活动时间不能为空'
    }
  }

  // 验证时间逻辑
  const start = new Date(startTime)
  const end = new Date(endTime)
  if (start >= end) {
    return {
      success: false,
      code: 400,
      message: '结束时间必须晚于开始时间'
    }
  }

  try {
    // 构建更新数据
    const updateData = {
      theme: theme.trim(),
      title: theme.trim(), // 兼容字段
      startTime: startTime,
      endTime: endTime,
      description: description ? description.trim() : '',
      updatedAt: db.serverDate()
    }

    // 更新活动信息
    const result = await db.collection('activities').doc(activityId).update({
      data: updateData
    })

    if (result.stats.updated === 1) {
      return {
        success: true,
        code: 200,
        message: '活动更新成功',
        data: {
          activityId: activityId,
          ...updateData
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
    console.error('更新活动失败:', error)
    return {
      success: false,
      code: 500,
      message: '更新活动失败',
      error: error.message
    }
  }
}



