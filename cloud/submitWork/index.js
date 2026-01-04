// cloud/submitWork/index.js
// 学生提交作品云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  // 从 event 中获取作品数据
  const {
    activityId,      // 活动ID
    title,           // 作品标题
    description,     // 作品描述
    fileID,          // 云存储文件ID
    fileName,        // 文件名
    fileType,        // 文件类型 (document/image/audio/video)
    fileSize         // 文件大小（字节）
  } = event

  // 参数验证
  if (!activityId) {
    return {
      success: false,
      code: 400,
      message: '活动ID不能为空'
    }
  }

  if (!title || !title.trim()) {
    return {
      success: false,
      code: 400,
      message: '作品标题不能为空'
    }
  }

  if (title.trim().length < 2) {
    return {
      success: false,
      code: 400,
      message: '作品标题至少需要2个字符'
    }
  }

  if (!fileID) {
    return {
      success: false,
      code: 400,
      message: '文件ID不能为空，请先上传文件'
    }
  }

  if (!fileType || !['document', 'image', 'audio', 'video'].includes(fileType)) {
    return {
      success: false,
      code: 400,
      message: '文件类型无效，必须是 document/image/audio/video 之一'
    }
  }

  try {
    // 1. 检查活动是否存在
    const activityRes = await db.collection('activities').doc(activityId).get()
    if (!activityRes.data) {
      return {
        success: false,
        code: 404,
        message: '活动不存在'
      }
    }

    const activity = activityRes.data

    // 2. 检查活动状态（只有进行中的活动可以提交作品）
    if (activity.statusType !== 'running' && activity.status !== 'running') {
      return {
        success: false,
        code: 400,
        message: '该活动当前不允许提交作品，请确认活动状态'
      }
    }

    // 3. 检查该学生是否已经为该活动提交过作品（每个活动每人只能提交1个作品）
    const existingWorkRes = await db.collection('works')
      .where({
        activityId: activityId,
        studentId: openid,
        status: _.neq('deleted') // 排除已删除的作品
      })
      .get()

    if (existingWorkRes.data && existingWorkRes.data.length > 0) {
      return {
        success: false,
        code: 400,
        message: '您已经为该活动提交过作品，每个活动只能提交1个作品',
        data: {
          existingWorkId: existingWorkRes.data[0]._id
        }
      }
    }

    // 4. 准备作品数据
    const workData = {
      // 基本信息
      activityId: activityId,
      activityTitle: activity.theme || activity.title || '未命名活动',
      title: title.trim(),
      description: description ? description.trim() : '',
      
      // 文件信息
      fileID: fileID,           // 云存储文件ID
      fileName: fileName || '未命名文件',
      fileType: fileType,       // document/image/audio/video
      fileSize: fileSize || 0,  // 文件大小（字节）
      
      // 学生信息
      studentId: openid,        // 学生openid
      studentName: event.studentName || '学生', // 学生姓名（可选）
      
      // 状态信息
      status: 'pending',        // pending: 待评审, reviewing: 评审中, approved: 已通过, rejected: 已拒绝
      statusText: '待评审',
      
      // 评分信息（初始为空）
      scores: [],               // 评分列表 [{ judgeId, judgeName, score, comment, time }]
      totalScore: 0,            // 总分
      averageScore: 0,          // 平均分
      judgeCount: 0,            // 评委数量
      
      // 获奖信息（初始为空）
      awardLevel: null,         // 获奖等级
      awardName: null,          // 获奖名称
      
      // 时间信息
      submittedAt: db.serverDate(), // 提交时间
      createdAt: db.serverDate(),   // 创建时间
      updatedAt: db.serverDate()     // 更新时间
    }

    // 5. 保存作品到数据库
    const result = await db.collection('works').add({
      data: workData
    })

    if (result._id) {
      // 6. 更新活动的作品数量统计
      await db.collection('activities').doc(activityId).update({
        data: {
          workCount: _.inc(1),  // 作品数量+1
          updatedAt: db.serverDate()
        }
      })

      return {
        success: true,
        code: 200,
        message: '作品提交成功',
        data: {
          workId: result._id,
          ...workData
        }
      }
    } else {
      return {
        success: false,
        code: 500,
        message: '作品提交失败，未返回作品ID'
      }
    }
  } catch (error) {
    console.error('提交作品失败:', error)
    
    // 处理集合不存在的错误
    if (error.errCode === -502005 || error.message.includes('collection not exist')) {
      return {
        success: false,
        code: 500,
        message: '数据库集合不存在，请在云开发控制台创建 works 和 activities 集合',
        error: '集合不存在，请先在云开发控制台的数据库中手动创建相关集合'
      }
    }
    
    return {
      success: false,
      code: 500,
      message: '提交作品时发生错误',
      error: error.message || error.errMsg || '未知错误'
    }
  }
}

