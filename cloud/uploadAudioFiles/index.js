// 导入云开发SDK
const cloud = require('wx-server-sdk')

// 初始化云开发环境，使用项目中配置的环境
cloud.init({
  env: 'cloud1-2gxal8as6b6bfe21'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const fileID = event.fileID
  const fileName = event.fileName
  const soundType = event.soundType
  
  try {
    // 复制文件到音频资源目录，添加时间戳前缀避免文件名冲突
    const timestamp = new Date().getTime();
    const targetCloudPath = `audio/${timestamp}_${fileName}`;
    
    console.log('准备复制文件:', {
      sourceFileID: fileID,
      targetCloudPath: targetCloudPath,
      fileName: fileName,
      soundType: soundType
    });
    
    const result = await cloud.copyFile({
      cloudPath: targetCloudPath,
      fileID: fileID
    })
    
    console.log('文件复制成功:', result);
    
    // 将音频资源信息保存到数据库
    const db = cloud.database()
    await db.collection('audio_resources').add({
      data: {
        fileName: fileName,
        fileID: result.fileID,
        soundType: soundType,
        createTime: db.serverDate(),
        createBy: wxContext.OPENID
      }
    })
    
    return {
      success: true,
      fileID: result.fileID,
      message: '音频上传成功'
    }
  } catch (error) {
    console.error('音频上传失败详情：', {
      errorType: error.name,
      errorMessage: error.message,
      stack: error.stack,
      fileID: fileID,
      fileName: fileName,
      soundType: soundType
    })
    
    // 根据不同错误类型返回更具体的错误信息
    let detailedMessage = '音频上传失败';
    
    if (error.code === 'storage.copyFile.fail') {
      detailedMessage = '文件复制失败，请检查云存储权限';
    } else if (error.code === 'database.collection.add.fail') {
      detailedMessage = '数据库保存失败，请检查数据库配置';
    }
    
    return {
      success: false,
      message: detailedMessage,
      error: error.message,
      errorCode: error.code
    }
  }
}