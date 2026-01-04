// cloud/getStudentWorks/index.js
// 获取学生作品列表（包含评分信息）云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const studentId = wxContext.OPENID
  
  // 获取参数
  const {
    workId,      // 可选：指定作品ID
    page = 1,    // 页码，默认1
    pageSize = 100 // 每页数量，默认100
  } = event

  try {
    let works = []
    
    // 如果指定了作品ID，只获取该作品
    if (workId) {
      try {
        const workRes = await db.collection('works').doc(workId).get()
        if (workRes.data && workRes.data.studentId === studentId) {
          works = [workRes.data]
        } else {
          return {
            success: false,
            code: 404,
            message: '作品不存在或无权访问',
            data: []
          }
        }
      } catch (error) {
        return {
          success: false,
          code: 500,
          message: '查询作品失败',
          error: error.message,
          data: []
        }
      }
    } else {
      // 查询所有作品（不指定ID时）
      const result = await db.collection('works')
        .where({
          studentId: studentId,  // 只获取当前学生的作品
          status: _.neq('deleted') // 排除已删除的作品
        })
        .orderBy('submittedAt', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()
      
      works = result.data || []
    }
    
    if (works.length === 0) {
      return {
        success: true,
        code: 200,
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize
      }
    }
    
    // 获取活动信息
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
    
    // 格式化时间函数
    const formatTime = (timeValue) => {
      if (!timeValue) return '';
      try {
        let date;
        if (timeValue instanceof Date) {
          date = timeValue;
        } else if (typeof timeValue === 'object' && timeValue.constructor && timeValue.constructor.name === 'Date') {
          date = new Date(timeValue);
        } else {
          date = new Date(timeValue);
        }
        
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      } catch (error) {
        console.error('时间格式化失败:', error);
        return '';
      }
    };
    
    // 处理作品数据，格式化评分信息
    const processedWorks = works.map(work => {
      const activity = activitiesMap[work.activityId] || {}
      
      // 格式化评分数据
      const formattedScores = (work.scores || []).map(score => {
        // 将 scores 对象转换为 criteria 数组格式
        const criteria = []
        if (score.scores && typeof score.scores === 'object') {
          Object.keys(score.scores).forEach(key => {
            criteria.push({
              name: key,
              score: score.scores[key]
            })
          })
        }
        
        return {
          judgeId: score.judgeId,
          judgeName: score.judgeName || '评委',
          judgeRole: '专业评委',
          totalScore: score.totalScore || 0,
          maxScore: activity.totalScore || 100,
          criteria: criteria,
          comment: score.comment || ''
        }
      })
      
      const submitTimeText = formatTime(work.submittedAt);
      const updateTimeText = formatTime(work.updatedAt);
      
      // 确定状态
      let status = work.status || 'pending';
      if (work.judgeCount > 0 && work.averageScore > 0) {
        status = 'completed'; // 有评分，视为已完成
      } else if (work.status === 'pending' && work.judgeCount === 0) {
        status = 'submitted'; // 已提交但未评审
      } else if (work.status === 'pending' && work.judgeCount > 0) {
        status = 'reviewing'; // 部分评委已评审
      }
      
      return {
        id: work._id,
        _id: work._id,
        activityName: activity.theme || activity.title || work.activityTitle || '未知活动',
        submitTime: submitTimeText,
        updateTime: updateTimeText || submitTimeText,
        workTitle: work.title || '未命名作品',
        workContent: work.description || '',
        status: status,
        finalScore: work.averageScore || work.totalScore || null,
        maxScore: activity.totalScore || 100,
        rank: null,
        certificateAvailable: status === 'completed' && work.averageScore > 0,
        scores: formattedScores,
        attachments: work.fileID ? [{
          id: 1,
          name: work.fileName || '作品文件',
          type: work.fileType || 'file',
          size: work.fileSize ? `${(work.fileSize / 1024 / 1024).toFixed(2)}MB` : '未知',
          url: work.fileID,
          fileID: work.fileID
        }] : [],
        activityId: work.activityId,
        studentId: work.studentId,
        studentName: work.studentName,
        totalScore: work.totalScore || 0,
        averageScore: work.averageScore || 0,
        judgeCount: work.judgeCount || 0
      }
    })
    
    return {
      success: true,
      code: 200,
      data: processedWorks,
      total: processedWorks.length,
      page: page,
      pageSize: pageSize
    }
  } catch (error) {
    console.error('获取学生作品列表失败:', error)
    return {
      success: false,
      code: 500,
      message: '获取作品列表失败',
      error: error.message,
      data: []
    }
  }
}
