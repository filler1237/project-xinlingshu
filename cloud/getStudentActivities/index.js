// cloud/getStudentActivities/index.js
// 获取学生可提交作品的活动列表云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  try {
    // 1. 获取所有进行中的活动
    const activitiesRes = await db.collection('activities')
      .where({
        statusType: 'running'  // 只获取进行中的活动
      })
      .orderBy('createdAt', 'desc')
      .get()
    
    const activities = activitiesRes.data || []
    
    // 2. 检查该学生是否已经为每个活动提交过作品
    const worksRes = await db.collection('works')
      .where({
        studentId: openid,
        status: _.neq('deleted')
      })
      .get()
    
    // 创建活动ID到作品的映射
    const workMap = {}
    worksRes.data.forEach(work => {
      if (!workMap[work.activityId]) {
        workMap[work.activityId] = []
      }
      workMap[work.activityId].push(work)
    })
    
    // 3. 处理活动数据，添加是否已提交作品的信息
    const result = activities.map(activity => {
      const hasSubmitted = workMap[activity._id] && workMap[activity._id].length > 0
      const existingWork = hasSubmitted ? workMap[activity._id][0] : null
      
      return {
        id: activity._id,
        _id: activity._id,
        theme: activity.theme || activity.title || '未命名活动',
        title: activity.title || activity.theme || '未命名活动',
        description: activity.description || '',
        startTime: activity.startTime || '',
        endTime: activity.endTime || '',
        status: activity.statusType || activity.status || 'running',
        statusText: activity.statusText || '进行中',
        organizer: activity.organizer || '心理健康中心',
        hasSubmitted: hasSubmitted,  // 是否已提交作品
        existingWorkId: existingWork ? existingWork._id : null,  // 已有作品ID
        allowedUploadTypes: activity.allowedUploadTypes || ['document', 'image']  // 允许上传的类型
      }
    })
    
    // 4. 过滤出可以提交作品的活动（未提交的）
    const availableActivities = result.filter(item => !item.hasSubmitted)
    
    return {
      success: true,
      code: 200,
      data: availableActivities,
      total: availableActivities.length,
      message: availableActivities.length > 0 ? '获取成功' : '暂无可以提交作品的活动'
    }
  } catch (error) {
    console.error('获取学生活动列表失败:', error)
    return {
      success: false,
      code: 500,
      message: '获取活动列表失败',
      error: error.message,
      data: []
    }
  }
}

