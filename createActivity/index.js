// cloud/createActivity/index.js
// 创建活动云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 从 event 中获取活动数据
  const {
    theme,              // 活动主题
    startTime,          // 开始时间
    endTime,            // 结束时间
    description,        // 活动描述
    scoreRules,         // 评分细则
    awardRules          // 获奖比例规则
  } = event

  // 参数验证
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

  // 验证评分细则
  if (!scoreRules || !Array.isArray(scoreRules) || scoreRules.length === 0) {
    return {
      success: false,
      code: 400,
      message: '至少需要设置一个评分细则'
    }
  }

  // 验证评分细则总分
  const totalScore = scoreRules.reduce((sum, rule) => {
    return sum + (parseInt(rule.maxScore) || 0)
  }, 0)
  
  if (totalScore <= 0) {
    return {
      success: false,
      code: 400,
      message: '评分细则总分必须大于0'
    }
  }

  // 验证获奖比例
  if (!awardRules || !Array.isArray(awardRules) || awardRules.length === 0) {
    return {
      success: false,
      code: 400,
      message: '至少需要设置一个获奖等级'
    }
  }

  // 验证获奖比例总和（应该不超过1，即100%）
  const totalQuota = awardRules.reduce((sum, rule) => {
    return sum + (parseFloat(rule.quota) || 0)
  }, 0)
  
  if (totalQuota > 1) {
    return {
      success: false,
      code: 400,
      message: '获奖比例总和不能超过100%'
    }
  }

  try {
    // 准备活动数据
    const activityData = {
      // 基本信息
      theme: theme.trim(),
      title: theme.trim(), // 兼容字段
      startTime: startTime,
      endTime: endTime,
      description: description ? description.trim() : '',
      
      // 评分细则
      scoreRules: scoreRules.map(rule => ({
        name: rule.name ? rule.name.trim() : '',
        maxScore: parseInt(rule.maxScore) || 0,
        description: rule.description ? rule.description.trim() : ''
      })),
      totalScore: totalScore, // 总分
      
      // 获奖比例规则
      awardRules: awardRules.map(rule => ({
        level: rule.level ? rule.level.trim() : '',
        minScore: parseFloat(rule.minScore) || 0,
        quota: parseFloat(rule.quota) || 0
      })),
      
      // 活动状态（默认为未开始）
      status: 'notStarted',
      statusType: 'notStarted',
      statusText: '未开始',
      manualStatus: false, // 是否手动设置状态
      
      // 系统信息
      _openid: wxContext.OPENID, // 创建者openid
      createdAt: db.serverDate(), // 创建时间
      updatedAt: db.serverDate(), // 更新时间
      createdBy: wxContext.OPENID,
      
      // 统计信息
      participantCount: 0, // 参与人数
      workCount: 0, // 作品数量
      
      // 其他字段（可选）
      allowedUploadTypes: event.allowedUploadTypes || ['document', 'image'], // 允许上传的类型
      isActive: true // 是否激活
    }

    // 添加到数据库（集合会在第一次写入时自动创建）
    const result = await db.collection('activities').add({
      data: activityData
    })

    if (result._id) {
      return {
        success: true,
        code: 200,
        message: '活动创建成功',
        data: {
          id: result._id,
          ...activityData
        }
      }
    } else {
      return {
        success: false,
        code: 500,
        message: '活动创建失败，未返回活动ID'
      }
    }
  } catch (error) {
    console.error('创建活动失败:', error)
    
    // 处理集合不存在的错误
    if (error.errCode === -502005 || error.message.includes('collection not exist')) {
      return {
        success: false,
        code: 500,
        message: '数据库集合不存在，请在云开发控制台创建 activities 集合，或检查云环境配置',
        error: '集合 activities 不存在，请先在云开发控制台的数据库中手动创建该集合'
      }
    }
    
    return {
      success: false,
      code: 500,
      message: '创建活动时发生错误',
      error: error.message || error.errMsg || '未知错误'
    }
  }
}

