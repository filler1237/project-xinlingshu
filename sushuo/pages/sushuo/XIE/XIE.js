const app=getApp() //获取小程序实例
const db = wx.cloud.database() //获取云数据库实例
Page({

  /**
   * 页面的初始数据
   */
  data: {
    niming:false, //是否匿名
    imgs: [], //上传的图片
    Imgs:[], //云存储中的图片
    fileID:[], //上传的图片的fileID
    wbnr:"", //文本内容
    index:[0,0], //选择器的索引
    Cheight:800, //图片高度
    Cwidth:800, //图片宽度
    pixe:0, //设备像素比
    imginfo:{} //图片信息
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
  async tijiao(e){ //提交按钮点击事件
    wx.getSystemInfo({ //获取设备信息
      success: (result) => {
        console.log("result!!!!:",result)
        this.setData({
          pixe:result.pixelRatio //获取设备像素比
        })
      },
    })
    console.log(e.detail.value)
    //若未登录，直接到登录页面
    if(app.globalData.userInfo.isLogin!=true){ //判断是否已登录
      wx.switchTab({
        url: '/pages/mine/mine' //跳转到个人中心页面
      })
      return
    }
    //检测账号是否被封
    var ban=app.globalData.userInfo.ban //判断账号是否被封
    if(ban==true){
      wx.showToast({
        title: '账号被封！',
        icon:'none',
        duration:7000
      })
      return
    }
    //console.log(e.detail.value)//bankuai/zilei/niming2匿名内容/niming1是否匿名/wbnr/
    var biaodan=e.detail.value//整个表单数据
    var text=biaodan.wbnr//临时text。文本内容
    console.log("表单：",e)
    // var text=biaodan//临时text。文本内容
    var length=e.detail.cursor //获取文本长度
    if(length==0){ //判断文本是否为空
      wx.showToast({
        title: '再多说点吧！',
        icon: 'none',
        duration: 800,
      })
      return//这个return返回，停止继续执行
    }
    var _this=this
    wx.showModal({ //弹出模态框
      title: '提示',
      content: '我已经写好啦！',
      showCancel:true,
      confirmText:'是',
      confirmColor:'#000000',
      cancelText:'否',
      cancelColor:'#000000',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          _this.tijiao2(biaodan)
          return true
        } else if (res.cancel) {
          //console.log('用户点击取消')
          return false
        }
      }
    })
  },
  

  async tijiao2(biaodan){
    console.log("表单：",biaodan)
    var text=biaodan.wbnr//临时text。文本内容
    wx.showLoading({
      title: '准备发送...',
      mask:true
    })
  
    var that=this//用that表当前外部对象
    console.log("楼主id::::",app.globalData.userInfo._id)
    var ss_xx={
      firsttime:new Date().getTime(),//发布时间
      nickName:app.globalData.userInfo.nickName,//签名
      niming1:biaodan.niming1,//是否匿名
      nr:biaodan.wbnr,//文本
    }
    //console.log(ss_xx)
    //纯文本发帖！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
    that.post(ss_xx)
  },
// 发布说说的函数
post(ss_xx){

  // 显示loading
  wx.showLoading({
  title: '即将完成...',
  mask:true
  })
  console.log("传过来",ss_xx)
  //var sjk=ss_xx.bankuai.toString()+"0"//@@@转成字符串@@@
  // 添加说说记录到数据库
  db.collection('ss').add({
  data:{
  ss_xx,
  time:ss_xx.firsttime
  }
  }).then((res)=>{
  console.log("res_id=",res._id)//拿到id
  console.log("ss_xx=",ss_xx)
    //ss发送成功了
// 成功发布说说后，设置app跳转到首页后要刷新
app.shuaxin=true
wx.hideLoading({})//隐藏loading
// 跳转到个人中心页面
wx.switchTab({url:'/pages/mine/mine'})
var id=res._id
var jl={
  "time":ss_xx.firsttime,
  "nr":ss_xx.nr,
  "id":id,
  "weigui":false
}

var wenzhang=[]
// 获取之前的文章加到wenzhang
db.collection("users").doc(app.globalData.userInfo._id).get().then((res)=>{
  wenzhang=res.data.wenzhang
  //console.log("取回的",wenzhang)
  wenzhang.push(jl)
  //记录到自己users里
  db.collection("users").doc(app.globalData.userInfo._id).update({
    data:{
      wenzhang:wenzhang
    }
  }).then((res)=>{
   
    //进行全局数据我的本地储存
    app.globalData.userInfo.wenzhang=wenzhang
    this.setData({
      wbnr:""
    })
    
  })
})
  })
},
// 输入框输入内容时调用的函数
  tell(e){
  console.log(e)
  this.setData({
  wbnr:e.detail.value,
  })
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