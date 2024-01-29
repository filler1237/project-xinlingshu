const app = getApp() // 获取小程序实例
const db = wx.cloud.database() // 获取云数据库实例
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formats: {}, // 富文本编辑器的格式
    readOnly: false, // 是否只读
    placeholder: '输入内容...', // 输入框的占位符
    editorHeight: 300, // 编辑器的高度
    keyboardHeight: 0, // 键盘的高度
    isIOS: false, // 是否为 iOS 系统
    title: '', // 标题
    diary: "", // 初始化diary字段
    id: '', // ID
    // 上传列表
    uploaderList: [],
    // 上传数量
    uploaderNum: 0,
    // 是否显示上传按钮+框
    showUpload: true,
    // 当前上传数量
    uploaderNowNum: 0,
  },

  // 表单提交事件
  formSubmit: function (e) {
    if (!e.detail.value.title) {
      return wx.showToast({
        title: '标题不能为空',
        icon: 'none'
      });
    } else if (!this.data.diary) {
      return wx.showToast({
        title: '内容不能为空',
        icon: 'none'
      });
    }
    wx.showLoading({ title: '加载中' });
    
    if (this.data.uploaderList.length > 0) {
      const uploadPromises = this.data.uploaderList.map(file => {
        return wx.cloud.uploadFile({
          cloudPath: 'diary/' + `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}` + file.match(/\.[^.]+?$/)[0],
          filePath: file,
        });
      });

      Promise.all(uploadPromises)
        .then(uploadResults => {
          const fileIDs = uploadResults.map(res => res.fileID);
          this.addDiary(e, fileIDs);
        })
        .catch(error => {
          console.error(error);
          wx.hideLoading();
          wx.showToast({ title: '上传失败', icon: 'none' });
        });
    } else {
      this.addDiary(e, []);
    }
  },

  // 将数据写入集合 diary 中
  addDiary: function (e, fileIDs) {
    const { title} = e.detail.value;
    const { photo } = this.data;
    db.collection('diary').add({
      data: {
        title: title,
        diary: this.data.diary,
        photo: fileIDs,
        create_time: new Date()
      }
    })
      .then(res => {
        wx.hideLoading();
        wx.showToast({ title: '添加成功', icon: 'success' });
        wx.redirectTo({ url: '../diary/diary' });
      })
      .catch(error => {
        console.error(error);
        wx.hideLoading();
        wx.showToast({ title: '添加失败', icon: 'none' });
      });
  },

  // 上传照片
  upload: function (e) {
    var that = this;
    wx.chooseImage({
      count: 2 - that.properties.uploaderNum, // 默认2
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二都有
      success: function (res) {
        console.log(res);
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths);

        let uploaderList = that.data.uploaderList.concat(tempFilePaths);

        if (!that.properties.type) {
          // 开启图文咨询
          if (uploaderList.length == 2) {
            that.setData({
              showUpload: false
            });
          }
          that.setData({
            uploaderList: uploaderList,
            uploaderNum: uploaderList.length,
          });
          // 触发自定义事件，将新的上传列表传递给父组件
          that.triggerEvent('getUploaderList', {
            uploaderList: uploaderList
          });
        } else {
          // 补充咨询
          if (uploaderList.length + that.properties.uploaderNum === 2) {
            that.setData({
              showUpload: false
            });
          }
          that.setData({
            uploaderList: uploaderList,
            uploaderNowNum: uploaderList.length + that.properties.uploaderNum
          });
          // 触发自定义事件，将新的上传列表和当前上传数量传递给父组件
          that.triggerEvent('getUploaderList', {
            uploaderList: uploaderList,
            uploaderNowNum: that.data.uploaderNowNum
          });
        }
      }
    });
  },

  // 查看照片
  showImg: function (e) {
    var that = this;
    wx.previewImage({
      urls: that.data.uploaderList,
      current: that.data.uploaderList[e.currentTarget.dataset.index]
    });
  },

  // 清除照片
  clearImg: function (e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除这张照片？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          var nowList = []; // 新数据
          var uploaderList = this.data.uploaderList; // 原数据

          for (let i = 0; i < uploaderList.length; i++) {
            if (i == e.currentTarget.dataset.index) {
              continue;
            } else {
              nowList.push(uploaderList[i]);
              continue;
            }
          }
          this.setData({
            uploaderNum: this.data.uploaderNum - 1,
            uploaderList: nowList,
            showUpload: true
          });
          // 触发自定义事件，将新的上传列表传递给父组件
          this.triggerEvent('getUploaderList', {
            uploaderList: nowList
          });
        }
      }
    })
  },
  onEditorInput(event) {
    const { detail } = event;
    const { html } = detail;
    const diaryWithoutTags = html.replace(/<\/?p>/g, ''); // 使用正则表达式替换 <p> 和 </p> 标签为空字符串
    this.setData({
      diary: diaryWithoutTags, // 将处理后的内容赋值给 diary 字段
    });
    console.log(this.data.diary);
  },
  // 返回按钮点击事件
  onBackTap: function (e) {
    var pages = getCurrentPages(); // 获取当前页面
    var prePage = pages[pages.length - 2]; // 获取上一页面
    prePage.setData({
      'search.page': 1 // 给上一页面的变量赋值
    })
    wx.navigateBack({ // 返回上一页面
      delta: 1,
    })
  },
})