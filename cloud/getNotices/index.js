// cloud/getNotices/index.js
// 获取通知列表云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 获取参数
  const {
    activityId,    // 可选：按活动ID筛选
    targetType,    // 可选：筛选发布对象 (all/participants)
    page = 1,      // 页码，默认1
    pageSize = 20  // 每页数量，默认20
  } = event

  try {
    // 构建查询条件
    let query = db.collection('notices')
      .where({
        status: 'published'  // 只获取已发布的通知
      })
    
    // 如果指定了活动ID筛选
    if (activityId) {
      query = query.where({
        activityId: activityId
      })
    }
    
    // 如果指定了发布对象类型筛选
    if (targetType && targetType !== 'all') {
      query = query.where({
        targetType: targetType
      })
    }
    
    // 查询通知列表，按发布时间倒序
    const result = await query
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    // 处理通知数据
    const notices = result.data.map(notice => {
      // 格式化时间
      let publishTimeText = '';
      if (notice.publishTime) {
        const date = new Date(notice.publishTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        publishTimeText = `${year}-${month}-${day} ${hour}:${minute}`;
      }
      
      return {
        id: notice._id,
        _id: notice._id,
        title: notice.title || '未命名通知',
        content: notice.content || '',
        targetType: notice.targetType || 'all',
        targetTypeText: notice.targetType === 'participants' ? '活动参与者' : '全体学生',
        publisherName: notice.publisherName || '管理员',
        publishTime: notice.publishTime,
        publishTimeText: publishTimeText,
        createdAt: notice.createdAt,
        priority: notice.priority || 'normal',
        category: notice.category || 'general',
        activityId: notice.activityId || null,
        readCount: notice.readCount || 0
      }
    })
    
    // 获取总数（用于分页）
    let countQuery = db.collection('notices').where({
      status: 'published'
    })
    
    if (activityId) {
      countQuery = countQuery.where({ activityId: activityId })
    }
    if (targetType && targetType !== 'all') {
      countQuery = countQuery.where({ targetType: targetType })
    }
    
    const countResult = await countQuery.count()
    
    return {
      success: true,
      code: 200,
      data: notices,
      total: countResult.total,
      page: page,
      pageSize: pageSize
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    return {
      success: false,
      code: 500,
      message: '获取通知列表失败',
      error: error.message,
      data: []
    }
  }
}

