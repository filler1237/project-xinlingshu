// pages/admin/applyActivity/applyActivity.js
Page({
  data: {
    // ========== 1. 基本信息 (精简版) ==========
    theme: '',           // 活动主题 (保留)
    startTime: '',       // 开始时间
    endTime: '',         // 结束时间
    description: '',     // 活动描述
    minDate: '2024-01-01', // 最小日期
    
    // ========== 2. 评分细则设置 (保留) ==========
    scoreRules: [
      {
        id: 1,
        name: '内容质量',
        maxScore: 40,
        description: '主题明确、逻辑清晰、内容丰富度'
      },
      {
        id: 2,
        name: '创意性',
        maxScore: 30,
        description: '创新思维、独特视角、新颖表达'
      },
      {
        id: 3,
        name: '技术表现',
        maxScore: 30,
        description: '技术难度、完成度、表现效果'
      }
    ],
    totalScore: 100,      // 评分项总分
    nextScoreRuleId: 4, // 下一个评分项ID
    
    // ========== 3. 作品类型设置 (保留) ==========
    allowedUploadTypes: [
      { name: '文稿', value: 'document', icon: '📝', desc: '支持doc、docx、pdf、txt格式', checked: true },
      { name: '图片', value: 'image', icon: '🖼️', desc: '支持jpg、png、gif格式，不超过10MB', checked: true },
      { name: '音频', value: 'audio', icon: '🎵', desc: '支持mp3、wav格式，不超过50MB', checked: false },
      { name: '视频', value: 'video', icon: '🎬', desc: '支持mp4、mov格式，不超过100MB', checked: false },
      { name: '压缩包', value: 'zip', icon: '📦', desc: '支持zip、rar格式，包含多个文件', checked: false }
    ],
    
    // ========== 4. 评委分配设置 (已删除) ==========
    // 评委分配完全由后台处理
    
    // ========== 5. 获奖等级设置 (精简版) ==========
    awardRules: [
      {
        level: '一等奖',
        minScore: 90,           // 最低分数线（百分比）
        quota: 0.1              // 名额比例（0-1之间）
        // description字段已删除
      },
      {
        level: '二等奖',
        minScore: 80,
        quota: 0.2
      },
      {
        level: '三等奖',
        minScore: 70,
        quota: 0.3
      }
    ],
    nextAwardRuleId: 4, // 下一个等级ID
    totalQuota: 0.6,    // 总获奖比例
    totalQuotaPercent: '60.0', // 总获奖比例百分比（用于显示）
    
    // ========== 6. 表单状态 ==========
    canSubmit: false,   // 是否可以提交
    errors: {           // 错误信息 (精简)
      theme: '',
      time: '',
      description: '',
      scoreRules: '',
      uploadTypes: '',
      awardRules: ''
    },
    isSubmitting: false // 是否正在提交
  },

  // ========== 生命周期函数 ==========
  onLoad(options) {
    console.log('🆕 进入发布新活动页面');
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '发布新活动'
    });
    
    // 设置最小日期为今天
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.setData({
      minDate: `${year}-${month}-${day}`
    });
    
    // 初始验证
    this.validateForm();
    this.calculateTotalScore();
    this.calculateTotalQuota();
  },

  // ========== 1. 基本信息处理方法 (精简版) ==========
  
  onThemeInput(e) {
    this.setData({ theme: e.detail.value.trim() }, () => {
      this.validateField('theme');
      this.validateForm();
    });
  },
  
  onStartTimeChange(e) {
    console.log('📅 选择开始时间:', e.detail.value);
    this.setData({ startTime: e.detail.value }, () => {
      this.validateTime();
      this.validateForm();
    });
  },
  
  onEndTimeChange(e) {
    console.log('📅 选择结束时间:', e.detail.value);
    this.setData({ endTime: e.detail.value }, () => {
      this.validateTime();
      this.validateForm();
    });
  },
  
  onDescriptionInput(e) {
    this.setData({ description: e.detail.value.trim() }, () => {
      this.validateField('description');
      this.validateForm();
    });
  },

  // ========== 2. 评分细则处理方法 (保留) ==========
  
  // 添加评分项
  onAddScoreRule() {
    const newId = this.data.nextScoreRuleId;
    const newRule = {
      id: newId,
      name: '',
      maxScore: 0,
      description: ''
    };
    
    this.setData({
      scoreRules: [...this.data.scoreRules, newRule],
      nextScoreRuleId: newId + 1
    }, () => {
      this.calculateTotalScore();
      this.validateScoreRules();
      this.validateForm();
    });
  },
  
  // 删除评分项
  onDeleteScoreRule(e) {
    const index = e.currentTarget.dataset.index;
    const scoreRules = [...this.data.scoreRules];
    
    // 至少保留一个评分项
    if (scoreRules.length <= 1) {
      wx.showToast({
        title: '至少需要一个评分项',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个评分项吗？',
      success: (res) => {
        if (res.confirm) {
          scoreRules.splice(index, 1);
          
          this.setData({ scoreRules }, () => {
            this.calculateTotalScore();
            this.validateScoreRules();
            this.validateForm();
          });
        }
      }
    });
  },
  
  // 评分项内容变化
  onScoreRuleChange(e) {
    const index = e.currentTarget.dataset.index;
    const field = e.currentTarget.dataset.field;
    let value = e.detail.value;
    
    const scoreRules = [...this.data.scoreRules];
    
    // 对分值上限做限制
    if (field === 'maxScore') {
      const numValue = parseInt(value) || 0;
      if (numValue < 0) value = 0;
      else if (numValue > 100) value = 100;
      else value = numValue;
    }
    
    scoreRules[index][field] = field === 'name' || field === 'description' ? value.trim() : value;
    
    this.setData({ scoreRules }, () => {
      this.calculateTotalScore();
      this.validateScoreRules();
      this.validateForm();
    });
  },
  
  // 计算总分
  calculateTotalScore() {
    const total = this.data.scoreRules.reduce((sum, rule) => {
      return sum + (parseInt(rule.maxScore) || 0);
    }, 0);
    
    this.setData({ totalScore: total });
  },
  
  // ========== 3. 作品类型处理方法 (保留) ==========
  
  // 切换作品类型选择
  onToggleUploadType(e) {
    const index = e.currentTarget.dataset.index;
    const allowedUploadTypes = [...this.data.allowedUploadTypes];
    allowedUploadTypes[index].checked = !allowedUploadTypes[index].checked;
    
    this.setData({ allowedUploadTypes }, () => {
      this.validateUploadTypes();
      this.validateForm();
    });
  },
  
  // ========== 4. 评委分配处理方法 (已删除) ==========
  
  // ========== 5. 获奖等级处理方法 (精简版) ==========
  
  // 添加获奖等级
  onAddAwardRule() {
    const levelNames = ['一等奖', '二等奖', '三等奖', '优秀奖', '参与奖'];
    const newLevelName = levelNames[this.data.awardRules.length] || '等级' + (this.data.awardRules.length + 1);
    
    const newRule = {
      level: newLevelName,
      minScore: 60,
      quota: 0.1
      // description字段已删除
    };
    
    this.setData({
      awardRules: [...this.data.awardRules, newRule]
    }, () => {
      this.calculateTotalQuota();
      this.validateAwardRules();
      this.validateForm();
    });
  },
  
  // 删除获奖等级
  onDeleteAwardRule(e) {
    const index = e.currentTarget.dataset.index;
    const awardRules = [...this.data.awardRules];
    
    // 至少保留一个等级
    if (awardRules.length <= 1) {
      wx.showToast({
        title: '至少需要一个获奖等级',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个获奖等级吗？',
      success: (res) => {
        if (res.confirm) {
          awardRules.splice(index, 1);
          
          this.setData({ awardRules }, () => {
            this.calculateTotalQuota();
            this.validateAwardRules();
            this.validateForm();
          });
        }
      }
    });
  },
  
  // 获奖等级内容变化
  onAwardRuleChange(e) {
    const index = e.currentTarget.dataset.index;
    const field = e.currentTarget.dataset.field;
    let value = e.detail.value;
    
    const awardRules = [...this.data.awardRules];
    
    // 数值类型处理
    if (field === 'minScore' || field === 'quota') {
      const numValue = parseFloat(value) || 0;
      if (numValue < 0) value = 0;
      else if (field === 'minScore' && numValue > 100) value = 100;
      else if (field === 'quota' && numValue > 1) value = 1;
      else value = numValue;
    } else {
      // 处理level字段
      awardRules[index][field] = value.trim();
    }
    
    this.setData({ awardRules }, () => {
      this.calculateTotalQuota();
      this.validateAwardRules();
      this.validateForm();
    });
  },
  
  // 计算总获奖比例
  calculateTotalQuota() {
    const total = this.data.awardRules.reduce((sum, rule) => {
      return sum + (parseFloat(rule.quota) || 0);
    }, 0);
    
    // 计算百分比字符串
    const percent = (total * 100).toFixed(1);
    
    this.setData({ 
      totalQuota: total,
      totalQuotaPercent: percent
    });
  },

  // ========== 6. 表单验证方法 (精简版) ==========
  
  // 验证单个字段
  validateField(fieldName) {
    const errors = { ...this.data.errors };
    const value = this.data[fieldName];
    
    switch(fieldName) {
      case 'theme':
        errors.theme = value ? (value.length < 5 ? '主题至少5个字符' : '') : '请输入活动主题';
        break;
      case 'description':
        errors.description = value ? (value.length < 10 ? '描述至少10个字符' : '') : '请输入活动描述';
        break;
    }
    
    this.setData({ errors });
  },
  
  // 验证时间
  validateTime() {
    const { startTime, endTime } = this.data;
    const errors = { ...this.data.errors };
    
    if (!startTime || !endTime) {
      errors.time = '请选择完整的时间';
    } else {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        errors.time = '开始时间不能早于今天';
      } else if (start >= end) {
        errors.time = '结束时间必须晚于开始时间';
      } else {
        errors.time = '';
      }
    }
    
    this.setData({ errors });
  },
  
  // 验证评分规则
  validateScoreRules() {
    const { scoreRules } = this.data;
    const errors = { ...this.data.errors };
    
    if (scoreRules.length === 0) {
      errors.scoreRules = '请至少添加一个评分项';
    } else {
      // 检查是否有空的评分项名称
      const hasEmptyName = scoreRules.some(rule => !rule.name || rule.name.trim() === '');
      const hasInvalidScore = scoreRules.some(rule => !rule.maxScore || rule.maxScore <= 0);
      
      if (hasEmptyName) {
        errors.scoreRules = '请填写所有评分项名称';
      } else if (hasInvalidScore) {
        errors.scoreRules = '评分项分值必须大于0';
      } else {
        errors.scoreRules = '';
      }
    }
    
    this.setData({ errors });
  },
  
  // 验证作品类型
  validateUploadTypes() {
    const { allowedUploadTypes } = this.data;
    const errors = { ...this.data.errors };
    
    const hasChecked = allowedUploadTypes.some(type => type.checked);
    
    if (!hasChecked) {
      errors.uploadTypes = '请至少选择一种作品类型';
    } else {
      errors.uploadTypes = '';
    }
    
    this.setData({ errors });
  },
  
  // 验证获奖规则
  validateAwardRules() {
    const { awardRules } = this.data;
    const errors = { ...this.data.errors };
    
    if (awardRules.length === 0) {
      errors.awardRules = '请至少添加一个获奖等级';
    } else {
      // 检查是否有空的等级名称
      const hasEmptyLevel = awardRules.some(rule => !rule.level || rule.level.trim() === '');
      const hasInvalidScore = awardRules.some(rule => rule.minScore < 0 || rule.minScore > 100);
      const hasInvalidQuota = awardRules.some(rule => rule.quota < 0 || rule.quota > 1);
      
      if (hasEmptyLevel) {
        errors.awardRules = '请填写所有等级名称';
      } else if (hasInvalidScore) {
        errors.awardRules = '分数线必须在0-100之间';
      } else if (hasInvalidQuota) {
        errors.awardRules = '名额比例必须在0-1之间';
      } else {
        errors.awardRules = '';
      }
    }
    
    this.setData({ errors });
  },
  
  // 综合验证表单 (精简版)
  validateForm() {
    // 检查所有必填字段
    const hasBasicInfo = this.data.theme && 
                        this.data.startTime && 
                        this.data.endTime && 
                        this.data.description;
    
    // 检查评分规则
    const hasValidScoreRules = this.data.scoreRules.length > 0 &&
                               !this.data.scoreRules.some(rule => !rule.name || rule.maxScore <= 0);
    
    // 检查作品类型
    const hasValidUploadTypes = this.data.allowedUploadTypes.some(type => type.checked);
    
    // 检查获奖规则
    const hasValidAwardRules = this.data.awardRules.length > 0 &&
                               !this.data.awardRules.some(rule => !rule.level || rule.minScore < 0 || rule.quota < 0);
    
    // 检查错误信息
    const hasNoErrors = Object.values(this.data.errors).every(error => !error);
    
    // 总分建议为100分（但不强制）
    const isScoreValid = this.data.totalScore > 0;
    
    // 总获奖比例不超过100%
    const isQuotaValid = this.data.totalQuota <= 1;
    
    const canSubmit = hasBasicInfo && 
                      hasValidScoreRules && 
                      hasValidUploadTypes && 
                      hasValidAwardRules && 
                      hasNoErrors && 
                      isScoreValid && 
                      isQuotaValid &&
                      !this.data.isSubmitting;
    
    console.log('🔍 表单验证结果:', {
      canSubmit,
      hasBasicInfo,
      hasValidScoreRules,
      hasValidUploadTypes,
      hasValidAwardRules,
      hasNoErrors,
      isScoreValid,
      isQuotaValid
    });
    
    this.setData({ canSubmit });
    return canSubmit;
  },

  // ========== 7. 表单提交方法 (精简版) ==========
  
  onSubmit() {
    console.log('🚀 开始提交活动申请');
    
    // 最终验证
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善表单信息',
        icon: 'none',
        duration: 2000
      });
      
      // 找出第一个错误项并滚动到那里
      const firstErrorKey = Object.keys(this.data.errors).find(key => this.data.errors[key]);
      if (firstErrorKey) {
        wx.pageScrollTo({
          selector: `.form-card:nth-of-type(1)`,
          duration: 300
        });
      }
      
      return;
    }
    
    // 防止重复提交
    if (this.data.isSubmitting) {
      return;
    }
    
    this.setData({ isSubmitting: true });
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    
    // 准备提交数据 (精简版)
    const activityData = {
      // 基本信息
      basicInfo: {
        theme: this.data.theme,
        startTime: this.data.startTime,
        endTime: this.data.endTime,
        description: this.data.description
      },
      
      // 评分细则（过滤空值）
      scoreRules: this.data.scoreRules.map(rule => ({
        name: rule.name.trim(),
        maxScore: parseInt(rule.maxScore) || 0,
        description: rule.description ? rule.description.trim() : ''
      })),
      
      // 作品类型（只选中的）
      allowedUploadTypes: this.data.allowedUploadTypes
        .filter(type => type.checked)
        .map(type => type.value),
      
      // 获奖规则（过滤空值，不含description）
      awardRules: this.data.awardRules.map(rule => ({
        level: rule.level.trim(),
        minScore: parseFloat(rule.minScore) || 0,
        quota: parseFloat(rule.quota) || 0
      })),
      
      // 系统信息
      systemInfo: {
        creditNote: '学分由学校系统根据获奖等级发放',
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        judgeNote: '评委分配由后台算法自动处理'
      }
    };
    
    console.log('📤 提交的活动数据:', activityData);
    
    // 调用云函数创建活动
    wx.cloud.callFunction({
      name: 'createActivity',
      data: {
        theme: activityData.basicInfo.theme,
        startTime: activityData.basicInfo.startTime,
        endTime: activityData.basicInfo.endTime,
        description: activityData.basicInfo.description,
        scoreRules: activityData.scoreRules,
        awardRules: activityData.awardRules,
        allowedUploadTypes: activityData.allowedUploadTypes
      },
      success: (res) => {
        wx.hideLoading();
        this.setData({ isSubmitting: false });
        
        if (res.result.success) {
          console.log('✅ 活动创建成功:', res.result);
          wx.showModal({
            title: '创建成功',
            content: '活动已成功创建',
            showCancel: false,
            confirmText: '确定',
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 返回上一页
                wx.navigateBack();
              }
            }
          });
        } else {
          console.error('❌ 活动创建失败:', res.result);
          wx.showToast({
            title: res.result.message || '创建失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ isSubmitting: false });
        console.error('❌ 云函数调用失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  
  // 重置表单 (精简版)
  onReset() {
    wx.showModal({
      title: '重置确认',
      content: '确定要清空所有表单内容吗？',
      confirmText: '清空',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            // 重置所有数据
            theme: '',
            startTime: '',
            endTime: '',
            description: '',
            scoreRules: [
              {
                id: 1,
                name: '内容质量',
                maxScore: 40,
                description: '主题明确、逻辑清晰、内容丰富度'
              }
            ],
            totalScore: 40,
            nextScoreRuleId: 2,
            allowedUploadTypes: [
              { name: '文稿', value: 'document', icon: '📝', desc: '支持doc、docx、pdf、txt格式', checked: true },
              { name: '图片', value: 'image', icon: '🖼️', desc: '支持jpg、png、gif格式，不超过10MB', checked: true },
              { name: '音频', value: 'audio', icon: '🎵', desc: '支持mp3、wav格式，不超过50MB', checked: false },
              { name: '视频', value: 'video', icon: '🎬', desc: '支持mp4、mov格式，不超过100MB', checked: false },
              { name: '压缩包', value: 'zip', icon: '📦', desc: '支持zip、rar格式，包含多个文件', checked: false }
            ],
            // 评委设置已删除
            awardRules: [
              {
                level: '一等奖',
                minScore: 90,
                quota: 0.1
              }
            ],
            totalQuota: 0.1,
            totalQuotaPercent: '10.0',
            nextAwardRuleId: 2,
            errors: {
              theme: '',
              time: '',
              description: '',
              scoreRules: '',
              uploadTypes: '',
              awardRules: ''
            },
            canSubmit: false,
            isSubmitting: false
          });
          
          wx.showToast({
            title: '表单已重置',
            icon: 'success'
          });
        }
      }
    });
  },

  // ========== 8. 其他功能方法 ==========
  
  // 返回上一页
  onBack() {
    wx.navigateBack({
      delta: 1
    });
  },
  
  // 页面卸载时清理
  onUnload() {
    if (this.data.isSubmitting) {
      this.setData({ isSubmitting: false });
    }
  },

  // ========== 9. 表单保存为草稿功能（可选） ==========
  
  // 保存草稿到本地存储
  saveAsDraft() {
    const draftData = {
      theme: this.data.theme,
      startTime: this.data.startTime,
      endTime: this.data.endTime,
      description: this.data.description,
      scoreRules: this.data.scoreRules,
      allowedUploadTypes: this.data.allowedUploadTypes,
      awardRules: this.data.awardRules,
      savedAt: new Date().toISOString()
    };
    
    try {
      wx.setStorageSync('activityDraft', draftData);
      wx.showToast({
        title: '草稿已保存',
        icon: 'success'
      });
      return true;
    } catch (error) {
      console.error('保存草稿失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
      return false;
    }
  },
  
  // 加载草稿
  loadDraft() {
    try {
      const draftData = wx.getStorageSync('activityDraft');
      if (draftData) {
        wx.showModal({
          title: '加载草稿',
          content: '检测到有未完成的草稿，是否加载？',
          success: (res) => {
            if (res.confirm) {
              this.setData({
                theme: draftData.theme || '',
                startTime: draftData.startTime || '',
                endTime: draftData.endTime || '',
                description: draftData.description || '',
                scoreRules: draftData.scoreRules || [
                  {
                    id: 1,
                    name: '内容质量',
                    maxScore: 40,
                    description: '主题明确、逻辑清晰、内容丰富度'
                  }
                ],
                allowedUploadTypes: draftData.allowedUploadTypes || [
                  { name: '文稿', value: 'document', icon: '📝', desc: '支持doc、docx、pdf、txt格式', checked: true },
                  { name: '图片', value: 'image', icon: '🖼️', desc: '支持jpg、png、gif格式，不超过10MB', checked: true },
                  { name: '音频', value: 'audio', icon: '🎵', desc: '支持mp3、wav格式，不超过50MB', checked: false },
                  { name: '视频', value: 'video', icon: '🎬', desc: '支持mp4、mov格式，不超过100MB', checked: false },
                  { name: '压缩包', value: 'zip', icon: '📦', desc: '支持zip、rar格式，包含多个文件', checked: false }
                ],
                awardRules: draftData.awardRules || [
                  {
                    level: '一等奖',
                    minScore: 90,
                    quota: 0.1
                  }
                ]
              }, () => {
                this.calculateTotalScore();
                this.calculateTotalQuota();
                this.validateForm();
                wx.showToast({
                  title: '草稿已加载',
                  icon: 'success'
                });
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('加载草稿失败:', error);
    }
  },
  
  // 页面显示时检查草稿
  onShow() {
    this.loadDraft();
  }
});