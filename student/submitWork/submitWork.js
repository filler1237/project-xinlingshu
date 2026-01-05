// pages/student/submitWork/submitWork.js
Page({
  data: {
    // 用户已报名的活动列表
    registeredActivities: [],
    selectedActivity: null,
    workTitle: '',
    workDescription: '',
    
    // 不同格式的上传区块
    imageFiles: [],       // 图片文件
    documentFiles: [],    // 文档文件  
    videoFiles: [],       // 视频文件
    audioFiles: [],       // 音频文件
    archiveFiles: [],     // 压缩包
    
    // 当前选中的文件类型（用于显示哪个区块有文件）
    currentFileType: null,
    
    loading: false,
    userInfo: null,
    
    // 文件类型配置
    fileTypes: {
      image: {
        name: '图片作品',
        desc: '支持JPG、PNG、GIF等图片格式',
        accept: 'image/*',
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
        maxSize: 10 * 1024 * 1024, // 10MB
        icon: '/images/icons/image.png'
      },
      document: {
        name: '文档作品', 
        desc: '支持PDF、Word、PPT、TXT等文档格式',
        accept: '.pdf,.doc,.docx,.ppt,.pptx,.txt,.md',
        extensions: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.md'],
        maxSize: 20 * 1024 * 1024, // 20MB
        icon: '/images/icons/document.png'
      },
      video: {
        name: '视频作品',
        desc: '支持MP4、AVI、MOV等视频格式',
        accept: 'video/*',
        extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
        maxSize: 100 * 1024 * 1024, // 100MB
        icon: '/images/icons/video.png'
      },
      audio: {
        name: '音频作品',
        desc: '支持MP3、WAV等音频格式',
        accept: 'audio/*',
        extensions: ['.mp3', '.wav', '.aac', '.flac', '.m4a'],
        maxSize: 50 * 1024 * 1024, // 50MB
        icon: '/images/icons/audio.png'
      },
      archive: {
        name: '压缩包作品',
        desc: '支持ZIP、RAR等压缩格式（可包含多个文件）',
        accept: '.zip,.rar,.7z',
        extensions: ['.zip', '.rar', '.7z'],
        maxSize: 50 * 1024 * 1024, // 50MB
        icon: '/images/icons/archive.png'
      }
    }
  },

  /**
   * 页面加载时执行
   */
  onLoad(options) {
    console.log('🎨 提交作品页面加载 - 多格式版本');
    
    // 初始化用户信息
    this.initUserInfo();
    
    // 如果有传递活动ID，直接加载该活动
    const { activityId, title } = options;
    if (activityId) {
      console.log('🎯 从上一页传递活动ID:', activityId);
      this.loadActivityDetail(activityId);
    } else {
      // 否则加载用户所有已报名的活动
      this.loadRegisteredActivities();
    }
  },

  /**
   * 加载活动详情（从活动ID直接加载）
   */
  loadActivityDetail(activityId) {
    wx.showLoading({
      title: '加载中...',
    });
    
    // 调用云函数获取活动详情
    wx.cloud.callFunction({
      name: 'getActivities',
      data: {
        status: 'all',
        page: 1,
        pageSize: 100
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.result.success && res.result.data) {
          // 查找指定的活动
          const activity = res.result.data.find(a => 
            (a.id === activityId || a._id === activityId)
          );
          
          if (activity) {
            // 检查活动状态
            if (activity.statusType !== 'running' && activity.status !== 'running') {
              wx.showToast({
                title: '该活动当前不允许提交作品',
                icon: 'none'
              });
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
              return;
            }
            
            // 检查是否已提交作品
            wx.cloud.callFunction({
              name: 'getStudentActivities',
              data: {},
              success: (checkRes) => {
                if (checkRes.result.success) {
                  const hasSubmitted = checkRes.result.data.some(a => 
                    (a.id === activityId || a._id === activityId) && a.hasSubmitted
                  );
                  
                  if (hasSubmitted) {
                    wx.showToast({
                      title: '您已为该活动提交过作品',
                      icon: 'none'
                    });
                    setTimeout(() => {
                      wx.navigateBack();
                    }, 1500);
                    return;
                  }
                }
                
                // 设置选中的活动
                this.setData({
                  selectedActivity: {
                    id: activity.id || activity._id,
                    _id: activity._id || activity.id,
                    title: activity.title || activity.theme,
                    theme: activity.theme || activity.title,
                    description: activity.description,
                    organizer: activity.organizer || '心理健康中心',
                    status: activity.statusText || '进行中'
                  }
                });
              },
              fail: () => {
                // 即使检查失败，也允许继续（由提交时再检查）
                this.setData({
                  selectedActivity: {
                    id: activity.id || activity._id,
                    _id: activity._id || activity.id,
                    title: activity.title || activity.theme,
                    theme: activity.theme || activity.title,
                    description: activity.description,
                    organizer: activity.organizer || '心理健康中心',
                    status: activity.statusText || '进行中'
                  }
                });
              }
            });
          } else {
            wx.showToast({
              title: '活动不存在',
              icon: 'none'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }
        } else {
          wx.showToast({
            title: '加载活动失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('加载活动详情失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 初始化用户信息
   */
  initUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ userInfo });
        console.log('✅ 用户信息加载成功:', userInfo);
      } else {
        console.error('❌ 未找到用户信息');
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('💥 初始化用户信息失败:', error);
    }
  },

  /**
   * 加载用户可提交作品的活动列表
   */
  loadRegisteredActivities() {
    const userInfo = this.data.userInfo;
    if (!userInfo) {
      console.error('❌ 用户信息为空');
      return;
    }
    
    console.log('📋 加载可提交作品的活动列表');
    
    wx.showLoading({
      title: '加载中...',
    });
    
    // 调用云函数获取可提交作品的活动列表
    wx.cloud.callFunction({
      name: 'getStudentActivities',
      data: {},
      success: (res) => {
        wx.hideLoading();
        console.log('✅ 获取活动列表成功:', res.result);
        
        if (res.result.success && res.result.data && res.result.data.length > 0) {
          // 格式化活动数据，适配前端显示
          const formattedActivities = res.result.data.map(activity => ({
            activity: {
              id: activity.id || activity._id,
              _id: activity._id || activity.id,
              title: activity.title || activity.theme,
              theme: activity.theme || activity.title,
              description: activity.description,
              organizer: activity.organizer || '心理健康中心',
              status: activity.statusText || '进行中',
              startTime: activity.startTime,
              endTime: activity.endTime
            },
            hasSubmitted: activity.hasSubmitted || false
          }));
          
          this.setData({
            registeredActivities: formattedActivities
          });
        } else {
          console.log('❌ 暂无可以提交作品的活动');
          this.setData({
            registeredActivities: []
          });
          wx.showToast({
            title: res.result.message || '暂无可以提交作品的活动',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('💥 获取活动列表失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 选择活动
   */
  onActivitySelect(e) {
    const index = e.currentTarget.dataset.index;
    const activityItem = this.data.registeredActivities[index];
    
    this.setData({ 
      selectedActivity: activityItem.activity 
    });
    
    console.log('✅ 选择活动:', activityItem.activity.title);
  },

  /**
   * 输入作品标题
   */
  onTitleInput(e) {
    this.setData({ workTitle: e.detail.value });
  },

  /**
   * 输入作品描述
   */
  onDescriptionInput(e) {
    this.setData({ workDescription: e.detail.value });
  },

  /**
   * 选择文件 - 根据类型选择
   */
  onChooseFile(e) {
    const fileType = e.currentTarget.dataset.type;
    console.log('📁 选择文件类型:', fileType);
    
    const typeConfig = this.data.fileTypes[fileType];
    if (!typeConfig) {
      wx.showToast({
        title: '不支持的文件类型',
        icon: 'none'
      });
      return;
    }
    
    // 检查是否已经上传了该类型的文件
    const currentFiles = this.data[`${fileType}Files`];
    if (currentFiles && currentFiles.length > 0) {
      wx.showModal({
        title: '提示',
        content: '已上传该类型文件，是否替换？',
        success: (res) => {
          if (res.confirm) {
            this.selectFile(fileType, typeConfig);
          }
        }
      });
    } else {
      this.selectFile(fileType, typeConfig);
    }
  },

  /**
   * 选择文件的具体逻辑
   */
  selectFile(fileType, typeConfig) {
    wx.chooseMessageFile({
      count: 1,
      type: fileType === 'image' ? 'image' : 
            fileType === 'video' ? 'video' : 
            fileType === 'audio' ? 'file' : 'file',
      extension: fileType === 'image' || fileType === 'video' || fileType === 'audio' ? 
                 undefined : typeConfig.accept.split(','),
      success: (res) => {
        const file = res.tempFiles[0];
        console.log('📄 选择文件:', file);
        
        // 验证文件扩展名
        if (!this.validateFileExtension(file.name, typeConfig.extensions)) {
          wx.showToast({
            title: `请上传${typeConfig.name}支持的文件格式`,
            icon: 'none'
          });
          return;
        }
        
        // 验证文件大小
        if (file.size > typeConfig.maxSize) {
          const maxSizeMB = typeConfig.maxSize / (1024 * 1024);
          wx.showToast({
            title: `文件过大，最大支持${maxSizeMB}MB`,
            icon: 'none'
          });
          return;
        }
        
        // 上传文件到后端
        this.uploadFile(file, fileType);
      },
      fail: (err) => {
        console.error('💥 选择文件失败:', err);
        wx.showToast({
          title: '选择文件失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 验证文件扩展名
   */
  validateFileExtension(fileName, allowedExtensions) {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    return allowedExtensions.some(ext => extension === ext);
  },

  /**
   * 上传文件到云存储
   */
  uploadFile(file, fileType) {
    wx.showLoading({
      title: '上传中...',
    });
    
    // 构建云存储路径
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
    const cloudPath = `works/${fileType}/${Date.now()}_${file.name}`;
    
    // 上传文件到云存储
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: file.path,
      success: (res) => {
        wx.hideLoading();
        console.log('✅ 文件上传成功:', res);
        
        // 创建文件对象
        const fileObj = {
          name: file.name,
          size: this.formatFileSize(file.size),  // 格式化的大小（用于显示）
          sizeBytes: file.size,                   // 原始字节数（用于提交）
          type: fileType,
          fileID: res.fileID,                     // 云存储文件ID
          path: file.path,                        // 临时路径
          uploadTime: new Date().toISOString()
        };
        
        // 根据文件类型保存到对应的数组
        const dataKey = `${fileType}Files`;
        this.setData({
          [dataKey]: [fileObj],
          currentFileType: fileType
        });
        
        console.log(`✅ ${this.data.fileTypes[fileType].name}上传成功`);
        wx.showToast({
          title: '文件上传成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('💥 文件上传失败:', err);
        wx.showToast({
          title: err.errMsg || '文件上传失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 删除文件 - 根据类型删除
   */
  onRemoveFile(e) {
    const fileType = e.currentTarget.dataset.type;
    console.log('🗑️ 删除文件类型:', fileType);
    
    const dataKey = `${fileType}Files`;
    this.setData({
      [dataKey]: [],
      currentFileType: null
    });
    
    wx.showToast({
      title: '文件已删除',
      icon: 'success'
    });
  },

  /**
   * 格式化文件大小
   */
  formatFileSize(size) {
    if (size < 1024) {
      return size + 'B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + 'KB';
    } else {
      return (size / (1024 * 1024)).toFixed(1) + 'MB';
    }
  },

  /**
   * 提交作品
   */
  onSubmit() {
    const { selectedActivity, workTitle, workDescription, userInfo } = this.data;
    
    // 获取上传的文件（只取第一个有文件的类型）
    const uploadedFile = this.getUploadedFile();
    
    // 表单验证
    if (!this.validateForm(selectedActivity, workTitle, uploadedFile)) {
      return;
    }
    
    this.setData({ loading: true });
    
    console.log('🚀 开始提交作品...');
    
    // 调用云函数提交作品
    wx.cloud.callFunction({
      name: 'submitWork',
      data: {
        activityId: selectedActivity.id || selectedActivity._id,
        title: workTitle.trim(),
        description: workDescription ? workDescription.trim() : '',
        fileID: uploadedFile.fileID,
        fileName: uploadedFile.name,
        fileType: uploadedFile.type,
        fileSize: uploadedFile.sizeBytes || uploadedFile.size || 0,
        studentName: userInfo.username || userInfo.nickName || '学生'
      },
      success: (res) => {
        this.setData({ loading: false });
        console.log('📡 作品提交响应:', res.result);
        
        if (res.result.success) {
          this.showSuccess();
        } else {
          this.showError(res.result.message || '提交失败');
        }
      },
      fail: (err) => {
        this.setData({ loading: false });
        console.error('💥 作品提交失败:', err);
        this.showError('网络错误，请稍后重试');
      }
    });
  },
  
  /**
   * 解析文件大小（将格式化的字符串转回字节数）
   */
  parseFileSize(sizeStr) {
    if (typeof sizeStr === 'number') return sizeStr;
    if (!sizeStr) return 0;
    
    const unit = sizeStr.slice(-2).toUpperCase();
    const value = parseFloat(sizeStr);
    
    if (unit === 'KB') return value * 1024;
    if (unit === 'MB') return value * 1024 * 1024;
    if (unit === 'GB') return value * 1024 * 1024 * 1024;
    return value; // 默认当作字节
  },

  /**
   * 获取已上传的文件（只取第一个有文件的类型）
   */
  getUploadedFile() {
    const fileTypes = ['image', 'document', 'video', 'audio', 'archive'];
    
    for (const type of fileTypes) {
      const files = this.data[`${type}Files`];
      if (files && files.length > 0) {
        return files[0];
      }
    }
    
    return null;
  },

  /**
   * 表单验证
   */
  validateForm(selectedActivity, workTitle, uploadedFile) {
    if (!selectedActivity) {
      wx.showToast({
        title: '请选择活动',
        icon: 'none'
      });
      return false;
    }

    if (!workTitle.trim()) {
      wx.showToast({
        title: '请输入作品标题',
        icon: 'none'
      });
      return false;
    }

    if (!uploadedFile) {
      wx.showToast({
        title: '请上传作品文件',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  /**
   * 提交成功处理
   */
  showSuccess() {
    wx.showToast({
      title: '作品提交成功！',
      icon: 'success',
      duration: 2000
    });
    
    // 清空表单
    setTimeout(() => {
      this.setData({
        workTitle: '',
        workDescription: '',
        imageFiles: [],
        documentFiles: [],
        videoFiles: [],
        audioFiles: [],
        archiveFiles: [],
        currentFileType: null
      });
      
      wx.navigateBack();
    }, 2000);
  },

  /**
   * 提交错误处理
   */
  showError(message) {
    wx.showToast({
      title: message || '提交失败',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  onBackTap() {
    wx.navigateBack({
      delta: 1,
    });
  },

  /**
   * 查看文件详情
   */
  onViewFileDetail(e) {
    const fileType = e.currentTarget.dataset.type;
    const files = this.data[`${fileType}Files`];
    
    if (files && files.length > 0) {
      const file = files[0];
      wx.showModal({
        title: '文件详情',
        content: `文件名：${file.name}\n文件大小：${file.size}\n文件类型：${this.data.fileTypes[fileType].name}`,
        showCancel: false,
        confirmText: '确定'
      });
    }
  }
});