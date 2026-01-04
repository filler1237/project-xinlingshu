// competition/pages/student/activityDetail/activityDetail.js
Page({
  data: {
    activityId: '',
    activity: {},
    loading: true
  },

  onLoad(options) {
    const { id, title } = options;
    console.log('📄 活动详情页面加载，ID:', id, '标题:', title);
    
    if (id) {
      this.setData({ activityId: id });
      this.loadActivityDetail(id);
    } else {
      wx.showToast({
        title: '活动ID缺失',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 加载活动详情
   */
  loadActivityDetail(activityId) {
    this.setData({ loading: true });

    wx.cloud.callFunction({
      name: 'getActivities',
      data: {
        status: 'all',
        page: 1,
        pageSize: 100
      },
      success: (res) => {
        this.setData({ loading: false });
        
        if (res.result.success && res.result.data) {
          // 查找指定的活动
          const activity = res.result.data.find(a => 
            (a.id === activityId || a._id === activityId)
          );
          
          if (activity) {
            // 处理活动数据
            const processedActivity = this.processActivityData(activity);
            this.setData({ activity: processedActivity });
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
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        this.setData({ loading: false });
        console.error('加载活动详情失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 处理活动数据
   */
  processActivityData(activity) {
    const now = new Date();
    let startTime, endTime;
    
    try {
      startTime = new Date(activity.startTime);
      endTime = new Date(activity.endTime);
    } catch (error) {
      startTime = new Date();
      endTime = new Date();
    }
    
    // 计算状态
    let statusText = '进行中';
    let statusClass = 'running';
    
    if (now < startTime) {
      statusText = '报名中';
      statusClass = 'pending';
    } else if (now > endTime) {
      statusText = '已结束';
      statusClass = 'ended';
    }
    
    // 计算进度
    const progress = this.calculateProgress(activity.startTime, activity.endTime);
    
    // 计算时间信息
    let timeInfo = '';
    try {
      if (now < startTime) {
        const timeDiff = startTime - now;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        if (days > 0) {
          timeInfo = `即将开始，${days}天后`;
        } else {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          timeInfo = `即将开始，${hours}小时后`;
        }
      } else if (now < endTime) {
        const timeDiff = endTime - now;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        if (days > 0) {
          timeInfo = `剩余${days}天`;
        } else {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          timeInfo = `剩余${hours}小时`;
        }
      } else {
        timeInfo = '已结束';
      }
    } catch (error) {
      timeInfo = '时间计算错误';
    }
    
    // 检查报名状态
    this.checkRegistrationStatus(activity.id || activity._id).then(hasRegistered => {
      const canJoin = (statusText === '报名中' || statusText === '进行中') && !hasRegistered;
      this.setData({
        'activity.hasRegistered': hasRegistered,
        'activity.canJoin': canJoin
      });
    });
    
    return {
      id: activity.id || activity._id,
      _id: activity._id || activity.id,
      title: activity.title || activity.theme || '未命名活动',
      theme: activity.theme || activity.title || '未命名活动',
      description: activity.description || '',
      startTime: activity.startTime || '未设置',
      endTime: activity.endTime || '未设置',
      organizer: activity.organizer || '心理健康中心',
      formType: activity.formType || '其他形式',
      participantCount: activity.participantCount || 0,
      workCount: activity.workCount || 0,
      status: statusText,
      statusText: statusText,
      statusClass: statusClass,
      progress: progress,
      timeInfo: timeInfo,
      scoreRules: activity.scoreRules || [],
      awardRules: activity.awardRules || [],
      totalScore: activity.totalScore || 0,
      allowedUploadTypes: activity.allowedUploadTypes || ['document', 'image']
    };
  },

  /**
   * 计算活动进度
   */
  calculateProgress(startTime, endTime) {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const now = new Date();
      
      if (now < start) return 0;
      if (now > end) return 100;
      
      const total = end - start;
      const passed = now - start;
      return Math.round((passed / total) * 100);
    } catch (error) {
      return 0;
    }
  },

  /**
   * 检查报名状态
   */
  async checkRegistrationStatus(activityId) {
    return new Promise((resolve) => {
      wx.cloud.callFunction({
        name: 'getStudentActivities',
        data: {},
        success: (res) => {
          if (res.result.success && res.result.data) {
            const activity = res.result.data.find(a => 
              (a.id === activityId || a._id === activityId)
            );
            resolve(activity ? true : false);
          } else {
            resolve(false);
          }
        },
        fail: () => {
          resolve(false);
        }
      });
    });
  },

  /**
   * 参与活动
   */
  onJoinActivity() {
    const activity = this.data.activity;
    wx.navigateTo({
      url: `/competition/pages/student/submitWork/submitWork?activityId=${activity.id}&title=${encodeURIComponent(activity.title)}`
    });
  },

  /**
   * 提交作品
   */
  onSubmitWork() {
    const activity = this.data.activity;
    wx.navigateTo({
      url: `/competition/pages/student/submitWork/submitWork?activityId=${activity.id}&title=${encodeURIComponent(activity.title)}`
    });
  }
});

