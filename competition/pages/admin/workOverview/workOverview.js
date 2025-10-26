// pages/admin/workOverview/workOverview.js
Page({
  data: {
    stats: {
      total: 0,
      pendingReview: 0,
      reviewed: 0,
      awarded: 0
    },
    works: [],
    filteredWorks: [],
    selectedWorks: [],
    searchKeyword: '',
    activityIndex: 0,
    statusIndex: 0,
    activityOptions: [
      { id: '', name: '全部活动' }
    ],
    statusOptions: ['全部状态', '待评审', '已评审', '已获奖'],
    showDetailModal: false,
    selectedWork: null
  },

  // 返回 ，放js文件
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },
  
  onLoad(options) {
    console.log('作品总览页面加载');
    this.loadActivityOptions();
    this.loadWorksData();
  },

  onShow() {
    console.log('作品总览页面显示');
  },

  onPullDownRefresh() {
    this.loadWorksData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载活动选项
  loadActivityOptions() {
    // 模拟活动数据 - 实际应该调用接口
    const activities = [
      { id: '', name: '全部活动' },
      { id: 'A001', name: '心理健康征文大赛' },
      { id: 'A002', name: '心理绘画创作展' },
      { id: 'A003', name: '心理短视频竞赛' }
    ];
    
    this.setData({ activityOptions: activities });
  },

  // 加载作品数据
  loadWorksData() {
    console.log('开始加载作品数据');
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // 模拟数据加载
    setTimeout(() => {
      try {
        this.loadMockData();
        wx.hideLoading();
      } catch (error) {
        console.error('加载作品数据错误:', error);
        wx.hideLoading();
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    }, 800);
  },

  // 加载模拟数据
  loadMockData() {
    const mockData = [
      {
        workId: 'W001',
        title: '情绪管理的艺术',
        authorName: '张三',
        studentId: 'S2024001',
        activityId: 'A001',
        activityName: '心理健康征文大赛',
        workType: 'document',
        contentType: 'text',
        content: '情绪管理是每个人都需要掌握的重要技能...',
        submitTime: '2024-01-20 14:30',
        reviewStatus: 'reviewed',
        totalScore: 85,
        dimensionScores: [
          { name: '创意', score: 30 },
          { name: '内容', score: 40 },
          { name: '表达', score: 15 }
        ],
        comment: '文章结构清晰，观点新颖，表达流畅，是一篇优秀的作品。',
        fileName: '情绪管理的艺术.docx',
        fileUrl: 'https://example.com/files/emotion-management.docx'
      },
      {
        workId: 'W002',
        title: '内心的色彩',
        authorName: '李四',
        studentId: 'S2024002',
        activityId: 'A002',
        activityName: '心理绘画创作展',
        workType: 'image',
        contentType: 'image',
        content: '',
        submitTime: '2024-01-22 10:15',
        reviewStatus: 'pending',
        totalScore: 0,
        dimensionScores: [],
        comment: '',
        fileName: '内心的色彩.jpg',
        fileUrl: 'https://example.com/images/inner-colors.jpg'
      },
      {
        workId: 'W003',
        title: '人际关系的力量',
        authorName: '王五',
        studentId: 'S2024003',
        activityId: 'A003',
        activityName: '心理短视频竞赛',
        workType: 'video',
        contentType: 'video',
        content: '',
        submitTime: '2024-01-25 16:45',
        reviewStatus: 'awarded',
        totalScore: 92,
        dimensionScores: [
          { name: '创意', score: 35 },
          { name: '内容', score: 38 },
          { name: '表达', score: 19 }
        ],
        comment: '视频制作精良，主题深刻，具有很强的感染力。',
        fileName: '人际关系的力量.mp4',
        fileUrl: 'https://example.com/videos/relationship-power.mp4',
        comments: [
          { judgeName: '张老师', content: '作品创意十足，表达清晰' },
          { judgeName: '李教授', content: '技术处理很专业，情感表达到位' }
        ]
      },
      {
        workId: 'W004',
        title: '压力应对策略',
        authorName: '赵六',
        studentId: 'S2024004',
        activityId: 'A001',
        activityName: '心理健康征文大赛',
        workType: 'document',
        contentType: 'text',
        content: '在现代社会中，压力无处不在...',
        submitTime: '2024-01-18 09:20',
        reviewStatus: 'reviewed',
        totalScore: 78,
        dimensionScores: [
          { name: '创意', score: 25 },
          { name: '内容', score: 35 },
          { name: '表达', score: 18 }
        ],
        comment: '内容实用性强，但创新性有待提高。',
        fileName: '压力应对策略.pdf',
        fileUrl: 'https://example.com/files/stress-management.pdf'
      }
    ];

    console.log('设置作品数据:', mockData);
    
    this.setData({
      works: mockData,
      filteredWorks: mockData
    }, () => {
      this.updateStats();
      console.log('作品数据设置完成');
    });
  },

  // 更新统计数据
  updateStats() {
    const { works } = this.data;
    const stats = {
      total: works.length,
      pendingReview: works.filter(item => item.reviewStatus === 'pending').length,
      reviewed: works.filter(item => item.reviewStatus === 'reviewed').length,
      awarded: works.filter(item => item.reviewStatus === 'awarded').length
    };
    
    this.setData({ stats });
    console.log('作品统计更新:', stats);
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    this.filterWorks();
  },

  // 活动筛选
  onActivityChange(e) {
    const index = e.detail.value;
    this.setData({ activityIndex: index });
    this.filterWorks();
  },

  // 状态筛选
  onStatusChange(e) {
    const index = e.detail.value;
    this.setData({ statusIndex: index });
    this.filterWorks();
  },

  // 筛选作品
  filterWorks() {
    const { works, searchKeyword, activityIndex, statusIndex, activityOptions, statusOptions } = this.data;
    
    let filtered = works;
    
    // 关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(item => 
        item.title.includes(searchKeyword) || 
        item.authorName.includes(searchKeyword) ||
        item.studentId.includes(searchKeyword)
      );
    }
    
    // 活动筛选
    if (activityIndex > 0) {
      const selectedActivity = activityOptions[activityIndex];
      filtered = filtered.filter(item => item.activityId === selectedActivity.id);
    }
    
    // 状态筛选
    if (statusIndex > 0) {
      const selectedStatus = statusOptions[statusIndex];
      const statusMap = {
        '待评审': 'pending',
        '已评审': 'reviewed',
        '已获奖': 'awarded'
      };
      filtered = filtered.filter(item => item.reviewStatus === statusMap[selectedStatus]);
    }

    this.setData({ filteredWorks: filtered });
  },

  // 选择作品
  onWorkSelect(e) {
    const work = e.currentTarget.dataset.work;
    console.log('选择作品:', work);
    // 可以在这里实现查看详情或其他操作
  },

  // 切换选择状态
  onToggleSelect(e) {
    const work = e.currentTarget.dataset.work;
    const { selectedWorks } = this.data;
    const workId = work.workId;
    
    let newSelectedWorks;
    if (selectedWorks.indexOf(workId) !== -1) {
      newSelectedWorks = selectedWorks.filter(id => id !== workId);
    } else {
      newSelectedWorks = [...selectedWorks, workId];
    }
    
    this.setData({ selectedWorks: newSelectedWorks });
    e.stopPropagation(); // 阻止事件冒泡
  },

  // 清空选择
  onClearSelection() {
    this.setData({ selectedWorks: [] });
  },

  // 查看作品详情
  onViewWork(e) {
    const work = e.currentTarget.dataset.work;
    console.log('查看作品详情:', work);
    
    this.setData({
      selectedWork: work,
      showDetailModal: true
    });
  },

  // 下载作品
  onDownloadWork(e) {
    const work = e.currentTarget.dataset.work;
    console.log('下载作品:', work);
    
    wx.showLoading({ title: '准备下载...' });
    
    // 模拟下载过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '开始下载',
        icon: 'success'
      });
      
      // 实际应该调用下载接口
      wx.downloadFile({
        url: work.fileUrl,
        success: (res) => {
          console.log('下载成功:', res);
        },
        fail: (err) => {
          console.error('下载失败:', err);
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      });
    }, 1000);
  },

  // 删除作品
  onDeleteWork(e) {
    const work = e.currentTarget.dataset.work;
    
    wx.showModal({
      title: '删除确认',
      content: `确定要删除作品"${work.title}"吗？此操作不可恢复。`,
      success: (res) => {
        if (res.confirm) {
          this.deleteSingleWork(work.workId);
        }
      }
    });
    
    e.stopPropagation();
  },

  // 删除单个作品
  deleteSingleWork(workId) {
    wx.showLoading({ title: '删除中...' });
    
    // 模拟删除过程
    setTimeout(() => {
      const { works, filteredWorks, selectedWorks } = this.data;
      
      const newWorks = works.filter(item => item.workId !== workId);
      const newFilteredWorks = filteredWorks.filter(item => item.workId !== workId);
      const newSelectedWorks = selectedWorks.filter(id => id !== workId);
      
      this.setData({
        works: newWorks,
        filteredWorks: newFilteredWorks,
        selectedWorks: newSelectedWorks
      }, () => {
        wx.hideLoading();
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        this.updateStats();
      });
    }, 800);
  },

  // 批量导出
  onBatchExport() {
    const { selectedWorks } = this.data;
    
    if (selectedWorks.length === 0) {
      wx.showToast({
        title: '请先选择作品',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '准备导出...' });
    
    // 模拟导出过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: `导出 ${selectedWorks.length} 个作品`,
        icon: 'success'
      });
    }, 1500);
  },

  // 批量删除
  onBatchDelete() {
    const { selectedWorks } = this.data;
    
    if (selectedWorks.length === 0) {
      wx.showToast({
        title: '请先选择作品',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedWorks.length} 个作品吗？此操作不可恢复。`,
      success: (res) => {
        if (res.confirm) {
          this.deleteMultipleWorks(selectedWorks);
        }
      }
    });
  },

  // 删除多个作品
  deleteMultipleWorks(workIds) {
    wx.showLoading({ title: '批量删除中...' });
    
    // 模拟批量删除过程
    setTimeout(() => {
      const { works, filteredWorks } = this.data;
      
      const newWorks = works.filter(item => workIds.indexOf(item.workId) === -1);
      const newFilteredWorks = filteredWorks.filter(item => workIds.indexOf(item.workId) === -1);
      
      this.setData({
        works: newWorks,
        filteredWorks: newFilteredWorks,
        selectedWorks: []
      }, () => {
        wx.hideLoading();
        wx.showToast({
          title: '批量删除成功',
          icon: 'success'
        });
        this.updateStats();
      });
    }, 1000);
  },

  // 导出全部
  onExportAll() {
    const { filteredWorks } = this.data;
    
    wx.showLoading({ title: '准备导出全部...' });
    
    // 模拟导出过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: `导出 ${filteredWorks.length} 个作品`,
        icon: 'success'
      });
    }, 1500);
  },

  // 刷新数据
  onRefresh() {
    this.loadWorksData();
    wx.showToast({
      title: '刷新成功',
      icon: 'success'
    });
  },

  // 重置筛选条件
  onResetFilters() {
    this.setData({
      searchKeyword: '',
      activityIndex: 0,
      statusIndex: 0
    });
    this.filterWorks();
  },

  // 关闭模态框
  onCloseModal() {
    this.setData({ 
      showDetailModal: false,
      selectedWork: null
    });
  },

  // 下载当前作品
  onDownloadCurrent() {
    const { selectedWork } = this.data;
    if (selectedWork) {
      this.onDownloadWork({ currentTarget: { dataset: { work: selectedWork } } });
    }
    this.onCloseModal();
  },

  // 预览图片
  onPreviewImage() {
    const { selectedWork } = this.data;
    if (selectedWork && selectedWork.contentType === 'image') {
      wx.previewImage({
        urls: [selectedWork.fileUrl],
        current: selectedWork.fileUrl
      });
    }
  },

  // 预览文件
  onPreviewFile() {
    const { selectedWork } = this.data;
    if (selectedWork) {
      wx.showToast({
        title: '文件预览功能开发中',
        icon: 'none'
      });
    }
  },

  // 获取分数等级
  getScoreLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'average';
    return 'poor';
  }
});