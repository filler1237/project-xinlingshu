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
      extension: ['mp3', 'wav', 'm4a', 'aac'],
      success: res => {
        console.log('文件选择结果:', res);
        
        if (!res.tempFiles || res.tempFiles.length === 0) {
          wx.showToast({
            title: '未找到选择的文件',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        
        const tempFile = res.tempFiles[0];
        const tempFilePath = tempFile.path;
        const fileName = tempFile.name;
        
        // 检查文件大小，限制为50MB
        const fileSize = tempFile.size / 1024 / 1024; // 转换为MB
        console.log('文件信息:', { fileName, fileSize: fileSize.toFixed(2) + 'MB' });
        
        if (fileSize > 50) {
          wx.showToast({
            title: '文件大小不能超过50MB',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        
        // 检查文件类型
        const validExtensions = /\.(mp3|wav|m4a|aac)$/i;
        if (!validExtensions.test(fileName)) {
          wx.showToast({
            title: '仅支持mp3、wav、m4a、aac格式',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        
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
          title: '文件选择成功',
          icon: 'success',
          duration: 1500
        });
      },
      fail: err => {
        console.error('选择文件失败', err);
        // 用户取消选择不算失败，不显示错误提示
        if (err.errMsg && !err.errMsg.includes('cancel')) {
          let errorTitle = '文件选择失败';
          if (err.errCode === -1) {
            errorTitle = '选择文件出错，请重试';
          }
          wx.showToast({
            title: errorTitle,
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  // 上传音频文件
  uploadAudio: function() {
    const that = this;
    
    if (!that.data.tempFilePath) {
      wx.showToast({
        title: '请先选择音频文件',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    if (that.data.isUploading) {
      wx.showToast({
        title: '正在上传中，请稍候',
        icon: 'none',
        duration: 2000
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
    
    try {
      // 获取文件扩展名，确保文件类型正确
      const fileName = that.data.selectedFile || 'audio.mp3';
      const extension = fileName.split('.').pop() || 'mp3';
      
      // 生成临时上传路径，保留原文件扩展名
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 10000);
      const tempCloudPath = `temp/${timestamp}-${randomNum}.${extension}`;
      
      console.log('开始上传音频，临时路径:', tempCloudPath, '原文件名:', fileName);
      
      // 检查云开发环境是否初始化
      if (!wx.cloud) {
        throw new Error('微信云开发未初始化');
      }
      
      // 先上传到临时路径
      const uploadTask = wx.cloud.uploadFile({
        cloudPath: tempCloudPath,
        filePath: that.data.tempFilePath,
        success: res => {
          console.log('临时上传成功，fileID:', res.fileID);
          
          // 确保文件ID存在
          if (!res.fileID) {
            throw new Error('临时上传成功但未返回fileID');
          }
          
          // 调用云函数将文件移动到正式音频目录并保存信息
          wx.cloud.callFunction({
            name: 'uploadAudioFiles',
            data: {
              fileID: res.fileID,
              fileName: that.data.audioNames[that.data.selectedType] || 'audio.mp3',
              soundType: that.data.selectedType
            },
            success: result => {
              console.log('音频上传云函数结果:', result);
              
              if (result.result && result.result.success) {
                wx.hideLoading();
                wx.showToast({
                  title: '音频上传成功',
                  icon: 'success',
                  duration: 2000
                });
                
                // 清空选择的文件
                that.setData({
                  tempFilePath: '',
                  selectedFile: '',
                  uploadProgress: 100
                });
                
                // 获取最新的音频资源列表
                setTimeout(() => {
                  that.getAudioList();
                }, 500);
              } else {
                console.error('上传失败，错误详情:', result.result);
                wx.hideLoading();
                wx.showToast({
                  title: result.result?.message || '上传失败，请重试',
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
              } else if (err.errCode === -1) {
                errorMessage = '网络连接失败，请检查网络';
              } else if (err.errMsg && err.errMsg.includes('FunctionName parameter could not be found')) {
                errorMessage = '云函数名称错误，请检查函数名';
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
          
          // 根据错误类型提供更具体的错误信息
          let errorTitle = '上传失败';
          if (err.errMsg && err.errMsg.includes('storage')) {
            errorTitle = '云存储上传失败，请检查存储权限';
          } else if (err.errMsg && err.errMsg.includes('permission')) {
            errorTitle = '权限不足，请检查云开发配置';
          } else if (err.errMsg && err.errMsg.includes('file not exist')) {
            errorTitle = '文件不存在，请重新选择';
          }
          
          wx.showToast({
            title: errorTitle,
            icon: 'none',
            duration: 3000
          });
          
          that.setData({
            isUploading: false
          });
        }
      });
      
      // 监听上传进度
      uploadTask.onProgressUpdate(res => {
        console.log('上传进度:', res.progress + '%');
        that.setData({
          uploadProgress: res.progress
        });
      });
    } catch (error) {
      console.error('上传过程中发生异常:', error);
      wx.hideLoading();
      wx.showToast({
        title: '上传过程出错: ' + error.message,
        icon: 'none',
        duration: 3000
      });
      that.setData({
        isUploading: false
      });
    }
  },

  // 获取音频资源列表
  getAudioList: function() {
    const that = this;
    
    wx.showLoading({
      title: '加载中...',
    });
    
    console.log('开始获取音频列表，类型:', that.data.selectedType);
    
    try {
      // 检查云开发环境是否初始化
      if (!wx.cloud) {
        throw new Error('微信云开发未初始化');
      }
      
      // 打印云开发环境信息，用于调试
      console.log('云开发环境状态检查:', {
        wxCloudExists: !!wx.cloud,
        cloudFunctionName: 'getAudioResources',
        callFunctionExists: typeof wx.cloud.callFunction === 'function',
        SDKVersion: wx.getSystemInfoSync().SDKVersion,
        env: wx.cloud && wx.cloud.getWXContext ? wx.cloud.getWXContext() : '无法获取上下文'
      });
      
      // 检查基础库版本
      const version = wx.getSystemInfoSync().SDKVersion;
      console.log('当前基础库版本:', version);
      if (this.compareVersion(version, '2.7.1') < 0) {
        console.warn('基础库版本过低，云开发功能可能不可用');
        wx.showToast({
          title: '基础库版本过低，请更新微信',
          icon: 'none',
          duration: 3000
        });
        wx.hideLoading();
        return;
      }
      
      wx.cloud.callFunction({
        name: 'getAudioResources',
        data: {
          action: 'getList',
          soundType: that.data.selectedType
        },
        success: res => {
          console.log('获取音频列表成功', res);
          
          if (res.result && res.result.success) {
            that.setData({
              audioList: res.result.data || []
            });
            
            // 如果列表为空，显示提示
            if (!res.result.data || res.result.data.length === 0) {
              wx.showToast({
                title: '暂无音频资源',
                icon: 'none',
                duration: 2000
              });
            }
          } else {
            console.warn('获取列表返回非成功状态:', res.result);
            that.setData({
              audioList: []
            });
          }
        },
        fail: err => {
          console.error('获取音频列表失败', {
            code: err.errCode,
            message: err.errMsg,
            stack: err.stack
          });
          
          // 根据错误类型提供更具体的错误信息
          let errorTitle = '加载失败，请重试';
          let errorDetail = '';
          
          if (err.errCode === -501000 || (err.errMsg && err.errMsg.includes('FunctionName parameter could not be found'))) {
            errorTitle = '函数名称参数未找到';
            errorDetail = '请检查：1.云函数是否已部署 2.函数名称是否正确 3.开发环境是否一致';
            console.error('关键错误：FunctionName未找到，请确认getAudioResources函数已正确部署到云环境');
          } else if (err.errCode === -404011) {
            errorTitle = '云函数不存在';
            errorDetail = '请在微信开发者工具中上传并部署getAudioResources函数';
          } else if (err.errCode === -404010) {
            errorTitle = '云开发环境未配置';
            errorDetail = '请检查app.js中的云开发环境配置';
          } else if (err.errCode === -1) {
            errorTitle = '网络连接失败';
          } else {
            errorDetail = `错误代码: ${err.errCode}\n错误信息: ${err.errMsg}`;
          }
          
          console.error('详细错误信息:', errorDetail);
          
          wx.showToast({
            title: errorTitle,
            icon: 'none',
            duration: 3000
          });
          
          // 确保列表为空，避免显示错误数据
          that.setData({
            audioList: []
          });
        },
        complete: () => {
          // 无论成功失败，都隐藏加载提示
          wx.hideLoading();
        }
      });
    } catch (exception) {
      console.error('getAudioList函数执行异常:', exception);
      wx.hideLoading();
      wx.showToast({
        title: '获取列表过程出错',
        icon: 'none',
        duration: 3000
      });
      // 确保列表为空，避免显示错误数据
      that.setData({
        audioList: []
      });
    }
  },

  // 删除音频资源
  deleteAudio: function(e) {
    const that = this;
    const fileID = e.currentTarget.dataset.id;
    
    console.log('准备删除音频:', { fileID });
    
    if (!fileID) {
      wx.showToast({
        title: '文件ID无效',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个音频文件吗？删除后不可恢复。',
      confirmColor: '#e74c3c',
      cancelColor: '#95a5a6',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
          });
          
          try {
            // 检查云开发环境是否初始化
            if (!wx.cloud) {
              throw new Error('微信云开发未初始化');
            }
            
            wx.cloud.callFunction({
              name: 'getAudioResources',
              data: {
                action: 'delete',
                fileID: fileID
              },
              success: res => {
                console.log('删除音频成功', res);
                
                if (res.result && res.result.success) {
                  wx.showToast({
                    title: '删除成功',
                    icon: 'success',
                    duration: 2000
                  });
                  
                  // 更新音频列表
                  setTimeout(() => {
                    that.getAudioList();
                  }, 500);
                } else {
                  console.warn('删除返回非成功状态:', res.result);
                  wx.showToast({
                    title: res.result?.message || '删除失败',
                    icon: 'none',
                    duration: 3000
                  });
                }
              },
              fail: err => {
                console.error('删除音频失败', {
                  code: err.errCode,
                  message: err.errMsg,
                  stack: err.stack
                });
                
                let errorTitle = '删除失败';
                if (err.errCode === -404011) {
                  errorTitle = '云函数不存在';
                } else if (err.errCode === -1) {
                  errorTitle = '网络异常';
                } else if (err.errMsg && err.errMsg.includes('FunctionName parameter could not be found')) {
                  errorTitle = '云函数名称错误，请检查函数名';
                }
                
                wx.showToast({
                  title: errorTitle,
                  icon: 'none',
                  duration: 3000
                });
              },
              complete: () => {
                wx.hideLoading();
              }
            });
          } catch (error) {
            console.error('删除音频过程中发生异常:', error);
            wx.hideLoading();
            wx.showToast({
              title: '删除过程出错: ' + error.message,
              icon: 'none',
              duration: 3000
            });
          }
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
    
    try {
      // 使用推荐的 BackgroundAudioManager API
      const audioManager = wx.getBackgroundAudioManager();
      audioManager.title = '预览音频';
      audioManager.src = fileID;
      
      wx.showToast({
        title: '开始播放预览',
        icon: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('预览音频失败', error);
      wx.showToast({
        title: '播放失败，请重试',
        icon: 'none',
        duration: 3000
      });
    }
  },

  // 版本号比较函数
  compareVersion: function(v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    const len = Math.max(v1.length, v2.length);
    
    while (v1.length < len) {
      v1.push('0');
    }
    while (v2.length < len) {
      v2.push('0');
    }
    
    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i]);
      const num2 = parseInt(v2[i]);
      
      if (num1 > num2) {
        return 1;
      } else if (num1 < num2) {
        return -1;
      }
    }
    
    return 0;
  },
  
  onLoad: function() {
    // 页面加载时获取音频列表
    this.getAudioList();
  }
});