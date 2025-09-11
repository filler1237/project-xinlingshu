// pages/mine/record/record.js
const sc = wx.cloud.database().collection('Scales');
var RECORD = new Array;
Page({

  /**
   * 页面的初始数据
   */
  data:
   {
     title: "测评记录",
     record1:"/image/a.jpg",
     record2:"/image/a.jpg",
     RECORD:[0,0,0,0,0],
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
  onLoad(options) {
    sc.get({
      //如果查询成功的话    
      success: res => {
        console.log(res.data)
        //这一步很重要，给ne赋值，没有这一步的话，前台就不会显示值   
        let count = sc.count();
        count = count.total;
        for(var i = 0;i < count;i ++) 
        {
          this.setData({
          RECORD: RECORD.concat(res[this.data.count-i-1].data)
        })
        console.log(this.data.RECORD)
      }
      }
    })
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