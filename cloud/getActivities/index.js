// cloud/getActivities/index.js
// 获取活动列表云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 获取参数
  const {
    status,        // 可选：筛选状态 (notStarted, running, ended)
    page = 1,      // 页码，默认1
    pageSize = 100 // 每页数量，默认100
  } = event

  try {
    console.log('📥 获取活动列表，参数:', { status, page, pageSize })
    
    // 构建查询条件
    let query = db.collection('activities')
    
    // 查询所有活动（不筛选状态），完全使用数据库中的状态
    // 查询活动列表，按创建时间倒序
    const result = await query
      .orderBy('createdAt', 'desc')
      .get()
    
    console.log(`📊 数据库查询结果: ${result.data.length} 个活动`)
    
    // 处理数据，完全使用数据库中的状态，不自动判断
    // 确保页面显示与数据库完全同步
    let activities = result.data.map(activity => {
      // 直接使用数据库中的状态，不做任何自动判断
      const finalStatusType = activity.statusType || activity.status || 'notStarted'
      const finalStatusText = activity.statusText || 
        (finalStatusType === 'running' ? '进行中' : 
         finalStatusType === 'ended' ? '已结束' : '未开始')
      
      return {
        id: activity._id, // 使用 _id 作为 id
        _id: activity._id,
        theme: activity.theme || activity.title || '未命名活动',
        title: activity.title || activity.theme || '未命名活动',
        description: activity.description || '',
        startTime: activity.startTime || '',
        endTime: activity.endTime || '',
        status: finalStatusType,
        statusType: finalStatusType,
        statusText: finalStatusText,
        manualStatus: activity.manualStatus || false,
        scoreRules: activity.scoreRules || [],
        awardRules: activity.awardRules || [],
        participantCount: activity.participantCount || 0,
        workCount: activity.workCount || 0,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        organizer: activity.organizer || '心理健康中心',
        allowedUploadTypes: activity.allowedUploadTypes || ['document', 'image'],
        totalScore: activity.totalScore || 100
      }
    })
    
    // 如果指定了状态筛选，过滤出对应状态的活动
    let filteredActivities = activities
    if (status && status !== 'all') {
      const beforeFilter = activities.length
      filteredActivities = activities.filter(a => a.statusType === status)
      console.log(`🔍 状态筛选: ${status}, 筛选前: ${beforeFilter}, 筛选后: ${filteredActivities.length}`)
    }
    
    // 计算总数（筛选后的总数）
    const total = filteredActivities.length
    
    // 分页处理
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const pagedActivities = filteredActivities.slice(startIndex, endIndex)
    
    console.log(`✅ 返回活动数量: ${pagedActivities.length}, 总数: ${total}, 当前页: ${page}`)
    
    return {
      success: true,
      code: 200,
      data: pagedActivities,
      total: total,
      page: page,
      pageSize: pageSize
    }
  } catch (error) {
    console.error('获取活动列表失败:', error)
    return {
      success: false,
      code: 500,
      message: '获取活动列表失败',
      error: error.message,
      data: []
    }
  }
}



