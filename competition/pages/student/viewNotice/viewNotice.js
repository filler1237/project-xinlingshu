// competition/pages/student/viewNotice/viewNotice.js
Page({
  data: {
    // 通知列表
    notices: [],
    // 活动筛选选项
    activityOptions: [
      { id: 'all', name: '全部活动' }
    ],
    selectedActivityIndex: 0,
    selectedActivityId: 'all',
    // 发布对象筛选
    targetTypeFilter: 'all', // all, participants
    // 分页
    page: 1,
    pageSize: 20,
    hasMore: true,
    // 状态
    loading: true,
    refreshing: false,
    // 详情弹窗
    showDetailModal: false,
    selectedNotice: {}
  },

  onLoad() {
    this.loadActivities();
    this.loadNotices();
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadNotices(true);
  },

  onPullDownRefresh() {
    this.onRefresh();
  },

  /**
   * 加载活动列表（用于筛选）
   */
  loadActivities() {
    wx.cloud.callFunction({
      name: 'getActivities',
      data: {
        status: 'all',
        page: 1,
        pageSize: 100
      },
      success: (res) => {
        if (res.result.success && res.result.data) {
          const activities = [
            { id: 'all', name: '全部活动' },
            ...res.result.data.map(activity => ({
              id: activity.id || activity._id,
              name: activity.theme || activity.title || '未命名活动'
            }))
          ];
          
          this.setData({ activityOptions: activities });
        }
      },
      fail: (err) => {
        console.error('加载活动列表失败:', err);
      }
    });
  },

  /**
   * 加载通知列表
   */
  loadNotices(reset = false) {
    if (reset) {
      this.setData({
        page: 1,
        notices: [],
        hasMore: true
      });
    }

    if (this.data.loading && !reset) {
      return; // 防止重复加载
    }

    this.setData({ loading: true });

    const { selectedActivityId, targetTypeFilter, page, pageSize } = this.data;

    wx.cloud.callFunction({
      name: 'getNotices',
      data: {
        activityId: selectedActivityId === 'all' ? null : selectedActivityId,
        targetType: targetTypeFilter === 'all' ? null : targetTypeFilter,
        page: page,
        pageSize: pageSize
      },
      success: (res) => {
        this.setData({ loading: false, refreshing: false });
        
        if (res.result.success) {
          const newNotices = res.result.data || [];
          const notices = reset ? newNotices : [...this.data.notices, ...newNotices];
          
          this.setData({
            notices: notices,
            hasMore: notices.length < res.result.total,
            page: reset ? 2 : this.data.page + 1
          });
        } else {
          wx.showToast({
            title: res.result.message || '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        this.setData({ loading: false, refreshing: false });
        console.error('获取通知列表失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 活动筛选改变
   */
  onActivityFilterChange(e) {
    const index = e.detail.value;
    const activity = this.data.activityOptions[index];
    
    this.setData({
      selectedActivityIndex: index,
      selectedActivityId: activity.id
    }, () => {
      // 重新加载通知列表
      this.loadNotices(true);
    });
  },

  /**
   * 发布对象筛选改变
   */
  onTargetTypeFilter(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      targetTypeFilter: type
    }, () => {
      // 重新加载通知列表
      this.loadNotices(true);
    });
  },

  /**
   * 下拉刷新
   */
  onRefresh() {
    this.setData({ refreshing: true });
    this.loadNotices(true);
  },

  /**
   * 加载更多
   */
  onLoadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadNotices();
    }
  },

  /**
   * 点击通知查看详情
   */
  onNoticeTap(e) {
    const id = e.currentTarget.dataset.id;
    const notice = this.data.notices.find(n => n.id === id);
    
    if (notice) {
      this.setData({
        showDetailModal: true,
        selectedNotice: notice
      });
      
      // 标记为已读（可选，可以调用云函数更新已读状态）
      this.markAsRead(id);
    }
  },

  /**
   * 标记通知为已读
   */
  markAsRead(noticeId) {
    // 可以调用云函数更新已读状态
    // 这里暂时不实现，如果需要可以创建 updateNoticeRead 云函数
  },

  /**
   * 关闭详情弹窗
   */
  onCloseDetailModal() {
    this.setData({
      showDetailModal: false,
      selectedNotice: {}
    });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止点击弹窗内容时关闭弹窗
  }
});

