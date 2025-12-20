// 云函数入口文件 - 删除评论
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const { commentId } = event

    if (!commentId) {
        return { code: -1, msg: '缺少评论ID' }
    }

    try {
        // 1. 先获取评论，验证权限
        const commentRes = await db.collection('comments').doc(commentId).get()

        if (!commentRes.data) {
            return { code: -1, msg: '评论不存在' }
        }

        // 2. 检查是否是评论作者
        if (commentRes.data._openid !== wxContext.OPENID) {
            return { code: -1, msg: '无权删除他人评论' }
        }

        // 3. 删除该评论
        await db.collection('comments').doc(commentId).remove()

        // 4. 同时删除所有以该评论为父评论的回复（可选，保持数据整洁）
        await db.collection('comments').where({
            parentId: commentId
        }).remove()

        return { code: 0, msg: '删除成功' }

    } catch (err) {
        console.error('删除评论失败:', err)
        return { code: -1, msg: '删除失败，请稍后重试' }
    }
}
