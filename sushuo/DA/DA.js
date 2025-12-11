// pages/sushuo/DA/DA.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    // --- 页面状态 ---
    inputText: '', // 输入框内容
    isSending: false, // 控制“思考中”状态的显示
    isTopicsPanelOpen: false, // 控制话题面板的显示

    // --- 聊天与话题数据 ---
    content: [], // 当前话题的聊天信息
    topics: [], // 用户的所有话题列表
    currentTopicId: null, // 当前活动的话题ID
    userId: '',

    // --- 静态资源与样式 ---
    userAvatarUrl: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/默认头像.jpeg',
    aiAvatarUrl: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/logo1.png',
    statusBarHeight: 0,
    headerHeight: 0,
  },

  onLoad: function (options) {
    // 1. 初始化自定义导航栏
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      headerHeight: (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height
    });

    // 2. 获取或生成用户ID
    let userId = app.globalData.userId || wx.getStorageSync('userId');
    if (!userId) {
      userId = 'user_' + Date.now() + Math.random().toString(36).substr(2, 9);
      wx.setStorageSync('userId', userId);
      app.globalData.userId = userId;
    }
    this.setData({ userId: userId });

    // 3. 加载用户的话题列表
    this.loadUserTopics();
  },

  // --- 核心：话题管理 ---

  loadUserTopics: function () {
    db.collection('chatTopics').where({ userId: this.data.userId }).orderBy('lastUpdated', 'desc').get().then(res => {
      if (res.data && res.data.length > 0) {
        // 如果有历史话题，加载它们
        this.setData({ topics: res.data });
        const latestTopicId = res.data[0]._id; // 默认加载最新的话题
        this.switchTopic({ currentTarget: { dataset: { topicId: latestTopicId } } });
      } else {
        // 如果没有历史话题，创建一个新的
        this.createNewTopic();
      }
    }).catch(err => {
      console.error("加载话题列表失败:", err);
      wx.showToast({ title: '加载话题失败', icon: 'none' });
    });
  },

  createNewTopic: function () {
    const newTopicId = 'topic_' + Date.now() + Math.random().toString(36).substr(2, 9);
    const newTopic = {
      _id: newTopicId,
      userId: this.data.userId,
      name: `新话题 ${new Date().toLocaleDateString()}`,
      content: [{
        text: '你好！我是你的朋友云舒，有什么想要跟我分享的吗？',
        isUser: false,
        type: 'text'
      }],
      lastUpdated: db.serverDate()
    };

    db.collection('chatTopics').add({ data: newTopic }).then(res => {
      this.setData({
        topics: [newTopic, ...this.data.topics], // 将新话题添加到列表顶部
        content: newTopic.content,
        currentTopicId: newTopic._id,
        isTopicsPanelOpen: false // 创建后自动关闭面板
      });
      wx.showToast({ title: '新话题已创建', icon: 'success' });
    }).catch(err => {
      console.error("创建新话题失败:", err);
      wx.showToast({ title: '创建失败', icon: 'none' });
    });
  },

  switchTopic: function (e) {
    const topicId = e.currentTarget.dataset.topicId;
    if (topicId === this.data.currentTopicId) {
      this.setData({ isTopicsPanelOpen: false }); // 如果是当前话题，则只关闭面板
      return;
    }

    const targetTopic = this.data.topics.find(t => t._id === topicId);
    if (targetTopic) {
      this.setData({
        content: targetTopic.content,
        currentTopicId: topicId,
        isTopicsPanelOpen: false
      });
    }
  },

  deleteTopic: function (e) {
    const topicIdToDelete = e.currentTarget.dataset.topicId;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个话题及其所有聊天记录吗？',
      success: (res) => {
        if (res.confirm) {
          db.collection('chatTopics').doc(topicIdToDelete).remove().then(() => {
            const newTopics = this.data.topics.filter(t => t._id !== topicIdToDelete);
            this.setData({ topics: newTopics });

            // 如果删除的是当前话题，则切换到另一个话题或新建一个
            if (this.data.currentTopicId === topicIdToDelete) {
              if (newTopics.length > 0) {
                this.switchTopic({ currentTarget: { dataset: { topicId: newTopics[0]._id } } });
              } else {
                this.createNewTopic();
              }
            }
            wx.showToast({ title: '删除成功', icon: 'success' });
          }).catch(err => {
            console.error("删除话题失败:", err);
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  saveChatHistory: function () {
    const { currentTopicId, content } = this.data;
    if (!currentTopicId) return;

    const updatedTopicName = content.length > 1 ? content[1].text.substring(0, 20) : this.data.topics.find(t => t._id === currentTopicId).name;

    db.collection('chatTopics').doc(currentTopicId).update({
      data: {
        content: content,
        name: updatedTopicName, // 用第一句用户的话作为话题名称
        lastUpdated: db.serverDate()
      }
    }).then(() => {
      // 更新本地 topics 数组中的名称和内容，确保数据同步
      const topicIndex = this.data.topics.findIndex(t => t._id === currentTopicId);
      if (topicIndex !== -1) {
        this.setData({
          [`topics[${topicIndex}].name`]: updatedTopicName,
          [`topics[${topicIndex}].content`]: content // <-- 关键修复：同步更新内容
        });
      }
    }).catch(console.error);
  },

  // --- UI 与事件处理 ---

  toggleTopicsPanel: function () {
    this.setData({ isTopicsPanelOpen: !this.data.isTopicsPanelOpen });
  },

  onBackTap: function () {
    wx.navigateBack({ delta: 1 });
  },

  inputChange: function (e) {
    this.setData({ inputText: e.detail.value });
  },

  previewImage: function (e) {
    const currentUrl = e.currentTarget.dataset.src;
    const urls = this.data.content
      .filter(item => item.type === 'image')
      .map(item => item.imageUrl);
    wx.previewImage({
      current: currentUrl,
      urls: urls
    });
  },

  /**
   * 长按消息气泡事件
   */
  onMessageLongPress: function (e) {
    const text = e.currentTarget.dataset.text;
    const type = e.currentTarget.dataset.type;

    // 只有文本消息支持复制
    if (!text || (type && type !== 'text')) return;

    wx.showActionSheet({
      itemList: ['复制'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.setClipboardData({
            data: text,
            success: () => {
              wx.showToast({
                title: '已复制',
                icon: 'success'
              });
            }
          });
        }
      },
      fail: (res) => {
        console.log(res.errMsg);
      }
    });
  },

  // 解析多张图片与文本
  _parseMessage: function (text) {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const messages = [];
    let lastIndex = 0;
    let match;
    // 循环查找所有图片
    while ((match = imageRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textPart = text.substring(lastIndex, match.index).trim();
        if (textPart) {
          messages.push({
            type: 'text',
            text: textPart,
            isUser: false
          });
        }
      }
      // 添加图片
      messages.push({
        type: 'image',
        imageUrl: match[1],
        isUser: false,
        text: ''
      });
      lastIndex = imageRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex).trim();
      if (remainingText) {
        messages.push({
          type: 'text',
          text: remainingText,
          isUser: false
        });
      }
    }
    // 没有匹配则返回纯文本
    if (messages.length === 0) {
      return [{ type: 'text', text: text.trim(), isUser: false }];
    }
    return messages;

  },

  // --- 聊天逻辑  ---

  scrollToBottom: function () {
    this.setData({
      scrollTop: 999999
    });
  },

  /**
   * 打字机效果处理函数
   */
  processStreamBuffer: function (fullText) {
    if (!fullText) return;

    // 如果已经在打字中，先清除之前的
    if (this._typewriterTimer) clearInterval(this._typewriterTimer);

    const chars = fullText.split('');
    const that = this;
    const TYPE_SPEED = 30; // 打字速度，越小越快
    let currentIndex = 0;

    // 获取最后一条消息索引（AI的占位消息）
    const msgIndex = this.data.content.length - 1;

    this._typewriterTimer = setInterval(() => {
      if (currentIndex >= chars.length) {
        clearInterval(that._typewriterTimer);
        that._typewriterTimer = null;
        that.setData({ isSending: false });
        that.saveChatHistory();
        return;
      }

      // 获取当前要追加的字符
      // 为了性能，可以每次追加 2-3 个字符
      const chunkSize = 2;
      const chunk = fullText.substring(currentIndex, currentIndex + chunkSize);
      currentIndex += chunkSize;

      const currentText = that.data.content[msgIndex].text || '';
      const updateKey = `content[${msgIndex}].text`;

      that.setData({
        [updateKey]: currentText + chunk
      }, () => {
        // 每几次更新滚动一次，避免频繁调用 setScroll
        if (currentIndex % 10 === 0 || currentIndex >= chars.length) {
          that.scrollToBottom();
        }
      });

    }, TYPE_SPEED);
  },

  sendMessage: function () {
    const message = this.data.inputText.trim();
    if (!message || this.data.isSending) return;

    // 1. 用户消息上屏
    const newUserMessage = { text: message, isUser: true, type: 'text' };

    // 2. AI 占位消息（先放一个空的，用于打字）
    const aiPlaceholder = { text: '', isUser: false, type: 'text' };

    this.setData({
      content: [...this.data.content, newUserMessage, aiPlaceholder],
      inputText: '',
      isSending: true,
    }, () => {
      this.scrollToBottom();
    });

    const history = this.data.content
      .slice(0, -2) // 排除掉刚刚加的那两条
      .slice(-6)
      .filter(msg => msg.type === 'text' && msg.text)
      .map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));

    wx.cloud.callFunction({
      name: 'xinlixuejia',
      data: { query: message, user: this.data.userId, chat_history: history },
      success: res => {
        const reply = (res.result && res.result.code === 0) ? res.result.reply : '抱歉，出错了，请稍后再试';

        // 简单处理：如果包含多段（如图片），暂时不支持打字机，直接显示；如果是纯文本，打字机。
        const parsedMessages = this._parseMessage(reply);

        if (parsedMessages.length > 1 || parsedMessages[0].type !== 'text') {
          // 复杂内容：替换掉占位符
          const list = this.data.content;
          list.pop();
          this.setData({
            content: [...list, ...parsedMessages],
            isSending: false
          }, () => { this.scrollToBottom(); });
          this.saveChatHistory();
        } else {
          // 纯文本：使用打字机
          const textToType = parsedMessages[0].text;
          this.processStreamBuffer(textToType);
        }
      },
      fail: err => {
        console.error('调用云函数失败:', err);
        const list = this.data.content;
        list.pop(); // 移除占位
        this.setData({
          content: [...list, { text: '网络开了小差，请稍后重试', isUser: false, type: 'text' }],
          isSending: false
        }, () => { this.scrollToBottom(); });
      }
    });
  },
});
