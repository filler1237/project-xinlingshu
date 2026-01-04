// cloud/deleteActivity/index.js
// 删除活动云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  const { activityId } = event

  // 参数验证
  if (!activityId) {
    return {
      success: false,
      code: 400,
      message: '活动ID不能为空'
    }
  }

  try {
    // 删除活动
    const result = await db.collection('activities').doc(activityId).remove()

    if (result.stats.removed === 1) {
      return {
        success: true,
        code: 200,
        message: '活动删除成功',
        data: {
          activityId: activityId
        }
      }
    } else {
      return {
        success: false,
        code: 404,
        message: '活动不存在或删除失败'
      }
    }
  } catch (error) {
    console.error('删除活动失败:', error)
    return {
      success: false,
      code: 500,
      message: '删除活动失败',
      error: error.message
    }
  }
}



