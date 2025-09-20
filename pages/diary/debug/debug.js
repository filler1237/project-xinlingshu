// pages/diary/debug/debug.js
const app = getApp()

Page({
  data: {
    userIntensity: 8,
    userEmotionType: '愤怒',
    dbIntensity: null,
    dbEmotionType: null,
    latestDiary: null
  },

  onLoad() {
    this.loadLatestDiary()
  },

  // 创建测试日记
  async testCreateDiary() {
    try {
      console.log('准备创建测试日记，用户强度:', this.data.userIntensity, typeof this.data.userIntensity)
      
      const result = await wx.cloud.callFunction({
        name: 'createDiaryEntry',
        data: {
          content: '被同学诬陷了',
          emotionIntensity: this.data.userIntensity,
          date: '2025-01-20',
          emotionType: this.data.userEmotionType
        }
      })

      console.log('创建日记结果:', result)
      
      if (result.result.ok) {
        wx.showToast({
          title: '测试日记创建成功',
          icon: 'success'
        })
        this.loadLatestDiary()
      } else {
        wx.showToast({
          title: '创建失败: ' + result.result.error,
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('创建测试日记失败:', error)
      wx.showToast({
        title: '创建失败',
        icon: 'none'
      })
    }
  },

  // 分析测试日记
  async testAnalyzeDiary() {
    if (!this.data.latestDiary) {
      wx.showToast({
        title: '请先创建测试日记',
        icon: 'none'
      })
      return
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'analyzeDiaryEntry',
        data: {
          entryId: this.data.latestDiary._id
        }
      })

      console.log('分析日记结果:', result)
      
      if (result.result.ok) {
        wx.showToast({
          title: '分析完成',
          icon: 'success'
        })
        this.loadLatestDiary()
      } else {
        wx.showToast({
          title: '分析失败: ' + result.result.error,
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('分析测试日记失败:', error)
      wx.showToast({
        title: '分析失败',
        icon: 'none'
      })
    }
  },

  // 加载最新日记
  async loadLatestDiary() {
    try {
      const db = wx.cloud.database()
      const result = await db.collection('DiaryEntries')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get()

      if (result.data.length > 0) {
        const diary = result.data[0]
        this.setData({
          latestDiary: diary,
          dbIntensity: diary.emotionIntensity,
          dbEmotionType: diary.emotionType
        })
        console.log('最新日记数据:', diary)
      }
    } catch (error) {
      console.error('加载最新日记失败:', error)
    }
  }
})
