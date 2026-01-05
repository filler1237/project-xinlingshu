// pages/admin/judgeManagement/judgeManagement.js
Page({
  data: {
    stats: {
      totalTeachers: 0,
      availableJudges: 0,
      appointedJudges: 0,
      chiefJudges: 0
    },
    teachers: [],
    filteredTeachers: [],
    appointedJudges: [],
    searchKeyword: '',
    selectedActivityIndex: 0,
    currentFilter: 'all',
    activityOptions: [],
    selectedActivity: null,
    showAppointModal: false,
    showProfileModal: false,
    selectedTeacher: null,
    appointRole: 'judge'
  },

  // 返回 ，放js文件
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },
  
  onLoad(options) {
    console.log('评委管理页面加载');
    this.loadActivityOptions();
    this.loadTeachersData();
  },

  onShow() {
    console.log('评委管理页面显示');
  },

  onPullDownRefresh() {
    this.loadTeachersData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载活动选项
  loadActivityOptions() {
    // 模拟活动数据
    const activities = [
      { id: 'A001', name: '心理健康征文大赛' },
      { id: 'A002', name: '心理绘画创作展' },
      { id: 'A003', name: '心理短视频竞赛' }
    ];
    
    this.setData({ 
      activityOptions: activities,
      selectedActivity: activities[0],
      selectedActivityIndex: 0
    });
  },

  // 加载老师数据
  loadTeachersData() {
    console.log('开始加载老师数据');
    
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
        console.error('加载老师数据错误:', error);
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
        teacherId: 'T001',
        name: '张教授',
        department: '心理学系',
        email: 'zhang@university.edu',
        phone: '13800138001',
        isOnline: true,
        expertise: ['心理健康', '情绪管理', '心理咨询'],
        currentAppointment: {
          activityId: 'A001',
          activityName: '心理健康征文大赛',
          role: 'chief',
          appointTime: '2024-01-15'
        },
        appointmentHistory: [
          {
            activityId: 'A001',
            activityName: '心理健康征文大赛',
            role: 'chief',
            appointTime: '2024-01-15'
          },
          {
            activityId: 'A003',
            activityName: '心理短视频竞赛',
            role: 'judge',
            appointTime: '2023-12-10'
          }
        ]
      },
      {
        teacherId: 'T002',
        name: '李老师',
        department: '艺术学院',
        email: 'li@university.edu',
        phone: '13800138002',
        isOnline: false,
        expertise: ['艺术创作', '审美教育'],
        currentAppointment: {
          activityId: 'A002',
          activityName: '心理绘画创作展',
          role: 'judge',
          appointTime: '2024-01-20'
        },
        appointmentHistory: [
          {
            activityId: 'A002',
            activityName: '心理绘画创作展',
            role: 'judge',
            appointTime: '2024-01-20'
          }
        ]
      },
      {
        teacherId: 'T003',
        name: '王博士',
        department: '传媒学院',
        email: 'wang@university.edu',
        phone: '13800138003',
        isOnline: true,
        expertise: ['视频制作', '媒体传播'],
        currentAppointment: null,
        appointmentHistory: []
      },
      {
        teacherId: 'T004',
        name: '赵教授',
        department: '文学系',
        email: 'zhao@university.edu',
        phone: '13800138004',
        isOnline: true,
        expertise: ['文学创作', '写作指导'],
        currentAppointment: {
          activityId: 'A001',
          activityName: '心理健康征文大赛',
          role: 'judge',
          appointTime: '2024-01-18'
        },
        appointmentHistory: [
          {
            activityId: 'A001',
            activityName: '心理健康征文大赛',
            role: 'judge',
            appointTime: '2024-01-18'
          }
        ]
      },
      {
        teacherId: 'T005',
        name: '刘老师',
        department: '教育学院',
        email: 'liu@university.edu',
        phone: '13800138005',
        isOnline: false,
        expertise: ['教育评估', '学习心理'],
        currentAppointment: null,
        appointmentHistory: []
      }
    ];

    console.log('设置老师数据:', mockData);
    
    this.setData({
      teachers: mockData,
      filteredTeachers: mockData
    }, () => {
      this.updateAppointedJudges();
      this.updateStats();
      console.log('老师数据设置完成');
    });
  },

  // 更新已任命评委列表
  updateAppointedJudges() {
    const { teachers, selectedActivity } = this.data;
    if (!selectedActivity) return;
    
    const appointed = teachers.filter(teacher => 
      teacher.currentAppointment && 
      teacher.currentAppointment.activityId === selectedActivity.id
    ).map(teacher => ({
      teacherId: teacher.teacherId,
      name: teacher.name,
      role: teacher.currentAppointment.role
    }));
    
    this.setData({ appointedJudges: appointed });
  },

  // 更新统计数据
  updateStats() {
    const { teachers, selectedActivity } = this.data;
    const stats = {
      totalTeachers: teachers.length,
      availableJudges: teachers.filter(teacher => !teacher.currentAppointment).length,
      appointedJudges: teachers.filter(teacher => 
        teacher.currentAppointment && 
        (!selectedActivity || teacher.currentAppointment.activityId === selectedActivity.id)
      ).length,
      chiefJudges: teachers.filter(teacher => 
        teacher.currentAppointment && 
        teacher.currentAppointment.role === 'chief' &&
        (!selectedActivity || teacher.currentAppointment.activityId === selectedActivity.id)
      ).length
    };
    
    this.setData({ stats });
    console.log('统计数据更新:', stats);
  },

  // 活动选择
  onActivityChange(e) {
    const index = parseInt(e.detail.value);
    const selectedActivity = this.data.activityOptions[index];
    
    this.setData({
      selectedActivityIndex: index,
      selectedActivity: selectedActivity
    }, () => {
      this.updateAppointedJudges();
      this.updateStats();
      this.filterTeachers();
    });
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    this.filterTeachers();
  },

  // 筛选切换
  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
    this.filterTeachers();
  },

  // 筛选老师
  filterTeachers() {
    const { teachers, searchKeyword, currentFilter, selectedActivity } = this.data;
    
    let filtered = teachers;
    
    // 关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(teacher => 
        teacher.name.includes(searchKeyword) || 
        teacher.teacherId.includes(searchKeyword)
      );
    }
    
    // 状态筛选
    if (currentFilter === 'available') {
      filtered = filtered.filter(teacher => !teacher.currentAppointment);
    } else if (currentFilter === 'appointed') {
      filtered = filtered.filter(teacher => 
        teacher.currentAppointment && 
        (!selectedActivity || teacher.currentAppointment.activityId === selectedActivity.id)
      );
    }

    this.setData({ filteredTeachers: filtered });
  },

  // 获取任命状态
  getAppointmentStatus(teacher) {
    if (!teacher.currentAppointment) return 'available';
    
    const { selectedActivity } = this.data;
    if (selectedActivity && teacher.currentAppointment.activityId === selectedActivity.id) {
      return 'appointed';
    }
    
    return 'busy';
  },

  // 获取任命状态文本
  getAppointmentStatusText(teacher) {
    const status = this.getAppointmentStatus(teacher);
    const statusMap = {
      'available': '可任命',
      'appointed': '已任命',
      'busy': '其他活动中'
    };
    return statusMap[status];
  },

  // 任命评委
  onAppointJudge(e) {
    const teacher = e.currentTarget.dataset.teacher;
    const { selectedActivity } = this.data;
    
    if (!selectedActivity) {
      wx.showToast({
        title: '请先选择活动',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      selectedTeacher: teacher,
      appointRole: 'judge',
      showAppointModal: true
    });
  },

  // 选择角色
  onSelectRole(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({ appointRole: role });
  },

  // 确认任命
  onConfirmAppointment() {
    const { selectedTeacher, selectedActivity, appointRole } = this.data;
    
    wx.showLoading({ title: '任命中...' });
    
    // 模拟任命过程
    setTimeout(() => {
      const { teachers } = this.data;
      
      // 更新老师数据
      const updatedTeachers = teachers.map(teacher => {
        if (teacher.teacherId === selectedTeacher.teacherId) {
          const newAppointment = {
            activityId: selectedActivity.id,
            activityName: selectedActivity.name,
            role: appointRole,
            appointTime: this.formatDate(new Date())
          };
          
          const appointmentHistory = [
            newAppointment,
            ...(teacher.appointmentHistory || [])
          ].slice(0, 5); // 保留最近5条记录
          
          return {
            ...teacher,
            currentAppointment: newAppointment,
            appointmentHistory: appointmentHistory
          };
        }
        return teacher;
      });
      
      this.setData({
        teachers: updatedTeachers,
        filteredTeachers: updatedTeachers,
        showAppointModal: false
      }, () => {
        wx.hideLoading();
        wx.showToast({
          title: '任命成功',
          icon: 'success'
        });
        
        this.updateAppointedJudges();
        this.updateStats();
        this.filterTeachers();
      });
    }, 1000);
  },

  // 更改角色
  onChangeRole(e) {
    const teacher = e.currentTarget.dataset.teacher;
    
    this.setData({
      selectedTeacher: teacher,
      appointRole: teacher.currentAppointment.role,
      showAppointModal: true
    });
  },

  // 取消任命
  onRemoveAppointment(e) {
    const teacher = e.currentTarget.dataset.teacher;
    
    wx.showModal({
      title: '取消任命',
      content: `确定要取消 ${teacher.name} 的评委任命吗？`,
      success: (res) => {
        if (res.confirm) {
          this.removeAppointment(teacher.teacherId);
        }
      }
    });
  },

  // 从已任命面板移除
  onRemoveJudge(e) {
    const judge = e.currentTarget.dataset.judge;
    
    wx.showModal({
      title: '移除评委',
      content: `确定要移除评委 ${judge.name} 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.removeAppointment(judge.teacherId);
        }
      }
    });
  },

  // 移除任命
  removeAppointment(teacherId) {
    wx.showLoading({ title: '移除中...' });
    
    // 模拟移除过程
    setTimeout(() => {
      const { teachers } = this.data;
      
      const updatedTeachers = teachers.map(teacher => {
        if (teacher.teacherId === teacherId) {
          return {
            ...teacher,
            currentAppointment: null
          };
        }
        return teacher;
      });
      
      this.setData({
        teachers: updatedTeachers,
        filteredTeachers: updatedTeachers
      }, () => {
        wx.hideLoading();
        wx.showToast({
          title: '移除成功',
          icon: 'success'
        });
        
        this.updateAppointedJudges();
        this.updateStats();
        this.filterTeachers();
      });
    }, 800);
  },

  // 查看老师详情
  onViewProfile(e) {
    const teacher = e.currentTarget.dataset.teacher;
    
    this.setData({
      selectedTeacher: teacher,
      showProfileModal: true
    });
  },

  // 关闭模态框
  onCloseModal() {
    this.setData({ 
      showAppointModal: false,
      showProfileModal: false,
      selectedTeacher: null
    });
  },

  // 重置筛选条件
  onResetFilters() {
    this.setData({
      searchKeyword: '',
      currentFilter: 'all'
    });
    this.filterTeachers();
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});