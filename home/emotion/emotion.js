// 获取小程序实例
var app = getApp()

Page({
  data: {
    inputText: '',
    cards: [],
    addCardAnimation: {},
    showAddCardPopup: false,  // Set to false to hide the "添加卡片" section by default
    showModal: false,         // Control the visibility of the modal
    index: null,              // Record the current editing index
    editedContent: '',        // Record the content edited by the user
  },

  onBackTap: function (e) {
    var pages = getCurrentPages();        // Get the current page
    var prePage = pages[pages.length - 2]; // Get the previous page
    prePage.setData({
      'search.page': 1                    // Assign a value to the variable in the previous page
    })
    wx.navigateBack({                     // Navigate back to the previous page
      delta: 1,
    })
  },

  onShow: function () {
    this.loadCards();
  },

  loadCards: function () {
    const db = wx.cloud.database();
    db.collection('cards').get().then(res => {
      this.setData({
        cards: res.data
      });
    });
  },

  onInputChange: function (e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 添加卡片的函数
  addCard: function () {
    // 获取输入框的内容
    const inputText = this.data.inputText.trim(); // 使用 trim() 去除首尾空格

    // 检查输入是否为空
    if (!inputText) {
      wx.showToast({
        title: '请输入卡片内容',
        icon: 'none',
        duration: 2000
      });
      return; // 如果为空，不进行后续操作
    }

    // 如果不为空，进行添加卡片操作
    const db = wx.cloud.database();
    db.collection('cards').add({
      data: {
        content: inputText
      }
    }).then(res => {
      // 添加成功后的操作
      this.setData({
        inputText: '' // 清空输入框
      });
      this.loadCards(); // 重新加载卡片数据
    }).catch(err => {
      console.error('添加卡片失败：', err);
    });
  },

  toggleAddCard: function () {
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-in-out'
    });

    if (this.data.showAddCardPopup) {
      animation.translateY(200).step();
    } else {
      animation.translateY(0).step();
    }

    this.setData({
      addCardAnimation: animation.export(),
      showAddCardPopup: !this.data.showAddCardPopup
    });
  },

  // 编辑按钮点击事件
  editCard(e) {
    const index = e.currentTarget.dataset.index;
    const contentToEdit = this.data.cards[index]; // 从数据源中获取相应的内容
    const content = contentToEdit.content;

    // 打开模态框，并设置编辑内容和索引
    this.setData({
      showModal: true,
      editedContent: content,
      index: index,
    });
  },

  // 输入框内容变化事件
  inputContent(e) {
    this.setData({
      editedContent: e.detail.value,
    });
  },

  // 确定按钮点击事件
  confirmEdit() {
    // 获取索引和编辑内容
    const { index, editedContent } = this.data;
    const cardToUpdate = this.data.cards[index];

    // 检查编辑内容是否为空
    if (!editedContent.trim()) {
      wx.showToast({
        title: '请输入有效的卡片内容',
        icon: 'none',
        duration: 2000
      });
      return; // 如果为空，不进行后续操作
    }

    // 更新数据源中的内容
    const db = wx.cloud.database();
    const cardsCollection = db.collection('cards');

    // 使用 update 方法更新指定文档的内容
    cardsCollection.doc(cardToUpdate._id).update({
      data: {
        content: editedContent
      }
    }).then(res => {
      console.log('更新卡片内容成功', res);
      this.loadCards();

      // 关闭模态框
      this.setData({
        showModal: false,
        editedContent: '' // 清空编辑内容
      });
    }).catch(err => {
      console.error('更新卡片内容失败：', err);
    });
  },

  // 取消按钮点击事件
  cancelEdit() {
    // 关闭模态框
    this.setData({
      showModal: false,
    });
  },

  deleteCard: function (e) {
    const index = e.currentTarget.dataset.index;
    const cardToDelete = this.data.cards[index];
    wx.showModal({
      title: '删除卡片',
      text: '确定要删除这张卡片吗？',
      success: res => {
        if (res.confirm) {
          const db = wx.cloud.database();
          const cardsCollection = db.collection('cards');
          cardsCollection.doc(cardToDelete._id).remove().then(res => {
            this.loadCards();
          }).catch(err => {
            console.error('删除卡片失败：', err);
          });
        }
      }
    });
  }
});
