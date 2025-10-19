// pages/mine/record/record.js
const sc = wx.cloud.database().collection('Scales');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "测评记录",
    RECORD: [],
  },
  onBackTap: function(e) {
    var pages = getCurrentPages();                       //获取当前页面
    var prePage = pages[pages.length - 2];               //获取上一页面
    prePage.setData({
      'search.page': 1                                   //给上一页面的变量赋值
    })
    wx.navigateBack({                                    //返回上一页面
      delta: 1,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.fetchScalesRecord();
  },

  async fetchScalesRecord() {
    this.setData({ loading: true, error: null });
    try {
      const result = await wx.cloud.callFunction({
        name: 'getScalesRecord'
      });

      if (result.result.ok) {
        const backgroundColors = ["#ccdcb4", "#bac6e1", "#98b86a", "#f4cbb2", "#fefef5"];
        const processedData = result.result.data.map((item, index) => ({
          date: item.Time,
          title: item.title,
          result: item.RES,
          backgroundColor: backgroundColors[index % backgroundColors.length],
          imgSrc: item.imgSrc || "/image/a.jpg"
        }));
        this.setData({
          RECORD: processedData.reverse(), // 显示最新的记录在最上面
          loading: false
        });
      } else {
        throw new Error(result.result.error || '加载失败');
      }
    } catch (e) {
      this.setData({
        loading: false,
        error: e.message
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.setNavigationBarTitle({
      title: '测评记录',
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }

})
