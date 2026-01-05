Page({
  data: {
    currentFilter: 'all',
    workList: [],
    totalCount: 0,
    pendingCount: 0,
    baseUrl: 'http://localhost:3000/api',
    loading: false
  },

  onLoad: function(options) {
    console.log('📱 作品列表页面加载');
    
    if (options && options.filter) {
      this.setData({
        currentFilter: options.filter
      });
    }
    this.loadWorkList();
  },

  onShow: function() {
    // 页面显示时刷新数据
    this.loadWorkList();
  },

  // 加载作品列表 - 使用云函数
  loadWorkList: function() {
    if (this.data.loading) return;
    
    var that = this;
    this.setData({ loading: true });
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    console.log('🔄 开始加载作品列表...');
    
    // 调用云函数获取作品列表
    wx.cloud.callFunction({
      name: 'getJudgeWorks',
      data: {
        status: this.data.currentFilter === 'all' ? 'all' : 
                this.data.currentFilter === 'pending' ? 'pending' : 
                this.data.currentFilter === 'reviewed' ? 'reviewed' : 'all',
        page: 1,
        pageSize: 100
      },
      success: function(res) {
        wx.hideLoading();
        that.setData({ loading: false });
        console.log('📡 云函数响应:', res.result);
        
        if (res.result.success) {
          console.log('✅ 作品列表加载成功, 数据量:', res.result.data.length);
          that.processWorkList(res.result.data);
          // 更新统计信息
          that.setData({
            pendingCount: res.result.pendingCount || 0,
            totalCount: res.result.total || 0
          });
        } else {
          console.error('❌ 云函数返回错误:', res.result.message);
          that.showError('加载失败: ' + (res.result.message || '未知错误'));
          that.useMockDataAsFallback();
        }
      },
      fail: function(err) {
        wx.hideLoading();
        that.setData({ loading: false });
        console.error('💥 云函数调用失败:', err);
        that.showError('网络错误，请稍后重试');
        that.useMockDataAsFallback();
      }
    });
  },

  // 显示错误信息
  showError: function(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });
  },

  // 使用模拟数据作为降级方案
  useMockDataAsFallback: function() {
    console.log('🔄 使用模拟数据作为降级方案');
    var mockData = this.getMockWorkData();
    this.processWorkList(mockData);
    
    // 显示模拟数据提示
    wx.showToast({
      title: '使用演示数据',
      icon: 'none',
      duration: 2000
    });
  },

  // 处理作品列表数据 - 带防御性编程
  processWorkList: function(data) {
    if (!data || !Array.isArray(data)) {
      console.error('❌ 数据格式错误:', data);
      this.useMockDataAsFallback();
      return;
    }
    
    console.log('🔧 处理作品数据，原始数据量:', data.length);
    
    var pendingCount = 0;
    var workList = data;
    
      // 数据已经由云函数处理，直接使用
      try {
        // 安全地转换数据结构
        const processedList = data.map(item => {
          try {
            return {
              id: item.id || item._id || 'unknown',
              submissionId: item.id || item._id || 'unknown',
              title: item.title || '无标题作品',
              activityTitle: item.activityTitle || '未知活动',
              organizer: item.organizer || '未知组织',
              type: this.getWorkType(item),
              status: item.hasReviewed ? 'reviewed' : 'pending',
              createTime: this.formatTime(item.submittedAt),
              description: item.description || '无描述',
              score: item.averageScore || item.judgeScore?.score || 0,
              userName: item.studentName || '匿名用户',
              reviewed: item.hasReviewed || false,
              fileInfo: {
                fileID: item.fileID,
                fileName: item.fileName,
                fileType: item.fileType,
                fileSize: item.fileSize
              }
            };
          } catch (error) {
            console.error('处理单个作品数据出错:', error, item);
            return null;
          }
        }).filter(item => item !== null); // 过滤掉处理失败的数据

      console.log('✅ 数据处理完成，有效数据量:', processedList.length);
      
      this.setData({
        workList: processedList,
        totalCount: data.length,
        pendingCount: pendingCount
      });
      
    } catch (error) {
      console.error('❌ 处理作品列表时出错:', error);
      this.useMockDataAsFallback();
    }
  },

  // 获取作品类型 - 安全版本
  getWorkType: function(item) {
    try {
      // 根据文件类型判断
      if (item.fileInfo && item.fileInfo.fileName) {
        const fileName = item.fileInfo.fileName.toLowerCase();
        if (fileName.includes('.doc') || fileName.includes('.txt') || fileName.includes('.pdf')) {
          return '文档作品';
        } else if (fileName.includes('.jpg') || fileName.includes('.png') || fileName.includes('.gif')) {
          return '图片作品';
        } else if (fileName.includes('.mp4') || fileName.includes('.avi') || fileName.includes('.mov')) {
          return '视频作品';
        }
      }
      
      // 根据描述判断
      if (item.description) {
        const desc = item.description.toLowerCase();
        if (desc.includes('文章') || desc.includes('论文')) return '文章作品';
        if (desc.includes('绘画') || desc.includes('画作')) return '绘画作品';
        if (desc.includes('设计') || desc.includes('方案')) return '设计作品';
        if (desc.includes('摄影') || desc.includes('照片')) return '摄影作品';
      }
      
      return '创意作品';
    } catch (error) {
      return '未知类型';
    }
  },

  // 格式化时间 - 安全版本
  formatTime: function(timeString) {
    try {
      if (!timeString) return '未知时间';
      
      // 如果是日期字符串，直接返回日期部分
      if (typeof timeString === 'string' && timeString.includes('-')) {
        return timeString.split(' ')[0];
      }
      
      return '未知时间';
    } catch (error) {
      return '未知时间';
    }
  },

  // 获取模拟数据
  getMockWorkData: function() {
    return [
      {
        id: '1',
        title: '关于压力管理的思考',
        activity: {
          title: '心理健康创意作品征集',
          organizer: '心理健康教育中心'
        },
        userInfo: {
          userName: '张三'
        },
        type: '文章作品',
        status: '待审核',
        submitTime: '2024-01-15 10:30:00',
        description: '这篇作品深入探讨了大学生面临的压力问题，并提出了一系列实用的自我调节方法。',
        reviewed: false,
        fileInfo: {
          fileName: '压力管理文章.pdf',
          size: '2.3MB'
        }
      },
      {
        id: '2', 
        title: '心理健康主题绘画',
        activity: {
          title: '心理健康创意作品征集',
          organizer: '心理健康教育中心'
        },
        userInfo: {
          userName: '李四'
        },
        type: '绘画作品', 
        status: '待审核',
        submitTime: '2024-01-14 15:20:00',
        description: '通过绘画表达对心理健康的理解和感悟。',
        reviewed: false,
        fileInfo: {
          fileName: '心理健康绘画.jpg',
          size: '1.8MB'
        }
      }
    ];
  },

  // 切换筛选条件
  switchFilter: function(e) {
    var filter = e.currentTarget.dataset.filter;
    console.log('🔘 切换筛选条件:', filter);
    
    this.setData({
      currentFilter: filter
    });
    this.loadWorkList();
  },

  // 开始评审
  startReview: function(e) {
    var submissionId = e.currentTarget.dataset.id;
    console.log('🎯 开始评审作品:', submissionId);
    
    if (!submissionId) {
      wx.showToast({
        title: '作品ID无效',
        icon: 'none'
      });
      return;
    }
    
    // 跳转到评审页面
    wx.navigateTo({
      url: `/competition/pages/judge/scoring/scoring?workId=${submissionId}`
    });
  },

  // 查看作品详情
  viewWorkDetail: function(e) {
    console.log('👁️ 查看作品详情按钮被点击');
    console.log('📦 事件对象:', e);
    console.log('📦 当前数据集:', e.currentTarget.dataset);
    
    var workId = e.currentTarget.dataset.id;
    console.log('🆔 获取到的作品ID:', workId);
    
    // 如果从 dataset 获取不到，尝试从 item 中获取
    if (!workId || workId === 'unknown') {
      // 尝试从列表数据中查找
      const index = e.currentTarget.dataset.index;
      if (index !== undefined && this.data.workList[index]) {
        workId = this.data.workList[index].id || this.data.workList[index].submissionId;
        console.log('🔄 从列表数据中获取ID:', workId);
      }
    }
    
    if (!workId || workId === 'unknown') {
      console.error('❌ 作品ID无效:', workId);
      wx.showModal({
        title: '错误',
        content: '无法获取作品ID，请刷新页面重试',
        showCancel: false
      });
      return;
    }
    
    // 使用与 scoring 页面相同的路径格式
    const targetUrl = `/competition/pages/judge/workDetail/workDetail?workId=${workId}`;
    console.log('🚀 准备跳转到:', targetUrl);
    console.log('📋 作品ID:', workId);
    
    // 跳转到作品详情页面
    wx.navigateTo({
      url: targetUrl,
      success: function(res) {
        console.log('✅ 跳转成功:', res);
      },
      fail: function(err) {
        console.error('❌ 跳转失败:', err);
        console.error('❌ 错误详情:', JSON.stringify(err));
        
        wx.showModal({
          title: '跳转失败',
          content: `页面未找到，请尝试以下操作：\n\n1. 点击"编译"按钮重新编译小程序\n2. 检查页面是否已正确注册\n3. 如果问题仍然存在，请重启微信开发者工具\n\n错误：${err.errMsg || '未知错误'}`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });
  },

  // 下载作品文件
  downloadWorkFile: function(e) {
    var submissionId = e.currentTarget.dataset.id;
    var fileName = e.currentTarget.dataset.name;
    
    console.log('📥 下载作品文件:', fileName);
    
    wx.showLoading({
      title: '准备下载...',
    });
    
    // 模拟下载过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '下载功能准备中',
        icon: 'none'
      });
    }, 1000);
  },

  // 返回
  goBack: function() {
    wx.navigateBack();
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    console.log('🔄 下拉刷新');
    this.loadWorkList();
    wx.stopPullDownRefresh();
  }
});