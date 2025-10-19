// pages/sushuo/DA/DA.js
const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    mess: '',
    content: [], // 聊天信息
    inputText: '', // 输入框内容
    userId: '',
    isSending: false, // 控制“思考中”状态的显示
    
    // --- 新增：头像地址 ---
    // 你可以替换成真实的图片路径或网络链接
    userAvatarUrl: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/默认头像.jpeg', // 使用项目中的默认头像
    aiAvatarUrl: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/logo1.png', // 使用项目中的 logo 作为 AI 头像
    
    // --- 新增：适配自定义导航栏 ---
    statusBarHeight: 0,
    headerHeight: 0,
  },

  onShow: function () {
    // onShow 期间可以不用加载聊天室列表，除非有特定需求
    // this.loadChatrooms(); 
  },



  onBackTap: function(e) {
    wx.navigateBack({
      delta: 1,
    });
  },

  inputChange: function (e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  sendMessage: function () {
    const message = this.data.inputText.trim();
    if (!message || this.data.isSending) {
      return;
    }

    // --- 修改：isUser 字段用于 WXML 判断 ---
    const newUserMessage = { text: message, isUser: true };
    this.setData({
      content: [...this.data.content, newUserMessage],
      inputText: '',
      isSending: true, // --- 新增：开始发送，显示“思考中” ---
    });

    wx.cloud.callFunction({
      name: 'xinlixuejia',
      data: {
        query: message,
        user: this.data.userId
      },
      success: res => {
        if (res.result && res.result.code === 0) {
          const assistantReply = res.result.reply;
          // --- 修改：isUser 字段用于 WXML 判断 ---
          const newAssistantMessage = { text: assistantReply, isUser: false };
          this.setData({
            content: [...this.data.content, newAssistantMessage]
          });
        } else {
          const errorMessage = { text: res.result.message || '抱歉，出错了，请稍后再试', isUser: false };
          this.setData({
            content: [...this.data.content, errorMessage]
          });
        }
      },
      fail: err => {
        const networkError = { text: '网络开小差了，请检查网络连接', isUser: false };
        this.setData({
          content: [...this.data.content, networkError]
        });
        console.error('调用云函数失败:', err);
      },
      complete: () => {
        // --- 新增：无论成功失败，结束发送，隐藏“思考中” ---
        this.setData({
          isSending: false,
        });
        // 保存聊天记录
        this.saveChatHistory();
      }
    });
  },

  onReady() {
    // 初始化操作
  },

  onLoad: function (options) {
    // --- 新增：获取设备信息以适配导航栏 ---
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();

    let userId = app.globalData.userId || wx.getStorageSync('userId');
    if (!userId) {
      userId = this.generateUserId();
      wx.setStorageSync('userId', userId);
      app.globalData.userId = userId;
    }
    this.setData({ 
      userId: userId,
      statusBarHeight: systemInfo.statusBarHeight,
      // 胶囊按钮的顶部位置减去状态栏高度，再乘以2，加上胶囊按钮的高度
      headerHeight: (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height
    });
    this.loadChatHistory(userId);
  },

  generateUserId: function() {
    return 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
  },

  loadChatHistory: function (userId) {
    db.collection('chatHistory').where({ userId: userId }).get().then(res => {
      const welcomeMessage = {
        text: '你好！我是你的AI心理伙伴，有什么可以帮助你的吗？',
        isUser: false
      };
      const threshold = 30 * 60 * 1000; // 30分钟缓存

      let finalContent = [];
      let needsWelcome = false;

      if (res.data && res.data.length > 0) {
        const history = res.data[0];
        finalContent = history.content || []; // 先加载历史记录
        const lastUpdated = history.lastUpdated;

        // 检查是否需要发送欢迎语
        if (!lastUpdated || (new Date() - new Date(lastUpdated)) > threshold) {
          needsWelcome = true;
        }
      } else {
        // 没有历史记录，是新用户
        needsWelcome = true;
      }

      if (needsWelcome) {
        finalContent.push(welcomeMessage);
      }

      this.setData({
        content: finalContent,
      });
    }).catch(err => {
      console.error('加载聊天记录失败:', err);
    });
  },

  saveChatHistory: function () {
    const { userId, content } = this.data;
    if (!userId) return;

    const dataToSave = {
      content: content,
      lastUpdated: db.serverDate() // 使用服务器时间
    };

    db.collection('chatHistory').where({ userId: userId }).get().then(res => {
      if (res.data.length > 0) {
        db.collection('chatHistory').doc(res.data[0]._id).update({
          data: dataToSave
        });
      } else {
        db.collection('chatHistory').add({
          data: { 
            userId: userId, 
            content: dataToSave.content,
            lastUpdated: dataToSave.lastUpdated
          }
        });
      }
    });
  },
});
