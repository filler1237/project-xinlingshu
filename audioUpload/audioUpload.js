Page({
  data: {
    audioList: [], // 音频文件列表
    tempFilePath: '', // 临时文件路径
    uploadProgress: 0, // 上传进度
    isUploading: false, // 是否正在上传
    soundTypes: ['rain', 'forest', 'waves', 'fireplace', 'wind', 'night'], // 声音类型
    selectedType: 'rain', // 选中的声音类型
    audioNames: {
      rain: 'rain.mp3',
      forest: 'forest.mp3',
      waves: 'waves.mp3',
      fireplace: 'fireplace.mp3',
      wind: 'wind.mp3',
      night: 'night.mp3'
    } // 音频文件名映射
  },

  // 返回上一页面
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 选择音频文件
  chooseAudio: function() {
    const that = this;
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['mp3'],
      success(res) {
        const tempFilePath = res.tempFiles[0].path;
        const fileName = res.tempFiles[0].name;
        
        that.setData({
          tempFilePath: tempFilePath,
          selectedFile: fileName
        });
        
        // 自动检测文件类型
        const lowerName = fileName.toLowerCase();
        for (const type of that.data.soundTypes) {
          if (lowerName.includes(type)) {
            that.setData({
              selectedType: type
            });
            break;
          }
        }
        
        wx.showToast({
          title: '已选择文件',
          icon: 'success'
        });
      },
      fail(err) {
        console.error('选择文件失败', err);
        wx.showToast({
          title: '选择文件失败',
          icon: 'none'
        });
      }
    });
  },

  // 上传音频文件
  uploadAudio: function() {
    const that = this;
    
    if (!that.data.tempFilePath) {
      wx.showToast({
        title: '请先选择音频文件',
        icon: 'none'
      });
      return;
    }
    
    if (that.data.isUploading) {
      wx.showToast({
        title: '正在上传中，请稍候',
        icon: 'none'
      });
      return;
    }
    
    that.setData({
      isUploading: true,
      uploadProgress: 0
    });
    
    wx.showLoading({
      title: '上传中...',
    });
    
    // 先上传到临时路径
    const uploadTask = wx.cloud.uploadFile({
      cloudPath: 'temp/' + Date.now() + '-' + Math.floor(Math.random() * 10000) + '.mp3',
      filePath: that.data.tempFilePath,
      success: res => {
        // 调用云函数将文件移动到正式音频目录并保存信息
            wx.cloud.callFunction({
              name: 'uploadAudioFiles',
              data: {
                fileID: res.fileID,
                fileName: that.data.audioNames[that.data.selectedType],
                soundType: that.data.selectedType
              },
              success: result => {
                console.log('音频上传云函数结果:', result);
                wx.hideLoading();
                
                if (result.result.success) {
                  wx.showToast({
                    title: '音频上传成功',
                    icon: 'success'
                  });
                  
                  // 清空选择的文件
                  that.setData({
                    tempFilePath: '',
                    selectedFile: '',
                    uploadProgress: 100
                  });
                  
                  // 获取最新的音频资源列表
                  that.getAudioList();
                } else {
                  console.error('上传失败，错误详情:', result.result);
                  wx.showToast({
                    title: result.result.message || '上传失败',
                    icon: 'none',
                    duration: 3000
                  });
                }
              },
              fail: err => {
                console.error('调用云函数失败，错误详情:', {
                  code: err.errCode,
                  message: err.errMsg,
                  stack: err.stack
                });
                wx.hideLoading();
                
                // 根据错误码显示更具体的提示
                let errorMessage = '上传失败';
                if (err.errCode === -404011) {
                  errorMessage = '云函数不存在，请检查函数部署';
                } else if (err.errCode === -404010) {
                  errorMessage = '云开发环境未配置，请检查环境设置';
                }
                
                wx.showToast({
                  title: errorMessage,
                  icon: 'none',
                  duration: 3000
                });
              },
              complete: () => {
                that.setData({
                  isUploading: false
                });
              }
            });
      },
      fail: err => {
        console.error('上传到临时路径失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
        that.setData({
          isUploading: false
        });
      }
    });
    
    // 监听上传进度
    uploadTask.onProgressUpdate(res => {
      console.log('上传进度', res.progress);
      that.setData({
        uploadProgress: res.progress
      });
    });
  },

  // 获取音频资源列表
  getAudioList: function() {
    const that = this;
    
    wx.cloud.callFunction({
      name: 'getAudioResources',
      data: {
        action: 'getList'
      },
      success: res => {
        console.log('获取音频列表成功', res);
        if (res.result.success) {
          that.setData({
            audioList: res.result.data
          });
        }
      },
      fail: err => {
        console.error('获取音频列表失败', err);
      }
    });
  },

  // 删除音频资源
  deleteAudio: function(e) {
    const that = this;
    const fileID = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个音频资源吗？',
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'getAudioResources',
            data: {
              action: 'delete',
              fileID: fileID
            },
            success: result => {
              if (result.result.success) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                
                // 从列表中移除
                let newList = that.data.audioList;
                newList.splice(index, 1);
                that.setData({
                  audioList: newList
                });
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                });
              }
            },
            fail: err => {
              console.error('删除音频失败', err);
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 切换声音类型
  switchSoundType: function(e) {
    this.setData({
      selectedType: e.detail.value
    });
  },

  // 预览音频
  previewAudio: function(e) {
    const fileID = e.currentTarget.dataset.id;
    wx.playBackgroundAudio({ // 注意：wx.playBackgroundAudio 已废弃，建议使用 wx.getBackgroundAudioManager()
      dataUrl: fileID,
      title: '预览音频'
    });
  },

  onLoad: function() {
    // 页面加载时获取音频列表
    this.getAudioList();
  }
});