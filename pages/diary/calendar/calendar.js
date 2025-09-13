// pages/diary/calendar/calendar.js
const app = getApp()

Page({
  data: {
    currentDate: '',
    selectedDate: '',
    diaryEntries: [],
    calendarData: {},
    loading: true,
    showMonthPicker: false,
    currentYear: 0,
    currentMonth: 0,
    daysInMonth: [],
    emotionColors: {
      '快乐': '#ffd93d',
      '平静': '#6bcf7f',
      '焦虑': '#ff6b6b',
      '悲伤': '#4dabf7',
      '愤怒': '#ff8cc8',
      '其他': '#9775fa'
    }
  },

  onLoad() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const date = today.getDate()
    
    this.setData({
      currentDate: `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
      selectedDate: `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
      currentYear: year,
      currentMonth: month
    })
    
    this.generateCalendar()
    this.loadDiaryEntries()
  },

  // 生成日历数据
  generateCalendar() {
    const { currentYear, currentMonth } = this.data
    const firstDay = new Date(currentYear, currentMonth - 1, 1)
    const lastDay = new Date(currentYear, currentMonth, 0)
    const daysInMonth = lastDay.getDate()
    const firstDayWeek = firstDay.getDay()
    
    const days = []
    
    // 添加上个月的日期
    const prevMonth = new Date(currentYear, currentMonth - 2, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: `${currentYear}-${String(currentMonth - 1).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`,
        emotionType: null,
        emotionIntensity: null
      })
    }
    
    // 添加当前月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        day: i,
        isCurrentMonth: true,
        date: dateStr,
        emotionType: null,
        emotionIntensity: null
      })
    }
    
    // 添加下个月的日期
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        emotionType: null,
        emotionIntensity: null
      })
    }
    
    this.setData({ daysInMonth: days })
  },

  // 加载日记条目
  async loadDiaryEntries() {
    try {
      this.setData({ loading: true })
      
      const { currentYear, currentMonth } = this.data
      const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`
      
      const result = await wx.cloud.callFunction({
        name: 'getEmotionTrend',
        data: {
          startDate,
          endDate
        }
      })
      
      if (result.result.ok) {
        const { series } = result.result
        const calendarData = {}
        
        series.forEach(entry => {
          calendarData[entry.date] = {
            emotionType: entry.emotionType,
            emotionIntensity: entry.emotionIntensity
          }
        })
        
        // 更新日历数据
        const updatedDays = this.data.daysInMonth.map(day => {
          const entry = calendarData[day.date]
          return {
            ...day,
            emotionType: entry ? entry.emotionType : null,
            emotionIntensity: entry ? entry.emotionIntensity : null
          }
        })
        
        this.setData({
          calendarData,
          daysInMonth: updatedDays,
          loading: false
        })
      } else {
        throw new Error(result.result.error || '加载失败')
      }
    } catch (error) {
      console.error('加载日记失败:', error)
      this.setData({
        loading: false
      })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 选择日期
  selectDate(e) {
    const { date } = e.currentTarget.dataset
    this.setData({ selectedDate: date })
    
    // 跳转到详情页或创建页
    if (this.data.calendarData[date]) {
      // 有日记，跳转到详情页
      wx.navigateTo({
        url: `/pages/diary/detail/detail?date=${date}`
      })
    } else {
      // 没有日记，跳转到创建页
      wx.navigateTo({
        url: `/pages/diary/create/create?date=${date}`
      })
    }
  },

  // 上一月
  prevMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth--
    if (currentMonth < 1) {
      currentMonth = 12
      currentYear--
    }
    
    this.setData({
      currentYear,
      currentMonth
    })
    
    this.generateCalendar()
    this.loadDiaryEntries()
  },

  // 下一月
  nextMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
    
    this.setData({
      currentYear,
      currentMonth
    })
    
    this.generateCalendar()
    this.loadDiaryEntries()
  },

  // 显示月份选择器
  showMonthPicker() {
    this.setData({ showMonthPicker: true })
  },

  // 隐藏月份选择器
  hideMonthPicker() {
    this.setData({ showMonthPicker: false })
  },

  // 选择月份
  selectMonth(e) {
    const { year, month } = e.currentTarget.dataset
    this.setData({
      currentYear: year,
      currentMonth: month,
      showMonthPicker: false
    })
    
    this.generateCalendar()
    this.loadDiaryEntries()
  },

  // 获取情绪颜色
  getEmotionColor(emotionType) {
    return this.data.emotionColors[emotionType] || '#e9ecef'
  },

  // 获取情绪强度样式
  getIntensityStyle(emotionIntensity) {
    if (!emotionIntensity) return ''
    const opacity = Math.max(0.3, emotionIntensity / 10)
    return `opacity: ${opacity}`
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}年${month}月${day}日`
  },

  // 导航函数
  goToCreate() {
    wx.navigateTo({
      url: '/pages/diary/create/create'
    })
  },

  goToTrend() {
    wx.navigateTo({
      url: '/pages/diary/trend/trend'
    })
  },

})
