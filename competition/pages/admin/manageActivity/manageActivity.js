// pages/admin/manageActivity/manageActivity.js
Page({
  data: {
    stats: {
      total: 0,
      pending_review: 0,
      pending: 0,
      running: 0,
      ended: 0
    },
    activityList: [],
    filteredList: [],
    searchKeyword: '',
    currentFilter: 'all',
    
    // 模态框状态
    showStatusModal: false,
    showReviewModal: false,
    showDeleteModal: false,
    
    // 选中数据
    selectedActivity: null,
    selectedStatus: '',
    reviewResult: '',
    reviewComment: ''
  },

  // 返回 ，放js文件
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },
  
  onLoad() {
    console.log('页面加载');
    this.loadActivityData();
  },

  onShow() {
    console.log('页面显示');
  },

  // 加载活动数据
  loadActivityData() {
    console.log('开始加载数据');
    
    // 显示加载状态
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // 延迟加载模拟数据
    setTimeout(() => {
      try {
        this.loadMockData();
        wx.hideLoading();
      } catch (error) {
        console.error('加载数据错误:', error);
        wx.hideLoading();
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    }, 500);
  },

  // 模拟数据加载
  loadMockData() {
    const mockData = [
      {
        activityId: 'A001',
        title: '心理健康征文大赛',
        theme: '情绪管理',
        formType: '征文比赛',
        startTime: '2024-01-15',
        endTime: '2024-02-15',
        status: 'pending_review',
        reviewStatus: 'pending',
        participantCount: 0,
        progress: 30,
        description: '面向全校学生的心理健康主题征文活动',
        reviewComment: ''
      },
      {
        activityId: 'A002',
        title: '心理绘画创作展',
        theme: '自我认知',
        formType: '绘画创作',
        startTime: '2024-02-01',
        endTime: '2024-03-01',
        status: 'pending',
        reviewStatus: 'approved',
        participantCount: 0,
        progress: 30,
        description: '通过绘画表达内心世界的创作活动',
        reviewComment: '活动主题明确，形式新颖，审核通过'
      },
      {
        activityId: 'A003',
        title: '心理短视频竞赛',
        theme: '人际关系',
        formType: '视频制作',
        startTime: '2024-01-10',
        endTime: '2024-02-10',
        status: 'running',
        reviewStatus: 'approved',
        participantCount: 156,
        progress: 65,
        description: '制作心理健康主题短视频的竞赛活动',
        reviewComment: ''
      }
    ];

    console.log('设置模拟数据:', mockData);
    
    this.setData({
      activityList: mockData,
      filteredList: mockData
    }, () => {
      console.log('数据设置完成');
      this.updateStats();
    });
  },

  // 更新统计数据
  updateStats() {
    const { activityList } = this.data;
    const stats = {
      total: activityList.length,
      pending_review: activityList.filter(item => item.status === 'pending_review').length,
      pending: activityList.filter(item => item.status === 'pending').length,
      running: activityList.filter(item => item.status === 'running').length,
      ended: activityList.filter(item => item.status === 'ended').length
    };
    
    this.setData({ stats });
    console.log('统计数据更新:', stats);
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    this.filterActivities();
  },

  // 筛选切换
  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
    this.filterActivities();
  },

  // 筛选活动
  filterActivities() {
    const { activityList, searchKeyword, currentFilter } = this.data;
    
    let filtered = activityList;
    
    // 关键词筛选
    if (searchKeyword) {
      filtered = filtered.filter(activity => 
        activity.title.includes(searchKeyword) || 
        activity.theme.includes(searchKeyword)
      );
    }
    
    // 状态筛选
    if (currentFilter !== 'all') {
      filtered = filtered.filter(activity => activity.status === currentFilter);
    }

    this.setData({ filteredList: filtered });
  },

  // 查看活动详情
  onActivityDetail(e) {
    const activity = e.currentTarget.dataset.activity;
    console.log('查看活动详情:', activity);
    wx.showToast({
      title: '查看详情功能开发中',
      icon: 'none'
    });
  },

  // 审核活动
  onReviewActivity(e) {
    const activity = e.currentTarget.dataset.activity;
    console.log('审核活动:', activity);
    
    this.setData({
      selectedActivity: activity,
      reviewResult: '',
      reviewComment: '',
      showReviewModal: true
    });
  },

  // 选择审核结果
  onSelectReviewResult(e) {
    const result = e.currentTarget.dataset.result;
    this.setData({ reviewResult: result });
  },

  // 审核意见输入
  onReviewCommentInput(e) {
    this.setData({ reviewComment: e.detail.value });
  },

  // 确认审核
  onConfirmReview() {
    const { selectedActivity, reviewResult, reviewComment } = this.data;
    
    if (!reviewResult) {
      wx.showToast({
        title: '请选择审核结果',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '提交中...' });
    
    // 模拟审核提交
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '审核提交成功',
        icon: 'success'
      });
      
      this.setData({ showReviewModal: false });
      
      // 更新活动状态
      this.updateActivityStatus(selectedActivity.activityId, {
        reviewStatus: reviewResult,
        reviewComment: reviewComment,
        status: reviewResult === 'approved' ? 'pending' : 'pending_review'
      });
    }, 1500);
  },

  // 发布活动
  onPublishActivity(e) {
    const activity = e.currentTarget.dataset.activity;
    
    wx.showModal({
      title: '发布活动',
      content: `确定要发布"${activity.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '发布中...' });
          
          // 模拟发布
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '活动发布成功',
              icon: 'success'
            });
            
            this.updateActivityStatus(activity.activityId, { status: 'running' });
          }, 1000);
        }
      }
    });
  },

  // 编辑活动
  onEditActivity(e) {
    const activity = e.currentTarget.dataset.activity;
    console.log('编辑活动:', activity);
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
  },

  // 删除活动
  onDeleteActivity(e) {
    const activity = e.currentTarget.dataset.activity;
    
    // 检查是否允许删除
    if (activity.status === 'running' || activity.status === 'ended') {
      wx.showToast({
        title: '进行中或已结束的活动不能删除',
        icon: 'none'
      });
      return;
    }

    this.setData({
      selectedActivity: activity,
      showDeleteModal: true
    });
  },

  // 确认删除
  onConfirmDelete() {
    const { selectedActivity } = this.data;
    
    wx.showLoading({ title: '删除中...' });
    
    // 模拟删除
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      this.setData({ showDeleteModal: false });
      
      // 从列表中移除
      const newList = this.data.activityList.filter(
        item => item.activityId !== selectedActivity.activityId
      );
      
      this.setData({
        activityList: newList,
        filteredList: newList
      });
      
      this.updateStats();
    }, 1000);
  },

  // 修改状态
  onChangeStatus(e) {
    const activity = e.currentTarget.dataset.activity;
    this.setData({
      selectedActivity: activity,
      selectedStatus: activity.status,
      showStatusModal: true
    });
  },

  // 选择状态
  onSelectStatus(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ selectedStatus: status });
  },

  // 确认状态修改
  onConfirmStatusChange() {
    const { selectedActivity, selectedStatus } = this.data;
    
    if (selectedActivity.status === selectedStatus) {
      wx.showToast({
        title: '状态未改变',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '更新中...' });
    
    // 模拟状态更新
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '状态更新成功',
        icon: 'success'
      });
      
      this.setData({ showStatusModal: false });
      this.updateActivityStatus(selectedActivity.activityId, { status: selectedStatus });
    }, 1000);
  },

  // 更新活动状态
  updateActivityStatus(activityId, updates) {
    const { activityList } = this.data;
    const updatedList = activityList.map(item => {
      if (item.activityId === activityId) {
        return { ...item, ...updates };
      }
      return item;
    });
    
    this.setData({
      activityList: updatedList,
      filteredList: updatedList
    });
    
    this.updateStats();
  },

  // 查看作品
  onViewWorks(e) {
    const activity = e.currentTarget.dataset.activity;
    console.log('查看作品:', activity);
    wx.showToast({
      title: '查看作品功能开发中',
      icon: 'none'
    });
  },

  // 评委管理
  onManageJudges(e) {
    const activity = e.currentTarget.dataset.activity;
    console.log('评委管理:', activity);
    wx.showToast({
      title: '评委管理功能开发中',
      icon: 'none'
    });
  },

  // 创建新活动
  onCreateActivity() {
    wx.navigateTo({
      url: '/pages/admin/applyActivity/applyActivity'
    });
  },

  // 关闭模态框
  onCloseModal() {
    this.setData({ 
      showStatusModal: false,
      showReviewModal: false,
      showDeleteModal: false,
      selectedActivity: null,
      selectedStatus: '',
      reviewResult: '',
      reviewComment: ''
    });
  }
});