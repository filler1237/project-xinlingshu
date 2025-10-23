// pages/admin/creditConfig/creditConfig.js
Page({
  data: {
    activityOptions: [],
    selectedActivityIndex: 0,
    selectedActivity: null,
    
    // 学分配置
    participationCredit: 0.5,
    awardCredits: [
      { level: '一等奖', credit: 2.0 },
      { level: '二等奖', credit: 1.5 },
      { level: '三等奖', credit: 1.0 }
    ],
    newAwardLevel: '',
    
    // 发放规则
    autoParticipationCredit: true,
    autoAwardCredit: true,
    allowDuplicateCredit: false,
    
    // 模态框
    showPreviewModal: false
  },

  onLoad(options) {
    console.log('学分配置页面加载');
    this.loadActivityOptions();
  },

  onShow() {
    console.log('学分配置页面显示');
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

  // 活动选择
  onActivityChange(e) {
    const index = parseInt(e.detail.value);
    const selectedActivity = this.data.activityOptions[index];
    
    this.setData({
      selectedActivityIndex: index,
      selectedActivity: selectedActivity
    });
    
    // 加载该活动的学分配置
    this.loadActivityCreditConfig(selectedActivity.id);
  },

  // 加载活动学分配置
  loadActivityCreditConfig(activityId) {
    // 模拟加载配置数据
    const mockConfig = {
      participationCredit: 0.5,
      awardCredits: [
        { level: '一等奖', credit: 2.0 },
        { level: '二等奖', credit: 1.5 },
        { level: '三等奖', credit: 1.0 }
      ],
      autoParticipationCredit: true,
      autoAwardCredit: true,
      allowDuplicateCredit: false
    };
    
    this.setData(mockConfig);
  },

  // 参与学分变更
  onParticipationCreditChange(e) {
    const value = parseFloat(e.detail.value) || 0;
    this.setData({ participationCredit: value });
  },

  // 获奖学分变更
  onAwardCreditChange(e) {
    const level = e.currentTarget.dataset.level;
    const credit = parseFloat(e.detail.value) || 0;
    
    const awardCredits = this.data.awardCredits.map(award => {
      if (award.level === level) {
        return { ...award, credit: credit };
      }
      return award;
    });
    
    this.setData({ awardCredits });
  },

  // 新获奖等级输入
  onNewAwardLevelChange(e) {
    this.setData({ newAwardLevel: e.detail.value });
  },

  // 添加获奖等级
  onAddAward() {
    const { newAwardLevel, awardCredits } = this.data;
    
    if (!newAwardLevel.trim()) {
      wx.showToast({
        title: '请输入获奖等级',
        icon: 'none'
      });
      return;
    }
    
    // 检查是否已存在
    const exists = awardCredits.some(award => award.level === newAwardLevel);
    if (exists) {
      wx.showToast({
        title: '该等级已存在',
        icon: 'none'
      });
      return;
    }
    
    const newAward = {
      level: newAwardLevel,
      credit: 1.0 // 默认学分
    };
    
    this.setData({
      awardCredits: [...awardCredits, newAward],
      newAwardLevel: ''
    });
  },

  // 删除获奖等级
  onRemoveAward(e) {
    const index = e.currentTarget.dataset.index;
    const awardCredits = this.data.awardCredits.filter((_, i) => i !== index);
    
    this.setData({ awardCredits });
  },

  // 自动发放参与学分开关
  onAutoParticipationChange(e) {
    this.setData({ autoParticipationCredit: e.detail.value });
  },

  // 自动发放获奖学分开关
  onAutoAwardChange(e) {
    this.setData({ autoAwardCredit: e.detail.value });
  },

  // 允许重复获得学分开关
  onDuplicateCreditChange(e) {
    this.setData({ allowDuplicateCredit: e.detail.value });
  },

  // 保存配置
  onSaveConfig() {
    const { selectedActivity, participationCredit, awardCredits, autoParticipationCredit, autoAwardCredit, allowDuplicateCredit } = this.data;
    
    if (!selectedActivity) {
      wx.showToast({
        title: '请先选择活动',
        icon: 'none'
      });
      return;
    }
    
    // 验证数据
    if (participationCredit < 0) {
      wx.showToast({
        title: '参与学分不能为负数',
        icon: 'none'
      });
      return;
    }
    
    if (awardCredits.length === 0) {
      wx.showToast({
        title: '请至少设置一个获奖等级',
        icon: 'none'
      });
      return;
    }
    
    for (const award of awardCredits) {
      if (award.credit < 0) {
        wx.showToast({
          title: `${award.level}学分不能为负数`,
          icon: 'none'
        });
        return;
      }
    }
    
    wx.showLoading({ title: '保存中...' });
    
    // 模拟保存过程
    setTimeout(() => {
      const config = {
        activityId: selectedActivity.id,
        participationCredit,
        awardCredits,
        autoParticipationCredit,
        autoAwardCredit,
        allowDuplicateCredit,
        updatedAt: new Date().toISOString()
      };
      
      console.log('保存学分配置:', config);
      
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 重置配置
  onResetConfig() {
    wx.showModal({
      title: '重置确认',
      content: '确定要重置当前配置吗？所有更改将丢失。',
      success: (res) => {
        if (res.confirm) {
          this.loadActivityCreditConfig(this.data.selectedActivity.id);
          wx.showToast({
            title: '重置成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 预览效果
  onPreviewEffect() {
    this.setData({ showPreviewModal: true });
  },

  // 关闭模态框
  onCloseModal() {
    this.setData({ showPreviewModal: false });
  },

  // 计算属性
  // 总奖励等级数量
  get totalCreditLevels() {
    return this.data.awardCredits.length;
  },

  // 最高获奖学分
  get maxAwardCredit() {
    if (this.data.awardCredits.length === 0) return 0;
    return Math.max(...this.data.awardCredits.map(award => award.credit));
  },

  // 最大可获得学分
  get maxTotalCredit() {
    const participation = this.data.autoParticipationCredit ? this.data.participationCredit : 0;
    const maxAward = this.maxAwardCredit;
    return (participation + maxAward).toFixed(1);
  }
});