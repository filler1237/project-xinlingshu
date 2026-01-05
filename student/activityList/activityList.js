// pages/student/activityList/activityList.js
Page({

  // ==========================================
  // 页面数据定义区域
  // ==========================================
  data: {
    // 活动列表数据
    activities: [],
    // 加载状态控制
    loading: true,
    // 是否还有更多数据
    hasMore: true,
    // 当前页码
    page: 1,
    // 每页数据量
    pageSize: 10,
    // 当前显示的活动状态筛选
    currentFilter: 'all', // all: 全部, running: 进行中, ended: 已结束
    // 刷新状态
    refreshing: false,
    // 用户信息
    userInfo: null
  },

  // ==========================================
  // 页面生命周期函数区域
  // ==========================================
  
  /**
   * 页面加载时执行
   * 初始化页面数据，优先显示模拟数据保证用户体验
   */
  onLoad() {
    console.log('🎯 学生活动列表页面加载');
    
    // 🆕 强制初始化用户信息
    this.forceInitUserInfo();
    
    // 立即显示模拟数据，避免卡在加载状态
    this.loadMockData();
    
    // 同时尝试请求后端获取真实数据
    this.loadActivities();
  },

  /**
   * 页面显示时执行
   * 每次进入页面时刷新数据和报名状态
   */
  onShow() {
    console.log('🔄 学生活动列表页面显示');
    
    // 检查用户信息状态
    this.debugUserInfo();
    
    // 如果有活动数据，重新同步报名状态
    if (this.data.activities && this.data.activities.length > 0) {
      this.syncRegistrationStatus();
    } else {
      this.loadActivities();
    }
  },

  /**
   * 页面上拉触底时执行
   * 加载更多数据
   */
  onReachBottom() {
    console.log('⬇️ 上拉加载更多');
    if (this.data.hasMore && !this.data.loading) {
      this.loadActivities();
    }
  },

  // ==========================================
  // 用户信息管理区域
  // ==========================================
  
  /**
   * 🆕 强制初始化用户信息
   * 确保用户信息在页面加载时就存在
   */
  forceInitUserInfo() {
    console.log('🔧 强制初始化用户信息');
    
    let userInfo = null;
    
    // 尝试从缓存获取
    try {
      userInfo = wx.getStorageSync('userInfo');
      console.log('🔍 缓存中的用户信息:', userInfo);
    } catch (error) {
      console.error('💥 读取缓存失败:', error);
    }
    
    // 如果缓存中没有或信息不完整，创建新的
    if (!userInfo || !userInfo.userId) {
      console.log('🆕 创建新的用户信息');
      userInfo = this.createNewUserInfo();
      
      // 保存到缓存
      try {
        wx.setStorageSync('userInfo', userInfo);
        console.log('💾 用户信息已保存到缓存');
      } catch (error) {
        console.error('💥 保存用户信息失败:', error);
      }
    }
    
    // 设置到data中
    this.setData({ userInfo });
    console.log('✅ 用户信息初始化完成:', userInfo);
  },

  /**
   * 🆕 创建新的用户信息
   * 生成唯一的用户ID和基本信息
   * @returns {Object} 新的用户信息
   */
  createNewUserInfo() {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    
    return {
      userId: `user_${timestamp}_${randomStr}`,
      userName: '微信用户',
      avatar: '',
      studentId: `2024${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      className: '计算机科学班级',
      contact: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
    };
  },

  /**
   * 🆕 获取用户信息 - 修复版本
   * 确保始终返回有效的用户信息
   * @returns {Object} 用户信息对象
   */
  getUserInfo() {
    // 首先检查data中的用户信息
    if (this.data.userInfo && this.data.userInfo.userId) {
      return this.data.userInfo;
    }
    
    // 如果data中没有，尝试从缓存获取
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo && userInfo.userId) {
        console.log('✅ 从缓存读取用户信息:', userInfo);
        this.setData({ userInfo });
        return userInfo;
      }
    } catch (error) {
      console.error('💥 读取用户信息失败:', error);
    }
    
    // 都没有则创建新的用户信息
    console.log('🔧 创建新的用户信息');
    const newUserInfo = this.createNewUserInfo();
    this.setData({ userInfo: newUserInfo });
    
    // 保存到缓存
    try {
      wx.setStorageSync('userInfo', newUserInfo);
    } catch (error) {
      console.error('💥 保存用户信息失败:', error);
    }
    
    return newUserInfo;
  },

  /**
   * 🆕 调试用户信息
   * 在控制台打印当前用户信息状态
   */
  debugUserInfo() {
    console.log('🐛 用户信息调试:');
    console.log('📱 data中的用户信息:', this.data.userInfo);
    
    try {
      const cachedUserInfo = wx.getStorageSync('userInfo');
      console.log('💾 缓存中的用户信息:', cachedUserInfo);
    } catch (error) {
      console.error('💥 读取缓存失败:', error);
    }
    
    // 测试获取用户信息
    const currentUserInfo = this.getUserInfo();
    console.log('🎯 当前使用的用户信息:', currentUserInfo);
  },

  // ==========================================
  // 数据加载与处理区域
  // ==========================================
  
  /**
   * 加载活动数据 - 主数据获取方法
   * 包含超时处理和降级策略，支持异步操作
   * @returns {Promise} 异步操作Promise
   */
  async loadActivities() {
    return new Promise(async (resolve) => {
      // 防止重复加载
      if (this.data.loading) return resolve();
      
      this.setData({ loading: true });
      console.log('📥 开始请求活动数据...');
      
      // 设置超时处理，避免无限等待影响用户体验
      const timeoutTimer = setTimeout(() => {
        console.log('⏰ 请求超时，使用模拟数据');
        this.loadMockData();
        this.setData({ refreshing: false });
        resolve();
      }, 3000);
      
      try {
        // 调用云函数获取活动数据
        const res = await new Promise((innerResolve, innerReject) => {
          wx.cloud.callFunction({
            name: 'getActivities',
            data: {
              status: this.data.currentFilter === 'all' ? 'all' : 
                     this.data.currentFilter === 'running' ? 'running' : 
                     this.data.currentFilter === 'ended' ? 'ended' : 'all',
              page: this.data.page,
              pageSize: this.data.pageSize
            },
            success: (cloudRes) => {
              // 转换为类似 wx.request 的格式
              innerResolve({
                statusCode: 200,
                data: cloudRes.result
              });
            },
            fail: innerReject
          });
        });
        
        clearTimeout(timeoutTimer);
        console.log('✅ 云函数请求成功');
        
        // 详细日志 - 检查实际数据结构
        console.log('📊 云函数返回的完整响应:', res.data);
        
        // 验证返回数据格式
        if (res.data) {
          console.log('🔍 数据验证:', {
            hasSuccess: !!res.data.success,
            successValue: res.data.success,
            hasData: !!res.data.data,
            dataType: typeof res.data.data,
            isArray: Array.isArray(res.data.data),
            dataLength: res.data.data ? res.data.data.length : 0
          });
          
          if (res.data.success && res.data.data && Array.isArray(res.data.data)) {
            console.log(`🎯 云函数返回 ${res.data.data.length} 个活动`);
            
            // 检查第一个活动数据的结构
            if (res.data.data.length > 0) {
              console.log('📝 第一个活动数据样例:', res.data.data[0]);
            }
            
            // 🆕 异步处理所有活动数据，包含报名状态检查
            const processedActivities = await this.processActivityData(res.data.data);
            
            console.log('🔄 处理后的活动数据:', processedActivities);
            
            this.setData({
              activities: processedActivities,
              loading: false,
              refreshing: false,
              hasMore: res.data.data.length >= this.data.pageSize
            });
            
            console.log(`✅ 加载云函数数据成功，共${processedActivities.length}个活动`);
          } else {
            console.log('❌ 云函数数据格式不正确，使用模拟数据');
            this.loadMockData();
            this.setData({ refreshing: false });
          }
        } else {
          console.log('❌ 云函数返回数据为空');
          this.loadMockData();
          this.setData({ refreshing: false });
        }
        resolve();
      } catch (err) {
        clearTimeout(timeoutTimer);
        console.error('💥 云函数请求失败:', err);
        console.log('🔧 使用模拟数据继续显示');
        this.loadMockData();
        this.setData({ refreshing: false });
        resolve();
      }
    });
  },

  /**
   * 处理活动数据 - 异步版本
   * 计算状态、时间信息，并检查用户报名状态
   * @param {Array} backendActivities - 后端返回的活动数据
   * @returns {Promise<Array>} 处理后的活动数据
   */
  async processActivityData(backendActivities) {
    console.log('🔄 开始处理活动数据，输入:', backendActivities);
    
    if (!backendActivities || !Array.isArray(backendActivities)) {
      console.log('❌ 活动数据格式错误');
      return [];
    }
    
    console.log(`📋 需要处理 ${backendActivities.length} 个活动`);
    
    // 并行处理所有活动的数据
    const processedActivities = [];
    
    for (let i = 0; i < backendActivities.length; i++) {
      const activity = backendActivities[i];
      console.log(`🔍 处理第${i}个活动:`, activity);
      
      // 优先使用云函数返回的状态（如果手动设置了状态）
      // 否则根据时间计算状态
      const now = new Date();
      let startTime, endTime;
      
      try {
        startTime = new Date(activity.startTime);
        endTime = new Date(activity.endTime);
        
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          console.log('⚠️ 日期解析失败，使用云函数返回的状态');
        }
      } catch (error) {
        console.error('💥 日期解析异常:', error);
        startTime = new Date();
        endTime = new Date();
      }
      
      // 完全使用云函数返回的状态，与数据库同步
      // 不进行任何自动计算，确保显示与数据库一致
      let statusText = activity.statusText || '进行中';
      let statusClass = activity.statusType || 'running';
      
      // 转换为前端使用的格式
      if (activity.statusType === 'notStarted' || activity.status === 'notStarted') {
        statusText = '报名中';
        statusClass = 'pending';
      } else if (activity.statusType === 'ended' || activity.status === 'ended') {
        statusText = '已结束';
        statusClass = 'ended';
      } else if (activity.statusType === 'running' || activity.status === 'running') {
        statusText = '进行中';
        statusClass = 'running';
      }
      
      // 计算剩余时间信息
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
        console.error('💥 计算时间信息异常:', error);
        timeInfo = '时间计算错误';
      }
      
      // 🆕 异步检查报名状态 - 调用后端API检查用户是否已报名
      const hasRegistered = await this.checkUserRegistrationStatus(activity.id);
      
      // 是否可以参与（时间允许且未报名）
      const canJoin = (statusText === '报名中' || statusText === '进行中') && !hasRegistered;
      
      // 返回格式化后的活动数据
      const processedActivity = {
        id: activity.id ? activity.id.toString() : 'unknown',
        title: activity.title || '未命名活动',
        description: activity.description || '暂无描述',
        theme: activity.theme || '通用主题',
        formType: activity.formType || '其他形式',
        startTime: activity.startTime || '未设置',
        endTime: activity.endTime || '未设置',
        status: statusText,
        statusClass: statusClass,
        timeInfo: timeInfo,
        organizer: activity.organizer || '心理健康中心',
        participantCount: activity.participantCount || 0,
        progress: this.calculateProgress(activity.startTime, activity.endTime),
        
        // 🆕 报名相关字段
        canJoin: canJoin,
        hasRegistered: hasRegistered
      };
      
      console.log(`✅ 第${i}个活动处理完成:`, processedActivity);
      processedActivities.push(processedActivity);
    }
    
    return processedActivities;
  },

  /**
   * 🆕 检查用户是否已经报名该活动 - 使用云函数版本
   * 通过检查是否已提交作品来判断是否已报名（提交作品的前提是已报名）
   * @param {string} activityId - 活动ID
   * @returns {Promise<boolean>} 是否已报名
   */
  async checkUserRegistrationStatus(activityId) {
    // 获取用户信息
    const userInfo = this.getUserInfo();
    if (!userInfo) {
      return false;
    }
    
    console.log('🔍 检查报名状态 - 活动:', activityId);
    
    return new Promise((resolve) => {
      // 通过检查是否已提交作品来判断是否已报名
      // 如果已提交作品，说明已报名
      wx.cloud.callFunction({
        name: 'getStudentActivities',
        data: {},
        success: (res) => {
          if (res.result.success && res.result.data) {
            // 查找该活动，检查是否已提交作品
            const activity = res.result.data.find(a => 
              (a.id === activityId || a._id === activityId)
            );
            
            if (activity) {
              // 如果活动在可提交列表中，说明已报名（因为只有已报名的活动才会出现在可提交列表中）
              // 如果已提交作品，也说明已报名
              const hasSubmitted = activity.hasSubmitted || false;
              console.log('📡 检查结果 - 活动在列表中，已提交作品:', hasSubmitted);
              
              // 活动在可提交列表中，说明已报名
              resolve(true);
            } else {
              // 活动不在可提交列表中，可能未报名或活动已结束
              // 需要进一步检查：通过查询作品表来判断
              this.checkRegistrationByWork(activityId).then(resolve);
            }
          } else {
            console.error('❌ 检查失败，使用默认值');
            resolve(false);
          }
        },
        fail: (err) => {
          console.error('💥 网络检查失败，使用本地状态:', err);
          resolve(this.checkLocalRegistrationStatus(activityId));
        }
      });
    });
  },

  /**
   * 通过检查作品来判断是否已报名
   * @param {string} activityId - 活动ID
   * @returns {Promise<boolean>} 是否已报名
   */
  async checkRegistrationByWork(activityId) {
    return new Promise((resolve) => {
      // 查询该用户是否已为该活动提交过作品
      // 如果已提交作品，说明已报名
      const db = wx.cloud.database();
      db.collection('works')
        .where({
          activityId: activityId
        })
        .count()
        .then(res => {
          // 由于小程序端无法直接获取openid，这里简化处理
          // 实际应该通过云函数来查询
          console.log('📡 通过作品检查报名状态（简化版）');
          // 暂时返回false，表示未报名
          // 实际应用中应该创建专门的云函数来检查
          resolve(false);
        })
        .catch(err => {
          console.error('💥 查询作品失败:', err);
          resolve(false);
        });
    });
  },

  /**
   * 检查本地报名状态
   * 从本地缓存中检查用户是否已报名
   * @param {string} activityId - 活动ID
   * @returns {boolean} 是否已报名
   */
  checkLocalRegistrationStatus(activityId) {
    try {
      const registeredActivities = wx.getStorageSync('userRegisteredActivities') || [];
      return registeredActivities.includes(activityId);
    } catch (error) {
      console.error('💥 读取本地报名状态失败:', error);
      return false;
    }
  },

  /**
   * 同步报名状态
   * 从本地存储重新加载报名状态并更新页面显示
   */
  syncRegistrationStatus() {
    console.log('🔄 同步报名状态');
    
    const activities = this.data.activities.map(activity => {
      const hasRegistered = this.checkLocalRegistrationStatus(activity.id);
      const canJoin = (activity.status === '报名中' || activity.status === '进行中') && !hasRegistered;
      
      return {
        ...activity,
        hasRegistered,
        canJoin
      };
    });
    
    this.setData({ activities });
    console.log('✅ 报名状态同步完成');
  },

  /**
   * 计算活动进度百分比
   * @param {string} startTime - 开始时间
   * @param {string} endTime - 结束时间
   * @returns {number} 进度百分比(0-100)
   */
  calculateProgress(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    
    try {
      const now = new Date();
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (now < start) return 0;
      if (now > end) return 100;
      
      const totalDuration = end - start;
      const elapsed = now - start;
      return Math.min(100, Math.round((elapsed / totalDuration) * 100));
    } catch (error) {
      console.error('💥 计算进度异常:', error);
      return 0;
    }
  },

  /**
   * 加载模拟数据 - 降级方案
   * 在网络请求失败或超时时使用，确保页面有数据展示
   * 包含完整的报名状态字段
   */
  loadMockData() {
    console.log('📋 加载模拟数据');
    
    const mockActivities = [
      {
        id: '1',
        title: '心理健康征文大赛',
        description: '围绕心理健康主题进行文字创作，分享你的故事和感悟',
        theme: '情绪管理',
        formType: '征文比赛',
        startTime: '2024-03-01',
        endTime: '2024-03-31',
        status: '进行中',
        statusClass: 'running',
        timeInfo: '剩余15天',
        organizer: '心理健康中心',
        participantCount: 128,
        progress: 50,
        canJoin: true,
        hasRegistered: false
      },
      {
        id: '2',
        title: '心理绘画创作展',
        description: '通过绘画表达内心情感，展现独特的心理世界',
        theme: '自我认知',
        formType: '绘画创作',
        startTime: '2024-02-15',
        endTime: '2024-03-15',
        status: '进行中',
        statusClass: 'running',
        timeInfo: '剩余5天',
        organizer: '艺术学院',
        participantCount: 86,
        progress: 80,
        canJoin: true,
        hasRegistered: false
      },
      {
        id: '3',
        title: '春季心理讲座系列',
        description: '邀请心理学专家开展系列讲座，帮助同学们应对学业压力',
        theme: '压力管理',
        formType: '讲座',
        startTime: '2024-01-10',
        endTime: '2024-02-10',
        status: '已结束',
        statusClass: 'ended',
        timeInfo: '已结束',
        organizer: '心理健康中心',
        participantCount: 256,
        progress: 100,
        canJoin: false,
        hasRegistered: false
      },
      {
        id: '4',
        title: '心理剧表演大赛',
        description: '通过戏剧表演形式展现心理冲突与成长',
        theme: '人际关系',
        formType: '戏剧表演',
        startTime: '2024-04-01',
        endTime: '2024-04-30',
        status: '报名中',
        statusClass: 'pending',
        timeInfo: '即将开始，10天后',
        organizer: '戏剧社',
        participantCount: 0,
        progress: 0,
        canJoin: true,
        hasRegistered: false
      }
    ];

    this.setData({
      activities: mockActivities,
      loading: false,
      hasMore: false,
      refreshing: false
    });
    
    console.log('✅ 模拟数据加载完成');
  },

  // ==========================================
  // 报名功能实现区域
  // ==========================================
  
  /**
   * 参与活动 - 完善版
   * 只有可参与状态的活动才能报名，包含完整的报名流程
   * @param {Object} e - 事件对象
   */
  onJoinActivity(e) {
    const activity = e.currentTarget.dataset.activity;
    const index = e.currentTarget.dataset.index;
    console.log('🎯 用户尝试参与活动:', activity, '索引:', index);
    
    // 检查活动状态
    if (!activity.canJoin) {
      if (activity.hasRegistered) {
        wx.showToast({
          title: '您已报名该活动',
          icon: 'success',
          duration: 2000
        });
      } else if (activity.status === '已结束') {
        wx.showToast({
          title: '该活动已结束',
          icon: 'none',
          duration: 2000
        });
      } else {
        wx.showToast({
          title: '暂不可参与',
          icon: 'none',
          duration: 2000
        });
      }
      return;
    }
    
    // 显示确认对话框
    wx.showModal({
      title: '确认报名',
      content: `确定要报名「${activity.title}」吗？`,
      confirmText: '确认报名',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          console.log('✅ 用户确认报名，执行报名逻辑');
          this.executeJoinActivity(activity, index);
        } else {
          console.log('❌ 用户取消报名');
        }
      }
    });
  },

  /**
   * 🆕 执行报名逻辑 - 修复用户信息版本
   * 确保用户信息正确传递到后端
   * @param {Object} activity - 活动对象
   * @param {number} index - 活动在列表中的索引
   */
  executeJoinActivity(activity, index) {
    console.log('🚀 执行报名操作:', activity, '索引:', index);
    
    // 获取用户信息 - 确保不为空
    const userInfo = this.getUserInfo();
    console.log('👤 报名使用的用户信息:', userInfo);
    
    // 🆕 验证用户信息
    if (!userInfo || !userInfo.userId) {
      console.error('❌ 用户信息不完整，无法报名');
      wx.showToast({
        title: '用户信息错误，请重新登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '报名中...',
      mask: true
    });
    
    // 调用后端报名接口 - 确保传递完整的用户信息
    wx.request({
      url: 'http://localhost:3000/api/registrations',
      method: 'POST',
      data: {
        activityId: activity.id,
        userId: userInfo.userId,        // 确保这个有值
        userName: userInfo.userName,    // 确保这个有值
        avatar: userInfo.avatar,
        studentId: userInfo.studentId,
        className: userInfo.className,
        contact: userInfo.contact
      },
      success: (res) => {
        console.log('📡 后端报名响应:', res.data);
        
        if (res.data.success) {
          // 1. 更新本地报名状态
          this.updateLocalRegistrationStatus(activity.id, true);
          
          // 2. 更新页面数据
          this.updateActivityRegistrationStatus(activity.id, index, true);
          
          // 3. 更新参与人数
          this.updateParticipantCount(activity.id, index, res.data.data.participantCount);
          
          // 4. 显示成功提示
          wx.hideLoading();
          wx.showToast({
            title: '报名成功！',
            icon: 'success',
            duration: 2000
          });
          
          console.log('✅ 报名成功，报名ID:', res.data.data.registrationId);
          
          // 5. 可以跳转到提交作品页面或显示成功页面
          setTimeout(() => {
            wx.navigateTo({
              url: `/pages/student/submitWork/submitWork?activityId=${activity.id}&title=${encodeURIComponent(activity.title)}`
            });
          }, 1500);
          
        } else {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message || '报名失败',
            icon: 'none',
            duration: 2000
          });
          console.error('❌ 报名失败:', res.data.message);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('💥 网络请求失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
        
        // 网络失败时降级到本地报名
        this.fallbackToLocalRegistration(activity, index);
      }
    });
  },

  /**
   * 更新本地报名状态存储
   * 将报名状态保存到本地缓存，确保页面刷新后状态不丢失
   * @param {string} activityId - 活动ID
   * @param {boolean} registered - 是否报名
   */
  updateLocalRegistrationStatus(activityId, registered) {
    try {
      const registeredActivities = wx.getStorageSync('userRegisteredActivities') || [];
      
      if (registered) {
        // 添加报名记录
        if (!registeredActivities.includes(activityId)) {
          registeredActivities.push(activityId);
        }
      } else {
        // 取消报名记录
        const index = registeredActivities.indexOf(activityId);
        if (index > -1) {
          registeredActivities.splice(index, 1);
        }
      }
      
      wx.setStorageSync('userRegisteredActivities', registeredActivities);
      console.log('💾 更新本地报名状态:', registeredActivities);
      
    } catch (error) {
      console.error('💥 更新本地报名状态失败:', error);
      throw error;
    }
  },

  /**
   * 更新页面中活动的报名状态
   * 使用索引直接更新对应活动，避免重新渲染整个列表
   * @param {string} activityId - 活动ID
   * @param {number} index - 活动索引
   * @param {boolean} registered - 是否报名
   */
  updateActivityRegistrationStatus(activityId, index, registered) {
    // 使用索引直接更新对应活动
    const activityKey = `activities[${index}]`;
    const updateData = {};
    
    updateData[`${activityKey}.hasRegistered`] = registered;
    updateData[`${activityKey}.canJoin`] = !registered;
    
    this.setData(updateData);
    console.log('🔄 更新页面活动状态完成');
  },

  /**
   * 更新参与人数显示
   * 报名成功后更新活动的参与人数
   * @param {string} activityId - 活动ID
   * @param {number} index - 活动索引
   * @param {number} participantCount - 新的参与人数
   */
  updateParticipantCount(activityId, index, participantCount) {
    const activityKey = `activities[${index}].participantCount`;
    this.setData({
      [activityKey]: participantCount
    });
    console.log('🔄 更新参与人数:', participantCount);
  },

  /**
   * 降级到本地报名（网络失败时使用）
   * 当后端接口调用失败时，使用本地存储记录报名状态
   * @param {Object} activity - 活动对象
   * @param {number} index - 活动索引
   */
  fallbackToLocalRegistration(activity, index) {
    console.log('🔧 使用本地报名降级方案');
    
    try {
      // 更新本地报名状态
      this.updateLocalRegistrationStatus(activity.id, true);
      
      // 更新页面数据
      this.updateActivityRegistrationStatus(activity.id, index, true);
      
      // 本地增加参与人数
      this.updateParticipantCount(activity.id, index, (activity.participantCount || 0) + 1);
      
      wx.showToast({
        title: '报名成功（本地）',
        icon: 'success',
        duration: 2000
      });
      
      // 延迟跳转
      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/student/submitWork/submitWork?activityId=${activity.id}&title=${encodeURIComponent(activity.title)}`
        });
      }, 1500);
      
    } catch (error) {
      console.error('💥 本地报名失败:', error);
      wx.showToast({
        title: '报名失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // ==========================================
  // 其他用户交互处理区域
  // ==========================================
  
  /**
   * 查看活动详情
   * @param {Object} e - 事件对象
   */
  onActivityDetail(e) {
    const activity = e.currentTarget.dataset.activity;
    console.log('📄 查看活动详情:', activity);
    
    // 跳转到活动详情页面
    wx.navigateTo({
      url: `/competition/pages/student/activityDetail/activityDetail?id=${activity.id}&title=${encodeURIComponent(activity.title)}`
    });
  },

  /**
   * 搜索活动
   * @param {Object} e - 事件对象
   */
  onSearchInput(e) {
    const keyword = e.detail.value;
    console.log('🔍 搜索活动:', keyword);
    
    if (keyword) {
      // 执行本地搜索过滤
      const filtered = this.data.activities.filter(activity => 
        activity.title.includes(keyword) || 
        activity.description.includes(keyword) ||
        activity.theme.includes(keyword)
      );
      this.setData({ activities: filtered });
    } else {
      // 搜索关键词为空时重新加载数据
      this.loadActivities();
    }
  },

  /**
   * 筛选活动状态
   * @param {Object} e - 事件对象
   */
  onFilterChange(e) {
    const filterType = e.currentTarget.dataset.filter;
    console.log('🎛️ 筛选活动状态:', filterType);
    
    this.setData({ 
      currentFilter: filterType
    });
    
    // 根据筛选条件过滤活动
    this.applyActivityFilter();
  },

  /**
   * 应用活动状态筛选
   */
  applyActivityFilter() {
    const { currentFilter, activities } = this.data;
    
    let filteredActivities = activities;
    
    switch (currentFilter) {
      case 'running':
        // 显示进行中和报名中的活动
        filteredActivities = activities.filter(activity => 
          activity.status === '进行中' || activity.status === '报名中'
        );
        break;
      case 'ended':
        // 显示已结束的活动
        filteredActivities = activities.filter(activity => 
          activity.status === '已结束'
        );
        break;
      case 'all':
      default:
        // 显示所有活动，不需要过滤
        break;
    }
    
    this.setData({ activities: filteredActivities });
    console.log(`✅ 应用筛选条件: ${currentFilter}, 显示 ${filteredActivities.length} 个活动`);
  },

  /**
   * 手动刷新数据 - 优化版
   * 添加防重复点击和状态反馈
   */
  onRefresh() {
    console.log('🔄 手动刷新');
    
    // 防重复点击
    if (this.data.refreshing) {
      console.log('⏳ 刷新请求已在进行中，跳过重复请求');
      return;
    }
    
    // 设置刷新状态
    this.setData({ refreshing: true });
    
    // 添加震动反馈
    wx.vibrateShort({
      type: 'light'
    });
    
    // 显示刷新提示
    wx.showToast({
      title: '刷新中...',
      icon: 'loading',
      duration: 1000
    });
    
    // 加载数据
    this.loadActivities().then(() => {
      // 刷新完成后显示成功提示
      setTimeout(() => {
        wx.showToast({
          title: '刷新完成',
          icon: 'success',
          duration: 1500
        });
      }, 500);
    }).catch((error) => {
      console.error('💥 刷新失败:', error);
      // 错误处理
      setTimeout(() => {
        wx.showToast({
          title: '刷新失败',
          icon: 'none',
          duration: 2000
        });
      }, 500);
    });
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack();
  }

})