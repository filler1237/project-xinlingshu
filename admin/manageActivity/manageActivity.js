// competition/pages/admin/manageActivity/manageActivity.js
Page({
  data: {
    // 活动列表
    activities: [],
    // 筛选后的活动列表
    filteredActivities: [],
    // 当前筛选状态
    currentFilter: 'all', // all, notStarted, running, ended
    // 加载状态
    loading: true,
    // 编辑弹窗
    showEditModal: false,
    editingActivity: {}
  },

  onLoad() {
    this.loadActivities();
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadActivities();
  },

  onPullDownRefresh() {
    this.loadActivities();
    wx.stopPullDownRefresh();
  },

  /**
   * 加载活动列表
   */
  loadActivities() {
    this.setData({ loading: true });
    
    // 调用云函数获取活动列表
    wx.cloud.callFunction({
      name: 'getActivities',
      data: {
        status: 'all', // 获取所有状态的活动
        page: 1,
        pageSize: 100
      },
      success: (res) => {
        console.log('获取活动列表成功:', res);
        if (res.result.success) {
          // 处理活动数据
          this.processActivities(res.result.data);
          this.setData({ loading: false });
        } else {
          console.error('获取活动列表失败:', res.result);
          wx.showToast({
            title: res.result.message || '获取活动列表失败',
            icon: 'none'
          });
          // 失败时使用模拟数据
          this.loadMockData();
        }
      },
      fail: (err) => {
        console.error('云函数调用失败:', err);
        wx.showToast({
          title: '网络错误，使用模拟数据',
          icon: 'none'
        });
        // 失败时使用模拟数据
        this.loadMockData();
      }
    });
  },

  /**
   * 加载模拟数据
   */
  loadMockData() {
    const mockActivities = [
      {
        id: '1',
        theme: '心理健康征文大赛',
        title: '心理健康征文大赛',
        description: '通过文字表达内心感受，分享心理健康故事',
        startTime: '2024-12-01',
        endTime: '2024-12-31',
        status: 'notStarted'
      },
      {
        id: '2',
        theme: '心理绘画创作展',
        title: '心理绘画创作展',
        description: '用画笔描绘心理世界，展现创意与情感',
        startTime: '2024-11-15',
        endTime: '2024-12-15',
        status: 'running'
      },
      {
        id: '3',
        theme: '心理短视频竞赛',
        title: '心理短视频竞赛',
        description: '通过短视频形式传播心理健康知识',
        startTime: '2024-10-01',
        endTime: '2024-10-31',
        status: 'ended'
      }
    ];

    setTimeout(() => {
      this.processActivities(mockActivities);
      this.setData({ loading: false });
    }, 500);
  },

  /**
   * 处理活动数据，完全使用云函数返回的状态
   * 确保与数据库完全同步，不做任何自动计算
   */
  processActivities(activities) {
    // 直接使用云函数返回的数据，不做任何状态计算
    // 确保页面显示与数据库完全一致
    const processed = activities.map(activity => {
      // 确保状态字段完整
      const statusType = activity.statusType || activity.status || 'notStarted';
      const statusText = activity.statusText || 
        (statusType === 'running' ? '进行中' : 
         statusType === 'ended' ? '已结束' : '未开始');
      
      return {
        ...activity,
        statusType: statusType,
        status: statusType, // 兼容字段
        statusText: statusText,
        manualStatus: activity.manualStatus !== undefined ? activity.manualStatus : false
      };
    });

    console.log('处理后的活动数据:', processed);
    console.log('活动数量:', processed.length);

    this.setData({ 
      activities: processed 
    }, () => {
      this.applyFilter();
    });
  },

  /**
   * 筛选状态改变
   */
  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter }, () => {
      this.applyFilter();
    });
  },

  /**
   * 应用筛选
   */
  applyFilter() {
    const { activities, currentFilter } = this.data;
    let filtered = [];

    if (currentFilter === 'all') {
      filtered = activities;
    } else {
      filtered = activities.filter(activity => activity.statusType === currentFilter);
    }

    this.setData({ filteredActivities: filtered });
  },

  /**
   * 编辑活动
   */
  onEditActivity(e) {
    const id = e.currentTarget.dataset.id;
    const activity = this.data.activities.find(a => a.id === id);
    
    if (!activity) {
      wx.showToast({
        title: '活动不存在',
        icon: 'none'
      });
      return;
    }

    // 检查是否可以编辑（只有未开始的活动可以编辑）
    if (activity.statusType !== 'notStarted') {
      wx.showToast({
        title: '只有未开始的活动可以编辑',
        icon: 'none'
      });
      return;
    }

    this.setData({
      showEditModal: true,
      editingActivity: {
        id: activity.id,
        theme: activity.theme || '',
        startTime: activity.startTime || '',
        endTime: activity.endTime || '',
        description: activity.description || ''
      }
    });
  },

  /**
   * 编辑字段变化
   */
  onEditFieldChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const editingActivity = { ...this.data.editingActivity };
    editingActivity[field] = value;
    this.setData({ editingActivity });
  },

  /**
   * 编辑时间变化
   */
  onEditTimeChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const editingActivity = { ...this.data.editingActivity };
    editingActivity[field] = value;
    this.setData({ editingActivity });
  },

  /**
   * 保存活动
   */
  onSaveActivity() {
    const { editingActivity } = this.data;

    // 验证必填字段
    if (!editingActivity.theme || !editingActivity.theme.trim()) {
      wx.showToast({
        title: '请输入活动主题',
        icon: 'none'
      });
      return;
    }

    if (!editingActivity.startTime || !editingActivity.endTime) {
      wx.showToast({
        title: '请选择活动时间',
        icon: 'none'
      });
      return;
    }

    if (new Date(editingActivity.startTime) >= new Date(editingActivity.endTime)) {
      wx.showToast({
        title: '结束时间必须晚于开始时间',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    // 调用云函数更新活动信息
    wx.cloud.callFunction({
      name: 'updateActivity',
      data: {
        activityId: editingActivity.id,
        theme: editingActivity.theme,
        startTime: editingActivity.startTime,
        endTime: editingActivity.endTime,
        description: editingActivity.description
      },
      success: (res) => {
        wx.hideLoading();
        if (res.result.success) {
          wx.showToast({ title: '保存成功', icon: 'success' });
          this.onCloseEditModal();
          // 重新加载活动列表
          this.loadActivities();
        } else {
          wx.showToast({ 
            title: res.result.message || '保存失败', 
            icon: 'none' 
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('保存失败:', err);
        wx.showToast({ 
          title: '网络错误，请稍后重试', 
          icon: 'none' 
        });
      }
    });
  },

  /**
   * 关闭编辑弹窗
   */
  onCloseEditModal() {
    this.setData({
      showEditModal: false,
      editingActivity: {}
    });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止点击弹窗内容时关闭弹窗
  },

  /**
   * 改变活动状态
   */
  onChangeStatus(e) {
    const id = e.currentTarget.dataset.id;
    const targetStatus = e.currentTarget.dataset.targetStatus;
    const activity = this.data.activities.find(a => a.id === id);

    if (!activity) {
      wx.showToast({
        title: '活动不存在',
        icon: 'none'
      });
      return;
    }

    const currentStatus = activity.statusType;
    const statusMap = {
      'notStarted': '未开始',
      'running': '进行中',
      'ended': '已结束'
    };

    const currentStatusText = statusMap[currentStatus] || '未知';
    const targetStatusText = statusMap[targetStatus] || '未知';

    // 确认提示
    let confirmText = '';
    if (targetStatus === 'running') {
      confirmText = `确定要将活动状态从"${currentStatusText}"改为"${targetStatusText}"吗？\n活动开始后，学生可以提交作品。`;
    } else if (targetStatus === 'ended') {
      confirmText = `确定要将活动状态从"${currentStatusText}"改为"${targetStatusText}"吗？\n活动结束后，学生将无法再提交作品。`;
    } else {
      confirmText = `确定要将活动状态从"${currentStatusText}"改为"${targetStatusText}"吗？`;
    }

    wx.showModal({
      title: '确认修改状态',
      content: confirmText,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.updateActivityStatus(id, targetStatus);
        }
      }
    });
  },

  /**
   * 更新活动状态
   */
  updateActivityStatus(id, newStatus) {
    wx.showLoading({ title: '更新状态中...' });

    // 调用云函数更新活动状态
    wx.cloud.callFunction({
      name: 'updateActivityStatus',
      data: {
        activityId: id,
        status: newStatus
      },
      success: (res) => {
        wx.hideLoading();
        if (res.result.success) {
          const statusMap = {
            'notStarted': '未开始',
            'running': '进行中',
            'ended': '已结束'
          };
          wx.showToast({ 
            title: `已设为${statusMap[newStatus] || '新状态'}`,
            icon: 'success'
          });
          // 重新加载活动列表
          this.loadActivities();
        } else {
          wx.showToast({ 
            title: res.result.message || '更新失败', 
            icon: 'none' 
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('更新状态失败:', err);
        wx.showToast({ 
          title: '网络错误，请稍后重试', 
          icon: 'none' 
        });
      }
    });
  },

  /**
   * 删除活动
   */
  onDeleteActivity(e) {
    const id = e.currentTarget.dataset.id;
    const activity = this.data.activities.find(a => a.id === id);

    if (!activity) {
      wx.showToast({
        title: '活动不存在',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除活动"${activity.theme || activity.title}"吗？此操作不可恢复。`,
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          this.deleteActivity(id);
        }
      }
    });
  },

  /**
   * 执行删除
   */
  deleteActivity(id) {
    wx.showLoading({ title: '删除中...' });

    // 调用云函数删除活动
    wx.cloud.callFunction({
      name: 'deleteActivity',
      data: {
        activityId: id
      },
      success: (res) => {
        wx.hideLoading();
        if (res.result.success) {
          wx.showToast({ title: '删除成功', icon: 'success' });
          // 重新加载活动列表
          this.loadActivities();
        } else {
          wx.showToast({ 
            title: res.result.message || '删除失败', 
            icon: 'none' 
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('删除失败:', err);
        wx.showToast({ 
          title: '网络错误，请稍后重试', 
          icon: 'none' 
        });
      }
    });
  }
});
