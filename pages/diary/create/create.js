// pages/diary/create/create.js
const app = getApp()

Page({
  data: {
    content: '',
    emotionIntensity: 5,
    date: '',
    isAnalyzing: false,
    showEmotionSelector: false,
    emotionTypes: ['快乐', '平静', '焦虑', '悲伤', '愤怒', '其他'],
    selectedEmotionType: '',
    isSubmitting: false
  },

  onLoad() {
    // 设置默认日期为今天
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    this.setData({
      date: dateStr
    })
  },

  // 输入日记内容
  onContentInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 选择情绪强度
  onEmotionIntensityChange(e) {
    this.setData({
      emotionIntensity: e.detail.value
    })
  },

  // 选择日期
  onDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  // 显示情绪类型选择器
  showEmotionSelector() {
    this.setData({
      showEmotionSelector: true
    })
  },

  // 选择情绪类型
  selectEmotionType(e) {
    const emotionType = e.currentTarget.dataset.emotion
    this.setData({
      selectedEmotionType: emotionType,
      showEmotionSelector: false
    })
  },

  // 关闭情绪类型选择器
  closeEmotionSelector() {
    this.setData({
      showEmotionSelector: false
    })
  },

  // 提交日记
  async submitDiary() {
    const { content, emotionIntensity, date, selectedEmotionType } = this.data
    
    if (!content.trim()) {
      wx.showToast({
        title: '请输入日记内容',
        icon: 'none'
      })
      return
    }

    if (!date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      })
      return
    }

    this.setData({ isSubmitting: true })

    try {
      // 1. 创建日记条目
      console.log('提交前的数据:', {
        content: content.trim(),
        emotionIntensity: emotionIntensity,
        emotionIntensityType: typeof emotionIntensity,
        parsedIntensity: parseInt(emotionIntensity),
        parsedType: typeof parseInt(emotionIntensity),
        date: date,
        emotionType: selectedEmotionType
      })
      
      const createResult = await wx.cloud.callFunction({
        name: 'createDiaryEntry',
        data: {
          content: content.trim(),
          emotionIntensity: emotionIntensity ? parseInt(emotionIntensity) : null,
          date: date,
          emotionType: selectedEmotionType || null
        }
      })

      if (!createResult.result.ok) {
        throw new Error(createResult.result.error || '创建失败')
      }

      const entryId = createResult.result.id

      // 2. 触发AI分析
      this.setData({ isAnalyzing: true })
      
      const analyzeResult = await wx.cloud.callFunction({
        name: 'analyzeDiaryEntry',
        data: {
          entryId: entryId
        }
      })

      if (analyzeResult.result.ok) {
        wx.showToast({
          title: '日记保存成功，AI分析完成',
          icon: 'success'
        })
        
        // 延迟跳转到详情页
        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/diary/detail/detail?id=${entryId}`
          })
        }, 1500)
      } else {
        wx.showToast({
          title: '日记保存成功，AI分析失败',
          icon: 'none'
        })
      }

    } catch (error) {
      console.error('提交日记失败:', error)
      wx.showToast({
        title: error.message || '提交失败',
        icon: 'none'
      })
    } finally {
      this.setData({ 
        isSubmitting: false,
        isAnalyzing: false
      })
    }
  },

  // 保存草稿
  saveDraft() {
    const { content, emotionIntensity, date } = this.data
    
    if (!content.trim()) {
      wx.showToast({
        title: '请输入日记内容',
        icon: 'none'
      })
      return
    }

    // 保存到本地存储
    const draft = {
      content,
      emotionIntensity,
      date,
      timestamp: Date.now()
    }
    
    wx.setStorageSync('diaryDraft', draft)
    
    wx.showToast({
      title: '草稿已保存',
      icon: 'success'
    })
  },

  // 加载草稿
  loadDraft() {
    try {
      const draft = wx.getStorageSync('diaryDraft')
      if (draft) {
        this.setData({
          content: draft.content || '',
          emotionIntensity: draft.emotionIntensity || 5,
          date: draft.date || new Date().toISOString().split('T')[0]
        })
        
        wx.showToast({
          title: '草稿已加载',
          icon: 'success'
        })
      }
    } catch (error) {
      console.error('加载草稿失败:', error)
    }
  },

  // 清空内容
  clearContent() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有内容吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            content: '',
            emotionIntensity: 5,
            selectedEmotionType: ''
          })
        }
      }
    })
  },

})
