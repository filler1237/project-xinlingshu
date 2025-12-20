// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userOpenid = wxContext.OPENID
  const { targetId, targetType, targetCollection, targetContent, targetUserId, reason } = event

  // 参数校验
  if (!targetId || !targetType || !targetCollection || !reason) {
    return { code: -1, msg: '缺少必要参数' }
  }

  try {
    // 1. 查询是否已有该内容的举报记录
    const existingReport = await db.collection('reports').where({
      targetId: targetId
    }).get()

    if (existingReport.data.length > 0) {
      // 该内容已被举报过
      const report = existingReport.data[0]

      // 2. 检查当前用户是否已经举报过
      const alreadyReported = report.reporters && report.reporters.some(r => r.openid === userOpenid)

      if (alreadyReported) {
        return { code: -2, msg: '您已举报过该内容，请勿重复提交' }
      }

      // 3. 用户未举报过，追加该用户的举报信息，并增加计数
      await db.collection('reports').doc(report._id).update({
        data: {
          reportCount: _.inc(1),
          reporters: _.push({
            openid: userOpenid,
            reason: reason,
            time: db.serverDate()
          }),
          updateTime: db.serverDate()
        }
      })

      return { code: 0, msg: '举报成功，我们会尽快处理' }

    } else {
      // 4. 该内容首次被举报，创建新记录
      await db.collection('reports').add({
        data: {
          targetId: targetId,
          targetType: targetType,
          targetCollection: targetCollection,
          targetContent: targetContent || '',
          targetUserId: targetUserId || '',
          reportCount: 1,
          reporters: [{
            openid: userOpenid,
            reason: reason,
            time: db.serverDate()
          }],
          status: 'pending',
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })

      return { code: 0, msg: '举报成功，我们会尽快处理' }
    }

  } catch (err) {
    console.error('举报失败:', err)
    return { code: -1, msg: '举报失败，请稍后重试' }
  }
}