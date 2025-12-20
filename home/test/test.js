// pages/home/function/1/1.js
Page({
  getHeights() {
    let that = this
    // 1.获取胶囊按钮的布局位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    // 2.获取设备信息
    const systemInfo = wx.getSystemInfoSync();
    // 3.计算:计算公式：导航栏高度 = 状态栏高度 + 44。
    // 导航栏高度 = 状态栏高度 + 44
    this.setData({
      navBarHeight: systemInfo.statusBarHeight + 44,
      titleBottom: systemInfo.statusBarHeight
    })
    console.log(systemInfo.statusBarHeight)
  },
  BACK(){
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  GoToIntro: function(e){
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({
        url: url,
        fail: (err) => {
          console.error(`Failed to navigate to ${url}`, err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    } else {
      console.error('No url found in dataset', e.currentTarget.dataset);
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: 0, //导航栏高度
    titleBottom: 0, //顶部距离
    title:'心理测评',
    professionalScales: [
      {
        id: 0,
        title: '抑郁自评量表',
        abbr: 'SDS',
        icon: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/抑郁.png',
        bgColor: 'linear-gradient(145deg, #E5FFF0, #D9F2E5)',
        url: '/home/test/intro/intro?id=0'
      },
      {
        id: 1,
        title: '焦虑自评量表',
        abbr: 'SAS',
        icon: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/焦虑.png',
        bgColor: 'linear-gradient(145deg, #EDF9FC, #E0F0F5)',
        url: '/home/test/intro/intro?id=1'
      },
      {
        id: 2,
        title: '阿森斯失眠量表',
        abbr: 'AIS',
        icon: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/失眠.png',
        bgColor: 'linear-gradient(145deg, #FFFBE3, #F5F2DA)',
        url: '/home/test/intro/intro?id=2'
      },
      {
        id: 3,
        title: '一般健康问卷',
        abbr: 'GHQ-12',
        icon: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/心理健康.png',
        bgColor: 'linear-gradient(145deg, #F0F4FF, #E3E8F5)',
        url: '/home/test/intro/intro?id=3'
      }
    ],
    ipipScales: [
      {
        id: 4,
        title: '适应力评估',
        abbr: 'Resilience',
        icon: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/ipip.png', // 统一的IPIP图标
        bgColor: 'linear-gradient(145deg, #E6F7F4, #D9ECE7)',
        url: '/home/test/adaptability/adaptability'
      },
      {
        id: 5,
        title: '自我效能感',
        abbr: 'Self-efficacy',
        icon: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/ipip.png',
        bgColor: 'linear-gradient(145deg, #FDF2F0, #F8E6E3)',
        url: '/home/test/self-efficacy/assessment/assessment'
      }
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getHeights()
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
