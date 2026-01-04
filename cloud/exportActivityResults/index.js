// cloud/exportActivityResults/index.js
// 导出活动结果云函数（生成Excel文件）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 获取参数
  const {
    activityId  // 活动ID
  } = event

  // 参数验证
  if (!activityId) {
    return {
      success: false,
      code: 400,
      message: '活动ID不能为空'
    }
  }

  try {
    // 1. 获取活动信息
    const activityRes = await db.collection('activities').doc(activityId).get()
    if (!activityRes.data) {
      return {
        success: false,
        code: 404,
        message: '活动不存在'
      }
    }

    const activity = activityRes.data

    // 2. 获取该活动的所有作品，只获取有评分的作品（judgeCount > 0 且 averageScore > 0）
    const worksRes = await db.collection('works')
      .where({
        activityId: activityId,
        status: _.neq('deleted')
      })
      .get()

    // 过滤出有评分的作品（至少有一个评委评分）
    let works = (worksRes.data || []).filter(work => {
      // 有评分：judgeCount > 0 且 averageScore > 0
      return work.judgeCount > 0 && work.averageScore > 0
    })
    
    // 如果没有有评分的作品，返回错误
    if (works.length === 0) {
      return {
        success: false,
        code: 400,
        message: '该活动暂无已评分的作品，无法导出'
      }
    }
    
    // 按平均分降序排列
    works = works.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))

    // 3. 获取学生信息（查询学号）
    const studentIds = [...new Set(works.map(w => w.studentId).filter(id => id))]
    let studentsMap = {}
    
    // 从users集合查询学生信息（获取学号）
    if (studentIds.length > 0) {
      try {
        const usersRes = await db.collection('users')
          .where({
            _openid: db.command.in(studentIds)
          })
          .get()
        
        usersRes.data.forEach(user => {
          studentsMap[user._openid] = {
            studentId: user.studentId || user.studentNo || user._openid, // 学号
            name: user.name || user.nickName || user.username
          }
        })
      } catch (error) {
        console.error('查询学生信息失败:', error);
        // 如果查询失败，继续使用works中的信息
      }
    }

    // 4. 处理作品数据，计算获奖等级
    const processedData = works.map((work, index) => {
      // 根据平均分和排名确定获奖等级
      let awardLevel = null
      let awardName = null
      
      // 如果有获奖规则，根据规则计算
      if (activity.awardRules && activity.awardRules.length > 0) {
        const totalWorks = works.length
        const rank = index + 1
        const percentage = (rank / totalWorks) * 100
        
        // 按获奖规则匹配
        for (const rule of activity.awardRules) {
          const ruleRatio = parseFloat(rule.ratio || rule.percentage || 0)
          if (percentage <= ruleRatio) {
            awardLevel = rule.level || rule.name
            awardName = rule.name || rule.level
            break
          }
        }
      }
      
      // 如果没有获奖规则，根据分数区间判断（可选）
      if (!awardLevel && work.averageScore > 0) {
        const scoreRatio = (work.averageScore / (activity.totalScore || 100)) * 100
        if (scoreRatio >= 90) {
          awardLevel = '一等奖'
          awardName = '一等奖'
        } else if (scoreRatio >= 80) {
          awardLevel = '二等奖'
          awardName = '二等奖'
        } else if (scoreRatio >= 70) {
          awardLevel = '三等奖'
          awardName = '三等奖'
        } else if (scoreRatio >= 60) {
          awardLevel = '优秀奖'
          awardName = '优秀奖'
        }
      }

      // 获取学生信息
      const studentInfo = studentsMap[work.studentId] || {}
      
      return {
        studentId: studentInfo.studentId || work.studentId || '', // 学号
        studentName: work.studentName || studentInfo.name || '学生',
        workName: work.title || '未命名作品',
        averageScore: work.averageScore || 0,
        totalScore: work.totalScore || 0,
        awardLevel: awardLevel || work.awardLevel || '未获奖',
        awardName: awardName || work.awardName || '未获奖',
        rank: index + 1,
        judgeCount: work.judgeCount || 0
      }
    })

    // 5. 生成CSV格式数据（微信小程序不支持直接生成Excel，使用CSV格式）
    // CSV格式可以在Excel中打开
    const csvHeaders = ['排名', '学号', '学生姓名', '作品名称', '平均分', '总分', '获奖等级', '评委数量']
    const csvRows = processedData.map(item => [
      item.rank,
      item.studentId || '',
      item.studentName,
      item.workName,
      item.averageScore.toFixed(2),
      item.totalScore.toFixed(2),
      item.awardLevel,
      item.judgeCount
    ])

    // 生成CSV内容
    let csvContent = '\uFEFF' // BOM，确保中文正确显示
    csvContent += csvHeaders.join(',') + '\n'
    csvRows.forEach(row => {
      // 处理包含逗号或引号的字段
      const escapedRow = row.map(cell => {
        const cellStr = String(cell || '')
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      })
      csvContent += escapedRow.join(',') + '\n'
    })

    // 6. 将CSV文件上传到云存储
    const fileName = `${activity.theme || activity.title || '活动'}_结果_${new Date().getTime()}.csv`
    const cloudPath = `exports/${fileName}`
    
    // 将CSV内容转换为Buffer
    const buffer = Buffer.from(csvContent, 'utf8')
    
    // 上传到云存储（使用云存储API）
    try {
      // 使用云存储API上传文件
      const uploadRes = await cloud.uploadFile({
        cloudPath: cloudPath,
        fileContent: buffer
      })
      
      if (!uploadRes || !uploadRes.fileID) {
        // 如果上传失败，返回CSV内容让前端处理
        return {
          success: true,
          code: 200,
          message: '导出成功（请下载）',
          data: {
            fileName: fileName,
            csvContent: csvContent, // 直接返回CSV内容
            activityName: activity.theme || activity.title,
            totalCount: processedData.length,
            exportTime: new Date().toISOString(),
            needDownload: true // 标记需要前端下载
          }
        }
      }
      
      return {
        success: true,
        code: 200,
        message: '导出成功',
        data: {
          fileID: uploadRes.fileID,
          fileName: fileName,
          downloadUrl: uploadRes.fileID,
          activityName: activity.theme || activity.title,
          totalCount: processedData.length,
          exportTime: new Date().toISOString()
        }
      }
    } catch (uploadError) {
      console.error('文件上传失败，返回CSV内容:', uploadError);
      // 上传失败时，返回CSV内容让前端处理
      return {
        success: true,
        code: 200,
        message: '导出成功（请下载）',
        data: {
          fileName: fileName,
          csvContent: csvContent, // 直接返回CSV内容
          activityName: activity.theme || activity.title,
          totalCount: processedData.length,
          exportTime: new Date().toISOString(),
          needDownload: true // 标记需要前端下载
        }
      }
    }
  } catch (error) {
    console.error('导出活动结果失败:', error)
    return {
      success: false,
      code: 500,
      message: '导出失败',
      error: error.message || error.errMsg || '未知错误'
    }
  }
}

