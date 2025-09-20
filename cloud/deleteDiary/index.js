// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { diaryId } = event

  console.log('删除日记请求:', { diaryId, openid: wxContext.OPENID })

  try {
    if (!diaryId) {
      return {
        success: false,
        error: '缺少日记ID'
      }
    }

    // 先查询日记是否存在且属于当前用户
    const diaryResult = await db.collection('DiaryEntries').doc(diaryId).get()
    
    if (!diaryResult.data) {
      return {
        success: false,
        error: '日记不存在'
      }
    }

    // 检查权限：只有日记作者才能删除
    if (diaryResult.data.userId !== wxContext.OPENID) {
      return {
        success: false,
        error: '无权限删除此日记'
      }
    }

    // 删除日记
    const deleteResult = await db.collection('DiaryEntries').doc(diaryId).remove()
    
    console.log('删除结果:', deleteResult)

    return {
      success: true,
      data: deleteResult,
      message: '删除成功'
    }

  } catch (error) {
    console.error('删除日记失败:', error)
    return {
      success: false,
      error: error.message || '删除失败'
    }
  }
}
