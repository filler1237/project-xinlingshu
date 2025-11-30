const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 内容安全检查云函数
exports.main = async (event, context) => {
  const { text, fileID } = event;

  try {
    // 1. 文本内容安全检查
    if (text) {
      const textResult = await cloud.openapi.security.msgSecCheck({
        content: text
      });
      if (textResult.errCode !== 0) {
        return { pass: false, reason: '文本内容违规' };
      }
    }

    // 2. 图片内容安全检查 (使用 fileID)
    if (fileID) {
      const fileBuffer = await cloud.downloadFile({
        fileID: fileID,
      });
      const imgResult = await cloud.openapi.security.imgSecCheck({
        media: {
          contentType: 'image/png',
          value: fileBuffer.fileContent
        }
      });
      if (imgResult.errCode !== 0) {
        return { pass: false, reason: '图片内容违规' };
      }
    }

    return { pass: true };

  } catch (err) {
    console.error('内容安全检查异常:', err);
    return { pass: false, reason: '安全检查服务异常' };
  }
};
