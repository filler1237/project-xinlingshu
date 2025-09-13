// pages/diary/trend/trend.js
const app = getApp()

Page({
  data: {
    trendData: [],
    emotionStats: {},
    timeRange: 'week', // week, month, quarter
    startDate: '',
    endDate: '',
    loading: true,
    chartData: null,
    selectedEmotion: 'all',
    emotionTypes: ['快乐', '平静', '焦虑', '悲伤', '愤怒', '其他']
  },

  onLoad() {
    this.initDateRange()
    this.loadTrendData()
  },

  // 初始化日期范围
  initDateRange() {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
    
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    this.setData({
      startDate: formatDate(weekAgo),
      endDate: formatDate(today)
    })
  },

  // 加载趋势数据
  async loadTrendData() {
    try {
      this.setData({ loading: true })
      
      const { startDate, endDate } = this.data
      const result = await wx.cloud.callFunction({
        name: 'getEmotionTrend',
        data: {
          startDate,
          endDate
        }
      })
      
      if (result.result.ok) {
        const { series, stat } = result.result
        this.setData({
          trendData: series,
          emotionStats: stat,
          loading: false
        })
        
        this.generateChartData()
      } else {
        throw new Error(result.result.error || '加载失败')
      }
    } catch (error) {
      console.error('加载趋势数据失败:', error)
      this.setData({
        loading: false
      })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 生成图表数据
  generateChartData() {
    const { trendData, selectedEmotion } = this.data
    
    // 按日期分组
    const groupedData = {}
    trendData.forEach(entry => {
      if (!groupedData[entry.date]) {
        groupedData[entry.date] = []
      }
      groupedData[entry.date].push(entry)
    })
    
    // 计算每日平均情绪强度
    const chartData = Object.keys(groupedData).map(date => {
      const entries = groupedData[date]
      const filteredEntries = selectedEmotion === 'all' 
        ? entries 
        : entries.filter(entry => entry.emotionType === selectedEmotion)
      
      if (filteredEntries.length === 0) {
        return {
          date,
          averageIntensity: 0,
          emotionCount: 0,
          dominantEmotion: null
        }
      }
      
      const totalIntensity = filteredEntries.reduce((sum, entry) => sum + (entry.emotionIntensity || 0), 0)
      const averageIntensity = totalIntensity / filteredEntries.length
      
      // 找出主导情绪
      const emotionCount = {}
      filteredEntries.forEach(entry => {
        if (entry.emotionType) {
          emotionCount[entry.emotionType] = (emotionCount[entry.emotionType] || 0) + 1
        }
      })
      
      const dominantEmotion = Object.keys(emotionCount).reduce((a, b) => 
        emotionCount[a] > emotionCount[b] ? a : b, null
      )
      
      return {
        date,
        averageIntensity: Math.round(averageIntensity * 10) / 10,
        emotionCount: filteredEntries.length,
        dominantEmotion
      }
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
    
    this.setData({ chartData })
  },

  // 选择时间范围
  selectTimeRange(e) {
    const timeRange = e.currentTarget.dataset.range
    const today = new Date()
    let startDate
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
    
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    this.setData({
      timeRange,
      startDate: formatDate(startDate),
      endDate: formatDate(today)
    })
    
    this.loadTrendData()
  },

  // 选择情绪类型
  selectEmotion(e) {
    const emotion = e.currentTarget.dataset.emotion
    this.setData({ selectedEmotion: emotion })
    this.generateChartData()
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
    return colorMap[emotionType] || '#e9ecef'
  },

  // 获取情绪强度描述
  getIntensityDescription(intensity) {
    if (intensity <= 3) return '轻微'
    if (intensity <= 6) return '中等'
    if (intensity <= 8) return '强烈'
    return '非常强烈'
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  },

  // 导出数据
  exportData() {
    const { trendData, emotionStats } = this.data
    
    let exportText = '情绪日记分析报告\n\n'
    exportText += `统计时间: ${this.data.startDate} 至 ${this.data.endDate}\n\n`
    
    exportText += '情绪统计:\n'
    Object.keys(emotionStats).forEach(emotion => {
      exportText += `${emotion}: ${emotionStats[emotion]}次\n`
    })
    
    exportText += '\n详细记录:\n'
    trendData.forEach(entry => {
      exportText += `${entry.date}: ${entry.emotionType} (强度${entry.emotionIntensity})\n`
    })
    
    wx.setClipboardData({
      data: exportText,
      success: () => {
        wx.showToast({
          title: '数据已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  }
})
