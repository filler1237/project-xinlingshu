const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();
const users = db.collection('users');

exports.main = async (event, context) => {
  const { userInfo } = event;

  // Retrieve user from database
  let user;
  try {
    const res = await users.where({ openid: userInfo.openId }).get();
    user = res.data[0];
  } catch (err) {
    console.log('Error retrieving user from database', err);
    return {
      code: 500,
      message: 'Internal server error',
    };
  }

  // Check if user exists
  if (!user) {
    // Create new user
    try {
      const res = await users.add({
        data: {
          openid: userInfo.openId,
          userInfo: userInfo,
          fuyuanli: {
            max: 10,
            gap: 10,
            Level: 1,
            shengli: 0,
            xinli: 0,
            qingxu: 0,
            shejiao: 0,
          },
        },
      });
      user = { _id: res._id };
    } catch (err) {
      console.log('Error creating new user', err);
      return {
        code: 500,
        message: 'Internal server error',
      };
    }
  }

  // Return success response
  return {
    code: 200,
    message: 'Login successful',
    data: user,
  };
};