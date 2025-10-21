// 导入云开发SDK
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: 'cloud1-2gxal8as6b6bfe21'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const action = event.action || 'getList'
  const fileID = event.fileID
  const soundType = event.soundType
  
  try {
    switch (action) {
      case 'getList':
        // 获取音频资源列表
        let query = db.collection('audio_resources')
        
        // 如果指定了声音类型，则按类型过滤
        if (soundType) {
          query = query.where({
            soundType: soundType
          })
        }
        
        const result = await query.orderBy('createTime', 'desc').get()
        
        return {
          success: true,
          data: result.data
        }
        
      case 'delete':
        // 删除音频资源
        if (!fileID) {
          return {
            success: false,
            message: '缺少文件ID参数'
          }
        }
        
        // 先查询文件信息
        const fileInfo = await db.collection('audio_resources')
          .where({
            fileID: fileID
          })
          .get()
        
        if (fileInfo.data.length === 0) {
          return {
            success: false,
            message: '未找到指定的音频资源'
          }
        }
        
        // 删除云存储中的文件
        await cloud.deleteFile({
          fileList: [fileID]
        })
        
        // 删除数据库中的记录
        await db.collection('audio_resources')
          .where({
            fileID: fileID
          })
          .remove()
        
        return {
          success: true,
          message: '音频资源删除成功'
        }
        
      default:
        return {
          success: false,
          message: '不支持的操作类型'
        }
    }
  } catch (error) {
    console.error('操作失败详情：', error)
    
    let detailedMessage = '操作失败'
    if (error.code === 'storage.deleteFile.fail') {
      detailedMessage = '删除云存储文件失败'
    } else if (error.code === 'database.collection.get.fail' || error.code === 'database.collection.remove.fail') {
      detailedMessage = '数据库操作失败'
    }
    
    return {
      success: false,
      message: detailedMessage,
      error: error.message,
      errorCode: error.code
    }
  }
}