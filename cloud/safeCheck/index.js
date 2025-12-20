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
      try {
        const fileBuffer = await cloud.downloadFile({
          fileID: fileID,
        });

        // 检查文件大小，security.imgSecCheck 限制为 1MB
        // 如果文件过大，这里可以做一个兜底策略：
        // 1. 直接拒绝（安全起见）
        // 2. 或者放行（如果业务允许）
        // 3. 或者尝试使用 cloud.openapi.security.mediaCheckAsync (但那是异步的，无法此处立即返回)
        if (fileBuffer.fileContent.length > 1024 * 1024) {
          console.warn('图片超过1MB，无法使用同步接口检查，自动拦截');
          return { pass: false, reason: '图片过大，请压缩后上传' };
        }

        const imgResult = await cloud.openapi.security.imgSecCheck({
          media: {
            contentType: 'image/jpeg', // 假设是jpg，或者根据实际情况判断
            value: fileBuffer.fileContent
          }
        });

        if (imgResult.errCode !== 0) {
          return { pass: false, reason: '图片内容违规' };
        }
      } catch (imgErr) {
        console.error('图片检查出错:', imgErr);
        // 如果错误码是 87014 (内容含有违规信息)
        if (imgErr.errCode === 87014) {
          return { pass: false, reason: '图片内容违规' };
        }
        // 其他错误抛出
        throw imgErr;
      }
    }

    return { pass: true };

  } catch (err) {
    console.error('内容安全检查异常:', err);
    // 区分是一般错误还是验证不通过
    return { pass: false, reason: '安全检查服务异常' };
  }
};
