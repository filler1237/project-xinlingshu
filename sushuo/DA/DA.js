// pages/sushuo/DA/DA.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    mess: '',
    content: [], // 聊天信息
    groupList: [],
    id: null,
    name: '',
    inputText: '', // 新增输入框内容的状态
    userId: '',
  },
  onShow: function () {
    this.loadChatrooms();
  },
  loadChatrooms: function () {
    const dd = wx.cloud.database();
    dd.collection('manager').get().then(res => {
      this.setData({
        groupList: res.data
      }, () => {
        console.log(this.data.groupList); // 在setData回调函数中打印
      });
    });
  },
  onBackTap: function(e) {
    var pages = getCurrentPages();                       // 获取当前页面
    var prePage = pages[pages.length - 2];               // 获取上一页面
    prePage.setData({
      'search.page': 1                                   // 给上一页面的变量赋值
    });
    wx.navigateBack({                                    // 返回上一页面
      delta: 1,
    });
  },
  inputChange: function (e) {
    this.setData({
      inputText: e.detail.value
    });
  },
  sendMessage: function () {
    const that = this;
    const message = this.data.inputText;
    if (!message) return;

    // 更新聊天记录
    this.setData({
      content: [...this.data.content, { id: 1, text: message }],
      inputText: '' // 清空输入框
    });
    // 保存聊天记录
    this.saveChatHistory();
    // 获取 access_token
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=THhoTz7NSGzqonFdaOmpPGqt&client_secret=DvocCattNK4xnGeUAQcY3kbwo84BMZdf',
      method: 'POST',
      success(res) {
        const access_token = res.data.access_token;

        // 调用文心一言 API
        wx.request({
          url: `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-tiny-8k?access_token=${access_token}`,
          method: 'POST',
          header: { "content-type": "application/json" },
          data: {
            messages: [
              { role: "user", content: message }
            ]
          },
          success(res) {
            console.log("Response from API-----", res.data);
            const reply = res.data.result; // 访问返回数据中的 result 字段
            that.setData({
              content: [...that.data.content, { id: 0, text: reply }]
            });
            // 保存聊天记录
            that.saveChatHistory();
          },
          complete(d) {
            console.log(d);
          }
        });
      },
      complete(d) {
        console.log(d);
      }
    });
  },
  onReady() {
    // 初始化操作
  },
  onLoad: function (options) {
    const userId = app.globalData.userId || wx.getStorageSync('userId');
    if (!userId) {
      // 如果没有 userId，生成一个并存储
      const newUserId = this.generateUserId();
      wx.setStorageSync('userId', newUserId);
      this.setData({ userId: newUserId });
      app.globalData.userId = newUserId;
    } else {
      this.setData({ userId: userId });
    }
    this.loadChatHistory(userId);
  },
  loadChatHistory: function (userId) {
    // 从数据库加载用户的聊天历史记录
    db.collection('chatHistory').where({ userId: userId }).get().then(res => {
      if (res.data.length > 0) {
        this.setData({
          content: res.data[0].content || [],
        });
      }
    });
  },
  saveChatHistory: function () {
    const { userId, content } = this.data;
    db.collection('chatHistory').where({ userId: userId }).get().then(res => {
      if (res.data.length > 0) {
        db.collection('chatHistory').doc(res.data[0]._id).update({
          data: { content: content }
        });
      } else {
        db.collection('chatHistory').add({
          data: { userId: userId, content: content }
        });
      }
    });
  },
});