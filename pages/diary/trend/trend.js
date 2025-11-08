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
    isZoomed: false,
    yAxisLabels: ['0', '2', '4', '6', '8', '10'],
    showAllDetails: false,
    isAnalyzingTrend: false,
    trendAnalysisResult: '',
    factInterval: null,
    currentFact: '',
    psychologyFacts: [
      "“心流”是一种将个人精神力完全投注在某种活动上的感觉，心流产生时同时会有高度的兴奋及充实感。",
      "“确认偏误”是指人们会倾向于寻找能支持自己观点的证据，而忽略与自己观点矛盾的证据。",
      "“邓宁-克鲁格效应”是一种认知偏差，能力欠缺的人有一种虚幻的自我优越感，错误地认为自己比真实情况更加优秀。",
      "“旁观者效应”是指在紧急情况下，由于有他人在场，个体在提供帮助时会感到犹豫。",
      "“习得性无助”是指人或动物接连不断地受到挫折，便会感到自己对于一切都无能为力，丧失信心，陷入一种无助的心理状态。",
      "“认知失调”是指当个体持有两种或多种相互矛盾的信念、想法或价值观时，所体验到的心理压力或不适。",
      "“情绪ABC理论”认为，激发事件A只是引发情绪和行为后果C的间接原因，而引起C的直接原因则是个体对激发事件A的认知和评价而产生的信念B。",
      "“马斯洛需求层次理论”将人类需求像阶梯一样从低到高按层次分为五种，分别是：生理需求、安全需求、社交需求、尊重需求和自我实现需求。",
      "“巴纳姆效应”是指人们常常认为一种笼统的、一般性的人格描述十分准确地揭示了自己的特点。",
      "“从众效应”是指个体在真实的或想象的群体压力下，在认知上或行动上以多数人或权威人物的行为为准则，进而在行为上努力与之趋向一致的现象。"
    ]
  },

  onLoad() {
    this.initDateRange()
    this.loadTrendData()
  },

  onShow() {
    // 页面显示时检查是否需要保持屏幕常亮
    if (this.data.isZoomed) {
      // 如果当前是放大状态，保持屏幕常亮
      wx.setKeepScreenOn({
        keepScreenOn: true
      })
    }
  },

  onHide() {
    // 页面隐藏时关闭屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: false
    })
  },

  onUnload() {
    // 页面卸载时关闭屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: false
    })
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
        console.log('获取到的趋势数据:', series) // 调试日志
        
        // 为情绪统计添加emoji
        const emotionStatsWithEmoji = {}
        Object.keys(stat).forEach(emotion => {
          emotionStatsWithEmoji[emotion] = {
            count: stat[emotion],
            emoji: this.getEmotionEmoji(emotion)
          }
        })
        
        this.setData({
          trendData: series,
          emotionStats: stat,
          emotionStatsWithEmoji: emotionStatsWithEmoji,
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
    const { trendData } = this.data
    
    console.log('generateChartData 开始执行')
    console.log('trendData:', trendData)
    console.log('trendData.length:', trendData ? trendData.length : 'trendData is null/undefined')
    
    // 检查trendData是否为空
    if (!trendData || trendData.length === 0) {
      console.log('trendData为空，设置chartData为空数组')
      this.setData({ chartData: [] })
      return
    }
    
    // 按日期分组
    const groupedData = {}
    trendData.forEach(entry => {
      if (!groupedData[entry.date]) {
        groupedData[entry.date] = []
      }
      groupedData[entry.date].push(entry)
    })
    
    console.log('groupedData:', groupedData)
    console.log('groupedData keys:', Object.keys(groupedData))
    
    // 计算每日平均情绪强度
    const chartData = Object.keys(groupedData).map(date => {
      const entries = groupedData[date]
      
      console.log(`日期 ${date} 的原始数据:`, entries) // 调试日志
      
      if (entries.length === 0) {
        return {
          date,
          averageIntensity: 0,
          emotionCount: 0,
          dominantEmotion: null
        }
      }
      
      const totalIntensity = entries.reduce((sum, entry) => {
        const intensity = entry.emotionIntensity
        console.log(`情绪强度: ${intensity}, 类型: ${typeof intensity}`) // 调试日志
        return sum + (intensity !== null && intensity !== undefined ? intensity : 0)
      }, 0)
      const averageIntensity = entries.length > 0 ? totalIntensity / entries.length : 0
      
      console.log(`日期 ${date} 计算的平均强度: ${averageIntensity}`) // 调试日志
      
      // 找出主导情绪
      const emotionCount = {}
      entries.forEach(entry => {
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
        emotionCount: entries.length,
        dominantEmotion,
        dominantEmotionEmoji: this.getEmotionEmoji(dominantEmotion)
      }
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
    
    console.log('生成的chartData:', chartData)
    console.log('chartData.length:', chartData.length)
    
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
      endDate: formatDate(today),
      trendAnalysisResult: '', // 重置AI分析结果
      isAnalyzingTrend: false // 重置分析状态
    })
    
    this.loadTrendData()
  },


  // 获取情绪颜色
  getEmotionColor(emotionType) {
    const colorMap = {
      '快乐': '#FFC312', // 鲜黄
      '激动': '#F79F1F', // 亮橙
      '满足': '#EE5A24', // 珊瑚红
      '平静': '#A3CB38', // 橄榄绿
      '疲惫': '#7f8c8d', // 石板灰
      '委屈': '#576574', // 深石板灰
      '焦虑': '#8e44ad', // 紫色
      '悲伤': '#3498db', // 蓝色
      '愤怒': '#c0392b', // 深红
      '其他': '#000000'  // 纯黑
    }
    return colorMap[emotionType] || '#e9ecef'
  },

  // 获取情绪emoji
  getEmotionEmoji(emotionType) {
    const emojiMap = {
      '快乐': '😊',
      '激动': '🤩',
      '满足': '🥰',
      '平静': '😌',
      '疲惫': '😫',
      '委屈': '😔',
      '焦虑': '😟',
      '悲伤': '😢',
      '愤怒': '😠',
      '其他': '🤔'
    }
    return emojiMap[emotionType] || '😐'
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
    console.log('formatDate 输入:', dateStr, typeof dateStr)
    const date = new Date(dateStr)
    console.log('formatDate 解析后的日期:', date)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const result = `${month}月${day}日`
    console.log('formatDate 输出:', result)
    return result
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
  },

  // 切换缩放
  toggleZoom() {
    const isZoomed = !this.data.isZoomed
    
    if (isZoomed) {
      // 切换到横屏模式
      wx.setScreenBrightness({
        value: 0.8
      })
      
      // 保持屏幕常亮
      wx.setKeepScreenOn({
        keepScreenOn: true
      })
    } else {
      // 切换回竖屏模式
      wx.setKeepScreenOn({
        keepScreenOn: false
      })
    }
    
    this.setData({
      isZoomed: isZoomed
    })
  },

  // 计算连接线角度
  calculateLineAngle(startIntensity, endIntensity, widthPercent) {
    const deltaY = (startIntensity - endIntensity) * 10 // 注意：Y轴方向反转，所以deltaY也要反转
    const widthPixels = widthPercent // 宽度百分比
    const angle = Math.atan2(deltaY, widthPixels) * 180 / Math.PI
    return Math.round(angle * 100) / 100 // 保留两位小数
  },

  // 计算连接线长度
  calculateLineLength(startX, startY, endX, endY) {
    const deltaX = endX - startX
    const deltaY = endY - startY
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  },

  // 切换详细数据展开/收起
  toggleDetailExpansion() {
    this.setData({
      showAllDetails: !this.data.showAllDetails
    })
  },

  // 运行AI趋势分析
  async runTrendAnalysis() {
    this.setData({ isAnalyzingTrend: true, trendAnalysisResult: '' });

    // Start showing psychology facts
    const facts = this.data.psychologyFacts;
    this.setData({
      currentFact: facts[Math.floor(Math.random() * facts.length)]
    });

    const factInterval = setInterval(() => {
      this.setData({
        currentFact: facts[Math.floor(Math.random() * facts.length)]
      });
    }, 5000);

    this.setData({ factInterval: factInterval });

    try {
      const { startDate, endDate } = this.data;
      const result = await wx.cloud.callFunction({
        name: 'analyzeEmotionTrend',
        data: {
          startDate,
          endDate
        }
      });

      if (result.result.ok) {
        this.setData({
          trendAnalysisResult: result.result.analysis,
        });
      } else {
        throw new Error(result.result.error || 'AI分析失败');
      }
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none'
      });
    } finally {
      if (this.data.factInterval) {
        clearInterval(this.data.factInterval);
      }
      this.setData({ isAnalyzingTrend: false, factInterval: null, currentFact: '' });
    }
  }
})
