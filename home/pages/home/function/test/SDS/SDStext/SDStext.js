// pages/home/function/1/SDS/SDStext/SDStext.js
var ar = new Array (20)
Page({

  Goresult(){
    wx.navigateTo({
      url: '../result/result',
    })
  },
  
  /**
   * 页面的初始数据
   */
  data: {
    id:15,
    array:ar,
    QUESTION: [
        {
          question:"1、我觉得闷闷不乐，情绪低沉"
        },
        {
          question:"2、我觉得一天中早晨最好"
        },
        {
          question:"3、一阵阵哭出来或觉得想哭"
        },
        {
          question:"4、我晚上睡眠不好"
        },
        {
          question:"5、我吃得跟平常一样多"
        },
        {
          question:"6、我与异性密切接触时和以往一样感到愉快"
        },
        {
          question:"7、我发觉我的体重在下降"
        },
        {
          question:"8、我有便秘的苦恼"
        },
        {
          question:"9、心跳比平常快"
        },
        {
          question:"10、我无缘无故地感到疲乏"
        },
        {
          question:"11、我的头脑和平常一样清楚"
        },
        {
          question:"12、我觉得经常做的事情并没有困难"
        },
        {
          question:"13、我觉得不安而平静不下来"
        },
        {
          question:"14、我对未来抱有希望"
        },
        {
          question:"15、我比平常容易生气激动"
        },
        {
          question:"16、我觉得做出决定是容易的"
        },
        {
          question:"17、我觉得自己是个有用的人，有人需要我"
        },
        {
          question:"18、我的生活过得很有意思"
        },
        {
          question:"19、我认为如果我死了，别人会生活得更好"
        },
        {
          question:"20、平常感兴趣的事我仍然感兴趣"
        },

      ],
        options: [
            { level: '没有或很少时间', value: '0', checked: false },
            { level: '少部分时间', value: '1', checked: false },
            { level: '相当多时间', value: '2', checked: false },
            { level: '绝大部分或全部时间', value: '3', checked: false },
          ],
      },
      
    QueChange: function(q){
        console.log(q.detail.value);
        var index = q.detail.current;
        var id = this.data.id;
        ar[id] = index;
        this.setData({
          array:ar,
        })
        console.log(this.data.array);
      },

    serviceValChange: function (e)
     {
        var options = this.data.options;
        var checkArr = e.detail.value;
        for (var i = 0; i < options.length; i++) {
          if (checkArr.indexOf(i + "") != -1) {
            options[i].checked = true;
          } else {
            options[i].checked = false;
          }
        }
        this.setData({
          options: options
        })
    },
    NextQ:function( ){
      if (this.data.id < 19)
      {
        this.setData({
          id : this.setData.id - 1,
        })
      }
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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