const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { fileID, fileName, soundType } = event;
  const { OPENID } = cloud.getWXContext();

  if (!fileID || !fileName || !soundType) {
    return {
      success: false,
      message: '缺少必要的参数（fileID, fileName, soundType）',
    };
  }

  try {
    // 1. 将文件从临时存储移动到永久存储
    // 为了防止文件名重复，我们可以在前面加上用户ID和时间戳
    const permanentPath = `audio/${soundType}/${OPENID}_${Date.now()}_${fileName}`;
    
    const moveResult = await cloud.moveFile({
      fileList: [{
        fileID: fileID,
        toPath: permanentPath,
      }],
    });

    if (moveResult.fileList.length === 0 || moveResult.fileList[0].status !== 0) {
      console.error('文件移动失败', moveResult);
      throw new Error('文件移动到永久存储失败');
    }

    const newFileID = moveResult.fileList[0].fileID;

    // 2. 将音频信息存入数据库
    await db.collection('audio_resources').add({
      data: {
        _openid: OPENID,
        fileID: newFileID,
        fileName: fileName,
        soundType: soundType,
        createTime: db.serverDate(),
      },
    });

    return {
      success: true,
      message: '音频上传并保存成功',
      fileID: newFileID,
    };

  } catch (error) {
    console.error('上传音频时发生错误', error);
    return {
      success: false,
      message: '上传失败，请查看云函数日志',
      error: error.message,
    };
  }
};
