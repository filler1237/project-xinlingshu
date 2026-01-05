Page({
  data: {
    // 状态图标和文本映射
    statusIcons: {
      'submitted': '📤',
      'reviewing': '⏳',
      'completed': '✅',
      'rejected': '❌',
      'pending': '📤'
    },
    statusText: {
      'submitted': '已提交',
      'reviewing': '评审中',
      'completed': '已完成',
      'rejected': '未通过',
      'pending': '待评审'
    },
    statusDesc: {
      'submitted': '作品已成功提交，等待评审',
      'reviewing': '评委正在评审您的作品',
      'completed': '评审已完成，可查看结果',
      'rejected': '作品未通过评审',
      'pending': '作品已提交，等待评审'
    },
    
    // 作品列表
    works: [],
    // 当前选中的作品
    submission: null,
    
    // 加载状态
    loading: true,
    error: false,
    
    // 搜索关键词
    searchKeyword: '',
    
    // 当前步骤
    currentStep: 1,
    
    isTestData: false
  },

  onLoad: function (options) {
    console.log('查看结果页面加载，参数:', options);
    
    // 从路由参数获取提交ID
    const submissionId = options.id || options.submissionId;
    
    // 加载作品列表
    this.loadWorksList(submissionId);
  },
  
  onShow: function() {
    // 每次显示时刷新数据
    this.loadWorksList();
  },

  // 加载作品列表
  loadWorksList: function (workId) {
    this.setData({ 
      loading: true,
      error: false 
    });
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    // 调用云函数获取学生作品列表
    wx.cloud.callFunction({
      name: 'getStudentWorks',
      data: {
        workId: workId || null,  // 如果指定了作品ID，只获取该作品
        page: 1,
        pageSize: 100
      },
      success: (res) => {
        wx.hideLoading();
        this.setData({ loading: false });
        
        console.log('✅ 云函数返回结果:', res.result);
        
        if (res.result && res.result.success) {
          const works = res.result.data || [];
          console.log('📊 获取到的作品数量:', works.length);
          console.log('📊 作品数据:', works);
          
          if (works.length === 0) {
            console.log('⚠️ 没有作品数据');
            this.setData({
              works: [],
              submission: null,
              error: false
            });
            wx.stopPullDownRefresh();
            return;
          }
          
          // 如果指定了作品ID，显示该作品；否则显示第一个作品
          const selectedWork = workId 
            ? works.find(w => w.id === workId || w._id === workId) || works[0]
            : works[0];
          
          console.log('🎯 选中的作品:', selectedWork);
          
          if (selectedWork) {
            this.handleSubmissionData(selectedWork);
            this.setData({
              works: works,
              isTestData: false
            });
          } else {
            console.error('❌ 未找到选中的作品');
            this.handleLoadError('未找到作品数据');
          }
        } else {
          console.error('❌ 云函数返回失败:', res.result);
          this.handleLoadError(res.result?.message || '数据加载失败');
        }
        
        wx.stopPullDownRefresh();
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ loading: false });
        console.error('💥 加载作品列表失败:', err);
        
        // 检查是否是云函数未部署
        if (err.errMsg && err.errMsg.includes('function not found')) {
          wx.showModal({
            title: '提示',
            content: '云函数未部署，请先上传 getStudentWorks 云函数',
            showCancel: false
          });
        } else {
          this.handleLoadError('网络请求失败，请稍后重试');
        }
        
        wx.stopPullDownRefresh();
      }
    });
  },

  // 处理提交数据
  handleSubmissionData: function (submissionData) {
    if (!submissionData) {
      console.error('❌ submissionData 为空');
      return;
    }
    
    console.log('🔧 处理作品数据:', submissionData);
    
    // 根据状态设置当前步骤
    let currentStep = 1;
    if (submissionData.status === 'reviewing') currentStep = 2;
    if (submissionData.status === 'completed' || submissionData.status === 'rejected') currentStep = 3;
    
    // 确保数据完整性
    const processedData = {
      id: submissionData.id || submissionData._id,
      _id: submissionData._id || submissionData.id,
      activityName: submissionData.activityName || '未知活动',
      submitTime: submissionData.submitTime || '未知时间',
      updateTime: submissionData.updateTime || submissionData.submitTime || '未知时间',
      workTitle: submissionData.workTitle || '未命名作品',
      workContent: submissionData.workContent || submissionData.description || '',
      status: submissionData.status || 'pending',
      finalScore: submissionData.finalScore || submissionData.averageScore || null,
      maxScore: submissionData.maxScore || 100,
      rank: submissionData.rank || null,
      certificateAvailable: submissionData.certificateAvailable || false,
      scores: submissionData.scores || [],
      attachments: submissionData.attachments || []
    };
    
    console.log('✅ 处理后的数据:', processedData);
    
    this.setData({
      submission: processedData,
      currentStep: currentStep,
      error: false
    });
  },

  // 处理加载错误
  handleLoadError: function (errorMsg) {
    this.setData({
      error: true,
      submission: null,
      works: []
    });
    
    console.error('❌ 加载错误:', errorMsg);
    
    // 不显示toast，让页面显示空状态
    // wx.showToast({
    //   title: errorMsg,
    //   icon: 'none',
    //   duration: 2000
    // });
  },

  // 搜索输入处理
  onSearchInput: function (e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 搜索处理
  onSearch: function () {
    const keyword = this.data.searchKeyword.trim();
    if (keyword) {
      wx.showToast({
        title: `搜索: ${keyword}`,
        icon: 'none'
      });
      
      // 真实搜索API调用示例
      /*
      wx.request({
        url: `${this.data.apiBaseUrl}/submissions/search`,
        method: 'POST',
        data: {
          keyword: keyword,
          page: 1,
          pageSize: 20
        },
        header: {
          'Authorization': `Bearer ${getApp().globalData.token}`,
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            // 处理搜索结果
            console.log('搜索结果:', res.data.data);
          }
        }
      });
      */
    }
  },

  // 返回上一页
  onBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },

  // 查看证书 - 真实API调用
  viewCertificate: function () {
    if (!this.data.submission || !this.data.submission.certificateAvailable) {
      wx.showToast({
        title: '证书暂不可用',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '加载证书中...',
    });

    // 真实证书API调用
    /*
    wx.request({
      url: `${this.data.apiBaseUrl}/certificates/${this.data.submission.id}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getApp().globalData.token}`
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data.success) {
          const certificateUrl = res.data.data.certificateUrl;
          // 预览证书
          wx.previewImage({
            urls: [certificateUrl],
            current: certificateUrl
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '证书加载失败',
          icon: 'none'
        });
      }
    });
    */
    
    // 模拟证书加载
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '参与证书',
        content: '恭喜您完成心理健康主题征文活动！\n\n颁发机构：心理健康教育中心\n获奖等级：优秀奖',
        confirmText: '确定',
        showCancel: false
      });
    }, 1500);
  },

  // 下载作品 - 真实API调用
  downloadWork: function () {
    wx.showLoading({
      title: '准备下载...',
    });

    // 真实下载API调用
    /*
    wx.request({
      url: `${this.data.apiBaseUrl}/submissions/${this.data.submission.id}/download`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getApp().globalData.token}`
      },
      responseType: 'arraybuffer',
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          const fileManager = wx.getFileSystemManager();
          const filePath = `${wx.env.USER_DATA_PATH}/${this.data.submission.workTitle}.zip`;
          
          fileManager.writeFile({
            filePath: filePath,
            data: res.data,
            encoding: 'binary',
            success: () => {
              wx.saveFile({
                tempFilePath: filePath,
                success: (saveRes) => {
                  wx.showToast({
                    title: '下载成功',
                    icon: 'success'
                  });
                }
              });
            }
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
    */
    
    // 模拟下载
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '下载成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 预览文件 - 使用云存储文件ID
  previewFile: function (e) {
    const fileID = e.currentTarget.dataset.fileid || e.currentTarget.dataset.url;
    const fileType = e.currentTarget.dataset.type;
    
    if (!fileID) {
      wx.showToast({
        title: '文件不存在',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '加载文件中...',
    });

    // 根据文件类型预览
    if (fileType === 'image' || fileType === 'jpg' || fileType === 'png') {
      // 预览图片
      wx.cloud.getTempFileURL({
        fileList: [fileID],
        success: (res) => {
          wx.hideLoading();
          if (res.fileList && res.fileList.length > 0) {
            wx.previewImage({
              urls: [res.fileList[0].tempFileURL],
              current: res.fileList[0].tempFileURL
            });
          }
        },
        fail: () => {
          wx.hideLoading();
          wx.showToast({
            title: '预览失败',
            icon: 'none'
          });
        }
      });
    } else if (fileType === 'pdf') {
      // 下载PDF后预览
      wx.cloud.downloadFile({
        fileID: fileID,
        success: (res) => {
          wx.hideLoading();
          wx.openDocument({
            filePath: res.tempFilePath,
            fileType: 'pdf',
            success: () => {},
            fail: () => {
              wx.showToast({
                title: '无法预览该文件',
                icon: 'none'
              });
            }
          });
        },
        fail: () => {
          wx.hideLoading();
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      });
    } else {
      // 其他文件类型，下载后提示
      wx.cloud.downloadFile({
        fileID: fileID,
        success: (res) => {
          wx.hideLoading();
          wx.showModal({
            title: '文件下载',
            content: `文件已下载到临时目录\n\n文件类型: ${fileType}\n\n请使用相应应用打开查看。`,
            confirmText: '确定',
            showCancel: false
          });
        },
        fail: () => {
          wx.hideLoading();
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      });
    }
  },

  // 获取文件图标
  getFileIcon: function (type) {
    const icons = {
      'doc': '📄',
      'docx': '📄',
      'pdf': '📑',
      'image': '🖼️',
      'jpg': '🖼️',
      'png': '🖼️',
      'video': '🎬',
      'audio': '🎵',
      'zip': '📦',
      'txt': '📝'
    };
    return icons[type] || '📎';
  },

  // 创建测试数据（保留用于测试）
  createTestData: function () {
    const mockData = this.getMockData('test');
    this.handleSubmissionData(mockData);
    this.setData({ 
      isTestData: true,
      works: [mockData]
    });
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    const workId = this.data.submission ? this.data.submission.id : null;
    this.loadWorksList(workId);
  },
  
  // 选择作品
  onSelectWork: function(e) {
    const workId = e.currentTarget.dataset.id;
    const work = this.data.works.find(w => w.id === workId || w._id === workId);
    if (work) {
      this.handleSubmissionData(work);
    }
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: '我的作品提交结果',
      path: '/pages/student/viewResult/viewResult?id=' + (this.data.submission ? this.data.submission.id : '')
    };
  },

  // 模拟数据 - 上线前删除
  getMockData: function (submissionId) {
    const baseData = {
      id: submissionId || 'test',
      activityName: "心理健康主题征文",
      submitTime: "2024-01-15 14:30:25",
      updateTime: "2024-01-20 09:15:42",
      workTitle: "心灵成长之路——自我认知的重要性",
      workContent: "在心理健康教育的道路上，我逐渐认识到自我认知的重要性。通过参与这次活动，我学会了更好地理解自己的情绪，掌握了应对压力的方法。\n\n心理健康不仅仅是 absence of mental illness，更是一种积极的心理状态。在这次创作过程中，我深入思考了心理健康与个人成长的关系。我发现，当我们能够正视自己的内心世界，接纳自己的不完美时，我们就迈出了成长的重要一步。\n\n感谢组委会提供这个平台，让我有机会表达对心理健康的理解和思考。这段经历让我更加关注自己的内心世界，也学会了如何更好地与他人沟通和相处。真正的心理健康，是在面对挑战时依然保持内心的平静与力量。",
      status: "completed",
      finalScore: 88,
      maxScore: 100,
      rank: 5,
      certificateAvailable: true,
      scores: [
        {
          judgeId: 1,
          judgeName: "张老师",
          judgeRole: "专业评委",
          totalScore: 85,
          maxScore: 100,
          criteria: [
            { name: "内容质量", score: 28 },
            { name: "创意表达", score: 27 },
            { name: "结构逻辑", score: 30 }
          ],
          comment: "作品内容充实，表达清晰，但在创意方面还有提升空间。作者对心理健康有较好的理解，文章结构完整。"
        },
        {
          judgeId: 2,
          judgeName: "李教授",
          judgeRole: "特邀专家",
          totalScore: 90,
          maxScore: 100,
          criteria: [
            { name: "内容质量", score: 30 },
            { name: "创意表达", score: 29 },
            { name: "结构逻辑", score: 31 }
          ],
          comment: "观点新颖，逻辑严密，是一篇优秀的心理健康主题作品。作者展现出了深刻的思考和良好的表达能力。"
        }
      ],
      attachments: [
        {
          id: 1,
          name: "心灵成长之路.docx",
          type: "docx",
          size: "2.3MB",
          url: "https://example.com/files/work1.docx"
        },
        {
          id: 2,
          name: "相关图片.jpg",
          type: "image",
          size: "1.5MB",
          url: "https://example.com/files/image1.jpg"
        }
      ]
    };

    // 根据不同的ID返回不同的状态
    if (submissionId === 'reviewing') {
      return {
        ...baseData,
        id: 'reviewing',
        status: 'reviewing',
        finalScore: null,
        rank: null,
        certificateAvailable: false,
        scores: [],
        updateTime: "2024-01-16 10:20:15"
      };
    } else if (submissionId === 'submitted') {
      return {
        ...baseData,
        id: 'submitted',
        status: 'submitted',
        finalScore: null,
        rank: null,
        certificateAvailable: false,
        scores: [],
        updateTime: "2024-01-15 14:30:25"
      };
    }

    return baseData;
  }
});