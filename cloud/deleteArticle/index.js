// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { id } = event;

  if (!id) {
    return { code: -1, msg: '缺少唯一标识符' };
  }

  try {
    // 尝试作为画作删除 (drawings)
    try {
      const drawingRes = await db.collection('drawings').doc(id).get();
      if (drawingRes.data) {
        const drawing = drawingRes.data;
        // 权限校验: 兼容检查 userId 和 _openid
        const recordOwner = drawing.userId || drawing._openid;
        if (recordOwner !== wxContext.OPENID) {
          return { code: -1, msg: '无权限删除' };
        }

        // 删除云存储文件
        if (drawing.fileID) {
          await cloud.deleteFile({ fileList: [drawing.fileID] });
        }

        // 删除数据库记录
        await db.collection('drawings').doc(id).remove();
        return { code: 0, msg: '删除成功' };
      }
    } catch (e) {
      // 如果在drawings中找不到，属正常情况，继续尝试articles
    }

    // 尝试作为普通文章删除 (articles)
    try {
      const articleRes = await db.collection('articles').doc(id).get();
      if (articleRes.data) {
        const article = articleRes.data;
        if (article._openid !== wxContext.OPENID) {
          return { code: -1, msg: '无权限删除' };
        }
        await db.collection('articles').doc(id).remove();
        return { code: 0, msg: '删除成功' };
      }
    } catch (e) {
      // 在articles中也找不到
    }

    return { code: -1, msg: '内容不存在或已被删除' };

  } catch (e) {
    console.error("删除操作失败:", e);
    return { code: -1, msg: '删除失败，请稍后重试', error: e.message };
  }
};
