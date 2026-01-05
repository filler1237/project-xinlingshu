// pages/diary/detail/detail.js
const app = getApp()

Page({
  data: {
    diaryEntry: null,
    loading: true,
    error: null,
    showAnalysis: false,
    isAnalyzing: false
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.loadDiaryEntry(id)
    } else {
      this.setData({
        error: '缺少日记ID',
        loading: false
      })
    }
  },

  // 加载日记条目
  async loadDiaryEntry(entryId) {
    try {
      this.setData({ loading: true, error: null })

      // 从数据库获取日记条目
      const db = wx.cloud.database()
      const result = await db.collection('DiaryEntries').doc(entryId).get()
      
      if (result.data) {
        console.log('加载的日记数据:', result.data) // 调试用
        this.setData({
          diaryEntry: result.data,
          loading: false
        })
      } else {
        throw new Error('日记不存在')
      }
    } catch (error) {
      console.error('加载日记失败:', error)
      this.setData({
        error: error.message || '加载失败',
        loading: false
      })
    }
  },

  // 重新分析日记
  async reanalyzeDiary() {
    const { diaryEntry } = this.data
    if (!diaryEntry) return

    this.setData({ isAnalyzing: true })

    try {
      const result = await wx.cloud.callFunction({
        name: 'analyzeDiaryEntry',
        data: {
          entryId: diaryEntry._id
        }
      })

      if (result.result.ok) {
        // 重新加载日记条目
        await this.loadDiaryEntry(diaryEntry._id)
        
        wx.showToast({
          title: '重新分析完成',
          icon: 'success'
        })
      } else {
        throw new Error(result.result.error || '分析失败')
      }
    } catch (error) {
      console.error('重新分析失败:', error)
      wx.showToast({
        title: error.message || '分析失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isAnalyzing: false })
    }
  },

  // 删除日记
  deleteDiary() {
    const { diaryEntry } = this.data
    if (!diaryEntry) return

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这篇日记吗？删除后无法恢复。',
      success: async (res) => {
        if (res.confirm) {
          try {
            console.log('开始删除日记，ID:', diaryEntry._id)
            
            // 先尝试使用云函数删除
            try {
              const result = await wx.cloud.callFunction({
                name: 'deleteDiary',
                data: {
                  diaryId: diaryEntry._id
                }
              })
              
              console.log('云函数删除结果:', result)
              
              if (result.result && result.result.success) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                
                // 返回上一页
                setTimeout(() => {
                  wx.navigateBack()
                }, 1500)
                return
              } else {
                throw new Error(result.result?.error || '云函数删除失败')
              }
            } catch (cloudError) {
              console.log('云函数删除失败，尝试直接删除:', cloudError)
              
              // 如果云函数失败，尝试直接删除
              const db = wx.cloud.database()
              await db.collection('DiaryEntries').doc(diaryEntry._id).remove()
              
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              
              // 返回上一页
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            }
          } catch (error) {
            console.error('删除失败:', error)
            wx.showToast({
              title: `删除失败: ${error.message}`,
              icon: 'none',
              duration: 3000
            })
          }
        }
      }
    })
  },

  // 分享日记
  shareDiary() {
    const { diaryEntry } = this.data
    if (!diaryEntry) return

    return {
      title: `我的心情日记 - ${diaryEntry.date}`,
      path: `/pages/diary/detail/detail?id=${diaryEntry._id}`,
      imageUrl: '/images/diary-share.png'
    }
  },

  // 复制内容
  copyContent() {
    const { diaryEntry } = this.data
    if (!diaryEntry || !diaryEntry.empathyReply) {
      wx.showToast({
        title: '没有AI回复可复制',
        icon: 'none'
      })
      return
    }

    wx.setClipboardData({
      data: diaryEntry.empathyReply,
      success: () => {
        wx.showToast({
          title: 'AI回复已复制',
          icon: 'success'
        })
      }
    })
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return '无日期'
    
    let date
    if (typeof dateStr === 'string') {
      date = new Date(dateStr)
    } else if (dateStr instanceof Date) {
      date = dateStr
    } else if (dateStr.seconds) {
      // 处理Firebase Timestamp格式
      date = new Date(dateStr.seconds * 1000)
    } else {
      console.log('未知的日期格式:', dateStr)
      return '日期格式错误'
    }
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.log('无效的日期:', dateStr)
      return '无效日期'
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return ''
    
    // 处理不同的数据类型
    let date
    if (typeof timeStr === 'string') {
      date = new Date(timeStr)
    } else if (timeStr instanceof Date) {
      date = timeStr
    } else if (timeStr.seconds) {
      // 处理Firebase Timestamp格式
      date = new Date(timeStr.seconds * 1000)
    } else {
      console.log('未知的时间格式:', timeStr)
      return '时间格式错误'
    }
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.log('无效的日期:', timeStr)
      return '无效日期'
    }
    
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  },

  // 格式化星期几
  formatWeekday(dateStr) {
    if (!dateStr) return '无日期'
    
    let date
    if (typeof dateStr === 'string') {
      date = new Date(dateStr)
    } else if (dateStr instanceof Date) {
      date = dateStr
    } else if (dateStr.seconds) {
      // 处理Firebase Timestamp格式
      date = new Date(dateStr.seconds * 1000)
    } else {
      console.log('未知的日期格式:', dateStr)
      return '日期格式错误'
    }
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.log('无效的日期:', dateStr)
      return '无效日期'
    }
    
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()]
  },

  // 获取情绪颜色
  getEmotionColor(emotionType) {
    const colorMap = {
      '快乐': '#ffd93d',
      '平静': '#6bcf7f',
      '焦虑': '#ff6b6b',
      '悲伤': '#4dabf7',
      '愤怒': '#ff8cc8',
      '其他': '#9775fa'
    }
    console.log('获取情绪颜色:', emotionType) // 调试用
    return colorMap[emotionType] || '#9775fa'
  },

  // 获取情绪强度描述
  getIntensityText(intensity) {
    if (!intensity || intensity === null) return '未设置'
    if (intensity <= 3) return '轻微'
    if (intensity <= 6) return '中等'
    if (intensity <= 8) return '强烈'
    return '非常强烈'
  },

})
