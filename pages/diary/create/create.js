// pages/diary/create/create.js
const app = getApp()

Page({
  data: {
    content: '',
    emotionIntensity: 5,
    date: '',
    isAnalyzing: false,
    emotionOptions: [
      { name: '快乐', emoji: '😊' },
      { name: '平静', emoji: '😌' },
      { name: '焦虑', emoji: '😟' },
      { name: '悲伤', emoji: '😢' },
      { name: '愤怒', emoji: '😠' },
      { name: '其他', emoji: '🤔' }
    ],
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
    this.loadTemporaryDiary()
  },

  onUnload() {
    this.saveTemporaryDiary()
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

  // 选择情绪类型
  selectEmotionType(e) {
    const emotionType = e.currentTarget.dataset.emotion;
    this.setData({
      selectedEmotionType: emotionType
    });

    // 推荐情绪强度
    const recommendedIntensity = {
      '快乐': 7,
      '平静': 5,
      '焦虑': 6,
      '悲伤': 4,
      '愤怒': 8,
      '其他': 5
    };
    if (recommendedIntensity[emotionType]) {
      this.setData({
        emotionIntensity: recommendedIntensity[emotionType]
      });
    }
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
      this.setData({ isSubmitting: true })

      // 1. 创建日记条目
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
      // 提交成功后清除暂存
      wx.removeStorageSync('temporaryDiary')
    }
  },

  // 自动暂存日记
  saveTemporaryDiary() {
    const { content, emotionIntensity, date, selectedEmotionType } = this.data
    if (content && content.trim().length > 0) {
      const temporaryDiary = {
        content,
        emotionIntensity,
        date,
        selectedEmotionType,
        timestamp: Date.now()
      }
      wx.setStorageSync('temporaryDiary', temporaryDiary)
      console.log('日记已自动暂存')
    }
  },

  // 加载暂存的日记
  loadTemporaryDiary() {
    const temporaryDiary = wx.getStorageSync('temporaryDiary')
    if (temporaryDiary && temporaryDiary.content) {
      wx.showModal({
        title: '恢复日记',
        content: '检测到上次未保存的日记，是否要恢复？',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              content: temporaryDiary.content,
              emotionIntensity: temporaryDiary.emotionIntensity,
              date: temporaryDiary.date,
              selectedEmotionType: temporaryDiary.selectedEmotionType
            })
            wx.showToast({
              title: '已恢复',
              icon: 'success'
            })
          }
          // 无论是否恢复，都清除暂存
          wx.removeStorageSync('temporaryDiary')
        }
      })
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
