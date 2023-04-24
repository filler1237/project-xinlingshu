// pages/sushuo/XIE/XIE.js
const app=getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    niming:false,
    imgs: [],
    Imgs:[],
    fileID:[],
    wbnr:"",
    index:[0,0],
    Cheight:800,
    Cwidth:800,
    pixe:0,
    imginfo:{}
  },
  async tijiao(e){
    wx.getSystemInfo({
      success: (result) => {
        console.log("result!!!!:",result)
        this.setData({
          pixe:result.pixelRatio
        })
      },
    })
    console.log(e.detail.value)
    //若未登录，直接到登录页面
    if(app.globalData.userInfo.isLogin!=true){
      wx.switchTab({
        url: '/pages/mine/mine'
      })
      return
    }
    //检测账号是否被封
    var ban=app.globalData.userInfo.ban
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
      var length=e.detail.cursor
      if(length==0){
        wx.showToast({
          title: '再多说点吧！',
          icon: 'none',
          duration: 800,
        })
        return//这个return返回，停止继续执行
      }
      var _this=this
      wx.showModal({
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

    // if(text.length>0){
    //   var checkOk = await this.checkStr(text);
    // }else{
    //   var checkOk = true
    // }
    // //开始审核文本
    // if(!checkOk){ 
    //   wx.hideLoading({}),//审核不通过隐藏
    //   wx.showToast({
    //     title: '文本含有违法违规内容',
    //     icon: 'none',
    //     duration: 5000,
    //   })
    //   return//这个return返回，停止继续执行
    // }

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
//真正的上传说说
post(ss_xx){
    
  //loading发布中
  wx.showLoading({
    title: '即将完成...',
    mask:true
  })
  console.log("传过来",ss_xx)
  //var sjk=ss_xx.bankuai.toString()+"0"//@@@转成字符串@@@
  //添加说说记录
  db.collection('ss').add({
    data:{
      ss_xx,
      time:ss_xx.firsttime
    }
  }).then((res)=>{
    console.log("res_id=",res._id)//拿到id
    console.log("ss_xx=",ss_xx)

    //ss发送成功了
    //设置app跳转到首页后要刷新
    app.shuaxin=true
    wx.hideLoading({})//发布成功隐藏
    //app跳转到首页
    wx.switchTab({url:'/pages/mine/mine'})
    var id=res._id
    var jl={
      "time":ss_xx.firsttime,
      "nr":ss_xx.nr,
      "id":id,
      "weigui":false
    }
    
    var wenzhang=[]
    //获取之前的文章加到wenzhang
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