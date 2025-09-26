// cloud/grantGrowth/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { _openId,growthAmount } = event // 接收要增加的成长值数量
  console.log('接受到的成长值:',growthAmount)
  console.log('当前用户openid:',_openId)
  try {
    // 1. 给用户增加成长值
    const userRes = await db.collection('users').where({
      _openid: _openId
    }).update({
      data: {
        growthValue: _.inc(growthAmount) // 使用 _.inc 实现原子自增
      }
    })

    // 2. 调用成就检查云函数 (我们下一步创建)
    // 我们通过云函数调用云函数的方式，确保逻辑分离
    await cloud.callFunction({
      name: 'checkAchievements'
    })

    return userRes

  } catch (e) {
    console.error(e)
  }
}
