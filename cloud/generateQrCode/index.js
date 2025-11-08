// 云函数入口文件



//注释如下
//- __二维码的内容是固定的__：它就是预约记录在数据库里的唯一ID。

// __二维码本身不是随机的__：对于同一个预约ID，每次生成的二维码图案都是完全一样的。

//- __唯一性和安全性__：因为每个预约的ID都是唯一的，所以生成的二维码也是唯一的，这保证了核销的准确性。管理员扫描这个二维码，实际上就是获取了其中包含的预约ID，然后去数据库里核对并更新状态。

const cloud = require('wx-server-sdk');
const QRCode = require('qrcode');

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { text } = event;

  try {
    // Generate QR code as a data URL
    const qrCodeDataURL = await QRCode.toDataURL(text);
    return {
      success: true,
      qrCodeDataURL: qrCodeDataURL
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: err
    };
  }
}
