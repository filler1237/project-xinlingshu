Page({
  data: {
    // 状态图标和文本映射
    statusIcons: {
      'submitted': '📤',
      'reviewing': '⏳',
      'completed': '✅',
      'rejected': '❌'
    },
    statusText: {
      'submitted': '已提交',
      'reviewing': '评审中',
      'completed': '已完成',
      'rejected': '未通过'
    },
    statusDesc: {
      'submitted': '作品已成功提交，等待评审',
      'reviewing': '评委正在评审您的作品',
      'completed': '评审已完成，可查看结果',
      'rejected': '作品未通过评审'
    },
    
    // 提交数据
    submission: null,
    
    // 加载状态
    loading: true,
    error: false,
    
    // 搜索关键词
    searchKeyword: '',
    
    // 当前步骤
    currentStep: 1,
    
    // API配置
    apiBaseUrl: 'https://your-api-domain.com/api', // 替换为真实API地址
    isTestData: false
  },

  onLoad: function (options) {
    console.log('查看结果页面加载，参数:', options);
    
    // 从路由参数获取提交ID
    const submissionId = options.id || options.submissionId;
    
    if (submissionId) {
      this.loadSubmissionData(submissionId);
    } else {
      this.setData({
        loading: false,
        error: false,
        submission: null
      });
    }
  },

  // 加载提交数据 - 准备接入真实API
  loadSubmissionData: function (submissionId) {
    this.setData({ 
      loading: true,
      error: false 
    });
    
    // 真实API调用示例 - 取消注释并配置正确的API地址
    /*
    wx.request({
      url: `${this.data.apiBaseUrl}/submissions/${submissionId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getApp().globalData.token}`, // 从全局获取token
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          const submissionData = res.data.data;
          this.handleSubmissionData(submissionData);
        } else {
          this.handleLoadError('数据加载失败');
        }
      },
      fail: (err) => {
        console.error('API请求失败:', err);
        this.handleLoadError('网络请求失败');
      },
      complete: () => {
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
      }
    });
    */
    
    // 临时使用模拟数据 - 上线前删除这部分
    setTimeout(() => {
      const mockData = this.getMockData(submissionId);
      this.handleSubmissionData(mockData);
      this.setData({ 
        isTestData: true,
        loading: false 
      });
      wx.stopPullDownRefresh();
    }, 1200);
  },

  // 处理提交数据
  handleSubmissionData: function (submissionData) {
    // 根据状态设置当前步骤
    let currentStep = 1;
    if (submissionData.status === 'reviewing') currentStep = 2;
    if (submissionData.status === 'completed' || submissionData.status === 'rejected') currentStep = 3;
    
    this.setData({
      submission: submissionData,
      currentStep: currentStep,
      error: false
    });
  },

  // 处理加载错误
  handleLoadError: function (errorMsg) {
    this.setData({
      error: true,
      submission: null
    });
    
    wx.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 2000
    });
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

  // 预览文件 - 真实API调用
  previewFile: function (e) {
    const fileUrl = e.currentTarget.dataset.url;
    const fileType = e.currentTarget.dataset.type;
    
    wx.showLoading({
      title: '加载文件中...',
    });

    // 真实文件预览
    if (fileType === 'image') {
      wx.previewImage({
        urls: [fileUrl],
        current: fileUrl
      });
      wx.hideLoading();
    } else if (fileType === 'pdf') {
      wx.openDocument({
        filePath: fileUrl,
        fileType: 'pdf',
        success: () => {
          wx.hideLoading();
        },
        fail: () => {
          wx.hideLoading();
          wx.showToast({
            title: '无法预览该文件',
            icon: 'none'
          });
        }
      });
    } else {
      setTimeout(() => {
        wx.hideLoading();
        wx.showModal({
          title: '文件预览',
          content: `文件类型: ${fileType}\n\n该文件类型需要特定应用打开，建议下载后查看。`,
          confirmText: '确定',
          showCancel: false
        });
      }, 800);
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

  // 创建测试数据
  createTestData: function () {
    this.loadSubmissionData('test');
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    if (this.data.submission) {
      this.loadSubmissionData(this.data.submission.id);
    } else {
      wx.stopPullDownRefresh();
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