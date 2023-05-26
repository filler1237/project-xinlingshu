const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const availabilityCollection = db.collection('Availability')

exports.main = async (event, context) => {
  const { teacherId, date } = event

  try {
    const transaction = await db.startTransaction()

    const res = await transaction.collection('Availability')
      .where({
        teacherId,
        date
      })
      .get()
    
    if (!res || !res.data) return 

    if (res.data.length === 0) {
      // rest of the code remains unchanged
      // ...
    } else {
      // rest of the code remains unchanged
      // ...
    }
  } catch (err) {
    console.error(err)
    return {
      code: -1,
      msg: err.message
    }
  } finally {
    // 执行需要执行的代码
  }
}