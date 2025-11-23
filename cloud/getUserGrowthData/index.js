// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db=cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try{
    const userRes=await db.collection('users').where({
      _openid: wxContext.OPENID
    }).get()
    if (userRes.data.length===0)
    {
      console.log('未找到用户, openid:', wxContext.OPENID)
      return {code:-1,msg:'用户不存在'}
    }
    const user=userRes.data[0]
    console.log('查询到的用户信息:', user)

    // 查询徽章成就
    const achievementsRes=await db.collection('achievements').where({
      _id:db.command.in(user.unlockedAchievements || [])
    }).get()
    // --- 检查每日任务完成状态 ---
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const tasks = [
      { id: 'dailySignIn', name: '每日签到', dateField: 'lastSignInDate' },
      { id: 'completeDiary', name: '记录心情日记', dateField: 'lastDiaryDate' },
      { id: 'ventInEchoWall', name: '在心灵树洞中倾诉一次烦恼', dateField: 'lastVentDate'},
      { id: 'listenInEchoWall', name: '聆听一次烦恼并回复', dateField: 'lastListenDate' },
      { id: 'publishArticle', name: '发布一篇帖子', dateField: 'lastArticleDate' },
      { id: 'useTarot', name: '进行一次塔罗牌占卜', dateField: 'lastTarotDate' },
      { id: 'useDivination', name: '进行一次周易占卜', dateField: 'lastDivinationDate' }

      // 可以在此添加更多需要检查的每日任务
    ];

    const taskStatus = tasks.map(task => {
      const lastCompletionTimestamp = user[task.dateField] || 0;
      return {
        ...task,
        completed: lastCompletionTimestamp >= startOfToday
      };
    });

    return {
      code: 0,
      data: {
        growthValue: user.growthValue,
        treeLevel: user.treeLevel,
        unlockedAchievements: achievementsRes.data,
        waterdrops: user.waterDrops,
        tasks: taskStatus // 新增任务状态列表
      }
    }
} catch(e){
  console.error(e)
  return { code : -1,msg:'查询失败',error: e}
 }
}
