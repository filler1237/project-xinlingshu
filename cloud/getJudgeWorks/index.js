// cloud/getJudgeWorks/index.js
// 获取评委作品列表云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const judgeId = wxContext.OPENID
  
  // 获取参数
  const {
    status,        // 可选：筛选状态 (pending/reviewed/all)
    page = 1,      // 页码，默认1
    pageSize = 100 // 每页数量，默认100
  } = event

  try {
    // 1. 获取所有待评审或已评审的作品
    let query = db.collection('works')
      .where({
        status: _.neq('deleted') // 排除已删除的作品
      })
    
    // 根据状态筛选
    if (status === 'pending') {
      // 待评审：status为pending，且该评委未评分
      query = query.where({
        status: 'pending'
      })
    } else if (status === 'reviewed') {
      // 已评审：该评委已评分（scores数组中包含该评委的评分）
      // 这里需要先获取所有作品，然后过滤
    }
    
    // 查询作品列表，按提交时间倒序
    const result = await query
      .orderBy('submittedAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    // 2. 获取活动信息（用于显示活动标题等）
    const works = result.data || []
    const activityIds = [...new Set(works.map(w => w.activityId))]
    
    let activitiesMap = {}
    if (activityIds.length > 0) {
      const activitiesRes = await db.collection('activities')
        .where({
          _id: _.in(activityIds)
        })
        .get()
      
      activitiesRes.data.forEach(activity => {
        activitiesMap[activity._id] = activity
      })
    }
    
    // 3. 处理作品数据，检查该评委是否已评审
    const processedWorks = works.map(work => {
      const activity = activitiesMap[work.activityId] || {}
      
      // 检查该评委是否已评分
      const judgeScore = work.scores ? work.scores.find(s => s.judgeId === judgeId) : null
      const hasReviewed = !!judgeScore
      
      // 如果筛选已评审，只返回已评审的作品
      if (status === 'reviewed' && !hasReviewed) {
        return null
      }
      
      // 如果筛选待评审，只返回未评审的作品
      if (status === 'pending' && hasReviewed) {
        return null
      }
      
      return {
        id: work._id,
        _id: work._id,
        title: work.title || '未命名作品',
        description: work.description || '',
        activityId: work.activityId,
        activityTitle: activity.theme || activity.title || work.activityTitle || '未知活动',
        organizer: activity.organizer || '心理健康中心',
        studentId: work.studentId,
        studentName: work.studentName || '学生',
        fileID: work.fileID,
        fileName: work.fileName,
        fileType: work.fileType,
        fileSize: work.fileSize,
        status: work.status || 'pending',
        statusText: work.statusText || '待评审',
        submittedAt: work.submittedAt,
        // 评审信息
        hasReviewed: hasReviewed,
        judgeScore: judgeScore ? {
          score: judgeScore.score || 0,
          comment: judgeScore.comment || '',
          time: judgeScore.time
        } : null,
        // 总体评分信息
        totalScore: work.totalScore || 0,
        averageScore: work.averageScore || 0,
        judgeCount: work.judgeCount || 0
      }
    }).filter(work => work !== null) // 过滤掉null
    
    // 4. 统计数量
    const pendingCount = processedWorks.filter(w => !w.hasReviewed).length
    const reviewedCount = processedWorks.filter(w => w.hasReviewed).length
    
    return {
      success: true,
      code: 200,
      data: processedWorks,
      total: processedWorks.length,
      pendingCount: pendingCount,
      reviewedCount: reviewedCount,
      page: page,
      pageSize: pageSize
    }
  } catch (error) {
    console.error('获取评委作品列表失败:', error)
    return {
      success: false,
      code: 500,
      message: '获取作品列表失败',
      error: error.message,
      data: []
    }
  }
}

