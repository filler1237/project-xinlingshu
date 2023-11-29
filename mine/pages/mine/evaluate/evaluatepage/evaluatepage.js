const app = getApp();
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    star_data: [
      {
        id: 1,
        src: "/images/icons/star_null.png" // 星级图标路径
      },
      {
        id: 2,
        src: "/images/icons/star_null.png"
      },
      {
        id: 3,
        src: "/images/icons/star_null.png"
      },
      {
        id: 4,
        src: "/images/icons/star_null.png"
      },
      {
        id: 5,
        src: "/images/icons/star_null.png"
      }
    ],
    font_count: '0/140', // 字数统计
    evaluation_text: '', // 评价内容
    istrue: false,
    Appointments: [],
    id: 0, // 订单号
  },

  // 点击星级图片时触发的事件
  change_star: function(event) {
    var that = this;
    var sid = event.currentTarget.dataset.sid; // 获取当前点击的星级图标的id
    var star_num = sid; // 星级数量
    var star_list = this.data.star_data; // 获取星级数据
    var src1 = "/images/icons/star_null.png"; // 未选中的星级图标路径
    var src2 = "/images/icons/star_all.png"; // 选中的星级图标路径
    for (var i in star_list) {
      star_list[i].src = src1; // 将所有星级图标设置为未选中状态
      if (star_list[i].id <= sid) {
        star_list[i].src = src2; // 将小于等于当前星级id的图标设置为选中状态
      }
    }
    that.setData({
      star_data: star_list // 更新星级数据
    });
    that.setData({
      star_num: star_num // 更新星级数量
    });
  },

  // 输入评价内容时触发的事件
  data_Input: function(e) {
    var evaluation_text = e.detail.value; // 获取评价内容
    var font_count = evaluation_text.length + '/140'; // 计算字数统计
    if (evaluation_text.length > 140) {
      return;
    }
    this.setData({
      evaluation_text: evaluation_text, // 更新评价内容
      font_count: font_count // 更新字数统计
    });
  },

  // 提交评价按钮点击事件
  affirm_evaluation: function() {
    var that = this;
    var o_id = this.data.id; // 替换成实际的订单号
    var star_num = this.data.star_num; // 获取星级数量
    var evaluation_text = this.data.evaluation_text; // 获取评价内容
    if (evaluation_text === '') {
      wx.showToast({
        title: '请输入评价内容',
        icon: 'none'
      });
      return;
    }
    console.log('订单' + o_id + '星级' + star_num + '提交评价' + evaluation_text);
    db.collection('Appointments').doc(this.data.id).update({
        data: {
          score: star_num,
          feedback: evaluation_text,
          evaluate:'1',
        },
        success: function(res) {
          console.log('评价提交成功', res);
          wx.showToast({
            title: '评价提交成功',
            icon: 'success',
            duration: 2000
          });
        },
        fail: function(error) {
          console.error('评价提交失败', error);
          wx.showToast({
            title: '评价提交失败',
            icon: 'none'
          });
        }
      });
  },

  showDialog: function() {
    this.setData({
      istrue: true
    });
  },

  closeDialog: function() {
    this.setData({
      istrue: false
    });
  },

  stopEvent: function() {
    // 阻止弹窗区域的点击事件冒泡
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const id=options.id;
    // 进行相应的处理
    console.log("传递的_id值为：" + id);
    db.collection('Appointments').doc(id).get().then((res) => {
      // 获取到文档数据
      console.log('获取到的文档', res.data);
      this.setData({
        Appointments: [res.data], // 将数据作为数组赋值给 Appointments 属性
        id: id
      });
    }).catch((error) => {
        // 处理错误
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数缺失部分，请自行补充。
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {}
});