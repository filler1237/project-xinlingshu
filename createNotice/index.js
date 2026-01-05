// cloud/createNotice/index.js
// 创建通知云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 从 event 中获取通知数据
  const {
    title,          // 通知标题
    content,        // 通知内容
    targetType      // 发布对象类型 (all: 全体学生, participants: 活动参与者)
  } = event

  // 参数验证
  if (!title || !title.trim()) {
    return {
      success: false,
      code: 400,
      message: '通知标题不能为空'
    }
  }

  if (title.trim().length < 2) {
    return {
      success: false,
      code: 400,
      message: '通知标题至少需要2个字符'
    }
  }

  if (!content || !content.trim()) {
    return {
      success: false,
      code: 400,
      message: '通知内容不能为空'
    }
  }

  if (content.trim().length < 10) {
    return {
      success: false,
      code: 400,
      message: '通知内容至少需要10个字符'
    }
  }

  if (!targetType || !['all', 'participants'].includes(targetType)) {
    return {
      success: false,
      code: 400,
      message: '发布对象类型无效，必须是 all 或 participants'
    }
  }

  try {
    // 准备通知数据
    const noticeData = {
      // 基本信息
      title: title.trim(),
      content: content.trim(),
      targetType: targetType, // all: 全体学生, participants: 活动参与者
      
      // 发布信息
      publisherId: wxContext.OPENID, // 发布者openid
      publisherName: event.publisherName || '管理员', // 发布者名称
      
      // 时间信息
      createdAt: db.serverDate(), // 创建时间（服务器时间）
      publishTime: new Date().toISOString(), // 发布时间（ISO格式）
      
      // 状态信息
      status: 'published', // published: 已发布, draft: 草稿, deleted: 已删除
      isRead: false, // 是否已读（用于学生端）
      
      // 统计信息
      readCount: 0, // 已读人数
      totalTarget: 0, // 目标人数（如果是participants，需要统计参与人数）
      
      // 其他信息
      priority: event.priority || 'normal', // 优先级: high, normal, low
      category: event.category || 'general' // 分类: general, activity, system
    }

    // 如果是发送给活动参与者，可以在这里添加活动ID
    if (targetType === 'participants' && event.activityId) {
      noticeData.activityId = event.activityId
    }

    // 添加到数据库（集合会在第一次写入时自动创建）
    const result = await db.collection('notices').add({
      data: noticeData
    })

    if (result._id) {
      return {
        success: true,
        code: 200,
        message: '通知发布成功',
        data: {
          id: result._id,
          noticeId: result._id,
          ...noticeData
        }
      }
    } else {
      return {
        success: false,
        code: 500,
        message: '通知发布失败，未返回通知ID'
      }
    }
  } catch (error) {
    console.error('发布通知失败:', error)
    
    // 处理集合不存在的错误
    if (error.errCode === -502005 || error.message.includes('collection not exist')) {
      return {
        success: false,
        code: 500,
        message: '数据库集合不存在，请在云开发控制台创建 notices 集合，或检查云环境配置',
        error: '集合 notices 不存在，请先在云开发控制台的数据库中手动创建该集合'
      }
    }
    
    return {
      success: false,
      code: 500,
      message: '发布通知时发生错误',
      error: error.message || error.errMsg || '未知错误'
    }
  }
}

