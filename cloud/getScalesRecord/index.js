const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const res = await db.collection('Scales').where({
      _openid: openid
    }).get();
    
    return {
      ok: true,
      data: res.data
    };
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
};
