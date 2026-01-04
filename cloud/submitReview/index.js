// cloud/submitReview/index.js
// 提交评审评分云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const judgeId = wxContext.OPENID
  
  // 获取参数
  const {
    workId,        // 作品ID
    scores,         // 评分对象 { criterion1: score1, criterion2: score2, ... }
    totalScore,     // 总分
    comment,        // 评语
    judgeName       // 评委姓名（可选）
  } = event

  // 参数验证
  if (!workId) {
    return {
      success: false,
      code: 400,
      message: '作品ID不能为空'
    }
  }

  if (!scores || typeof scores !== 'object') {
    return {
      success: false,
      code: 400,
      message: '评分数据不能为空'
    }
  }

  if (totalScore === undefined || totalScore === null) {
    return {
      success: false,
      code: 400,
      message: '总分不能为空'
    }
  }

  try {
    // 1. 获取作品信息
    const workRes = await db.collection('works').doc(workId).get()
    if (!workRes.data) {
      return {
        success: false,
        code: 404,
        message: '作品不存在'
      }
    }

    const work = workRes.data

    // 2. 获取活动信息（用于获取评分细则）
    const activityRes = await db.collection('activities').doc(work.activityId).get()
    const activity = activityRes.data || {}
    const scoreRules = activity.scoreRules || []

    // 3. 检查是否已经评审过
    const existingScores = work.scores || []
    const existingReview = existingScores.find(s => s.judgeId === judgeId)
    
    // 4. 构建评分数据
    const reviewData = {
      judgeId: judgeId,
      judgeName: judgeName || '评委',
      scores: scores,  // 各维度评分
      totalScore: parseFloat(totalScore) || 0,
      comment: comment ? comment.trim() : '',
      time: db.serverDate()
    }

    // 5. 更新作品的评分列表
    let updatedScores = [...existingScores]
    if (existingReview) {
      // 如果已评审过，更新评分
      const index = updatedScores.findIndex(s => s.judgeId === judgeId)
      if (index >= 0) {
        updatedScores[index] = reviewData
      }
    } else {
      // 如果未评审过，添加新评分
      updatedScores.push(reviewData)
    }

    // 6. 计算总分和平均分
    const totalScores = updatedScores.map(s => s.totalScore || 0)
    const sum = totalScores.reduce((a, b) => a + b, 0)
    const average = updatedScores.length > 0 ? sum / updatedScores.length : 0

    // 7. 更新作品数据
    const updateData = {
      scores: updatedScores,
      totalScore: sum,
      averageScore: parseFloat(average.toFixed(2)),
      judgeCount: updatedScores.length,
      updatedAt: db.serverDate()
    }

    // 如果所有评委都评审完成，更新状态
    // 这里可以根据需要设置评审完成的条件
    // 例如：如果评委数量达到要求，将状态改为 reviewing 或 approved

    await db.collection('works').doc(workId).update({
      data: updateData
    })

    return {
      success: true,
      code: 200,
      message: '评审提交成功',
      data: {
        workId: workId,
        reviewData: reviewData,
        totalScore: sum,
        averageScore: average,
        judgeCount: updatedScores.length
      }
    }
  } catch (error) {
    console.error('提交评审失败:', error)
    return {
      success: false,
      code: 500,
      message: '提交评审时发生错误',
      error: error.message || error.errMsg || '未知错误'
    }
  }
}

