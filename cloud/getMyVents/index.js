// 云函数：getMyVents
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const myVentsPromise = await db.collection('vents')
      .where({
        _openid: openid,
      })
      .orderBy('createdAt', 'desc') // 按创建时间倒序
      .get();

    const myEchoesPromise = db.collection('vents')
      .where({ 
        echoer_openid: openid,
        status: 'approved'
      })
      .orderBy('createdAt', 'desc')
      .get();
    
    const [myVentsResult, myEchoesResult] = await Promise.all([myVentsPromise, myEchoesPromise]);
    const myVentsData = myVentsResult.data.map(item => ({ ...item,type:'vent'}));
    const myEchoesData = myEchoesResult.data.map(item => ({ ...item,type:'echo'}));
    let allMyRelatedVents = [ ...myVentsData, ...myEchoesData];
    allMyRelatedVents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      code: 0,
      data: allMyRelatedVents,
    };
  } catch (e) {
    console.error('获取个人相关vents失败:',e);
    return {
      code: 500,
      message: '数据库操作失败',
      error: e.message,
    };
  }
};
