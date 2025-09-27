// pages/diary/calendar/calendar.js
const app = getApp()

Page({
  data: {
    currentDate: '',
    selectedDate: '',
    diaryEntries: [],
    calendarData: {},
    loading: true,
    showDatePicker: false,
    currentYear: 0,
    currentMonth: 0,
    currentDay: 0,
    daysInMonth: [],
    // 日期选择器相关
    yearList: [],
    monthList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    dayList: [],
    selectedYear: 0,
    selectedMonth: 0,
    selectedDay: 0,
    // 日记列表相关
    showDiaryListModal: false,
    diaryList: [],
    diaryListLoading: false,
    isDeletingAll: false,
    emotionColors: {
      '快乐': '#ffd93d',
      '平静': '#6bcf7f',
      '焦虑': '#ff6b6b',
      '悲伤': '#4dabf7',
      '愤怒': '#ff8cc8',
      '其他': '#9775fa'
    },
    emotionEmojis: {
      '快乐': '😊',
      '平静': '😌',
      '焦虑': '😰',
      '悲伤': '😢',
      '愤怒': '😠',
      '其他': '🤔'
    }
  },

  onLoad() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const date = today.getDate()
    
    // 生成年份列表（从1900年到2100年）
    const yearList = []
    for (let i = 1900; i <= 2100; i++) {
      yearList.push(i)
    }
    
    this.setData({
      currentDate: `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
      selectedDate: `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
      currentYear: year,
      currentMonth: month,
      currentDay: date,
      yearList: yearList,
      selectedYear: year,
      selectedMonth: month,
      selectedDay: date
    })
    
    this.generateDayList(year, month)
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
    
    // 获取今天的日期
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    const days = []
    
    // 添加上个月的日期
    const prevMonth = new Date(currentYear, currentMonth - 2, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i
      const dateStr = `${currentYear}-${String(currentMonth - 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      days.push({
        day: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        date: dateStr,
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
        isToday: dateStr === todayStr,
        date: dateStr,
        emotionType: null,
        emotionIntensity: null
      })
    }
    
    // 添加下个月的日期
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        day: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        date: dateStr,
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
            emotionIntensity: entry.emotionIntensity,
            diaryId: entry._id || entry.id // 确保包含日记ID
          }
        })
        
        // 更新日历数据
        const updatedDays = this.data.daysInMonth.map(day => {
          const entry = calendarData[day.date]
          if (entry) {
            return {
              ...day,
              emotionType: entry.emotionType,
              emotionIntensity: entry.emotionIntensity,
              emotionColor: this.getEmotionColor(entry.emotionType),
              emotionEmoji: this.getEmotionEmoji(entry.emotionType),
              intensityStyle: this.getIntensityStyle(entry.emotionIntensity),
              diaryId: entry.diaryId
            }
          } else {
            return {
              ...day,
              emotionType: null,
              emotionIntensity: null,
              emotionColor: null,
              emotionEmoji: null,
              intensityStyle: null,
              diaryId: null
            }
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

  // 生成日期列表
  generateDayList(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate()
    const dayList = []
    for (let i = 1; i <= daysInMonth; i++) {
      dayList.push(i)
    }
    this.setData({ dayList })
  },

  // 显示日期选择器
  showDatePicker() {
    this.setData({ 
      showDatePicker: true,
      selectedYear: this.data.currentYear,
      selectedMonth: this.data.currentMonth,
      selectedDay: this.data.currentDay
    })
    this.generateDayList(this.data.selectedYear, this.data.selectedMonth)
  },

  // 隐藏日期选择器
  hideDatePicker() {
    this.setData({ showDatePicker: false })
  },

  // 选择年份
  selectYear(e) {
    const year = parseInt(e.detail.value)
    this.setData({ 
      selectedYear: year,
      selectedDay: 1 // 重置日期为1号
    })
    this.generateDayList(year, this.data.selectedMonth)
  },

  // 选择月份
  selectMonth(e) {
    const month = parseInt(e.detail.value) + 1 // picker的索引从0开始
    this.setData({ 
      selectedMonth: month,
      selectedDay: 1 // 重置日期为1号
    })
    this.generateDayList(this.data.selectedYear, month)
  },

  // 选择日期
  selectDay(e) {
    const day = parseInt(e.detail.value) + 1 // picker的索引从0开始
    this.setData({ selectedDay: day })
  },

  // 确认日期选择
  confirmDateSelection() {
    const { selectedYear, selectedMonth, selectedDay } = this.data
    this.setData({
      currentYear: selectedYear,
      currentMonth: selectedMonth,
      currentDay: selectedDay,
      showDatePicker: false
    })
    
    this.generateCalendar()
    this.loadDiaryEntries()
  },

  // 获取情绪颜色
  getEmotionColor(emotionType) {
    return this.data.emotionColors[emotionType] || '#e9ecef'
  },

  // 获取情绪emoji
  getEmotionEmoji(emotionType) {
    return this.data.emotionEmojis[emotionType] || '😐'
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

  // 显示日记列表
  showDiaryList() {
    this.setData({ showDiaryListModal: true })
    this.loadDiaryList()
  },

  // 测试数据库连接和数据
  async testDatabase() {
    try {
      console.log('开始测试数据库连接...')
      
      // 直接查询数据库
      const db = wx.cloud.database()
      const result = await db.collection('DiaryEntries').get()
      
      console.log('数据库查询结果:', result)
      console.log('数据条数:', result.data.length)
      
      if (result.data.length > 0) {
        console.log('第一条数据示例:', result.data[0])
        wx.showModal({
          title: '数据库测试',
          content: `找到 ${result.data.length} 条数据，第一条数据的userId: ${result.data[0].userId}`,
          showCancel: false
        })
      } else {
        wx.showModal({
          title: '数据库测试',
          content: '数据库中没有找到任何日记数据',
          showCancel: false
        })
      }
    } catch (error) {
      console.error('数据库测试失败:', error)
      wx.showModal({
        title: '数据库测试失败',
        content: `错误: ${error.message}`,
        showCancel: false
      })
    }
  },

  // 隐藏日记列表
  hideDiaryList() {
    this.setData({ showDiaryListModal: false })
  },

  // 显示一键删除确认对话框
  showDeleteAllConfirm() {
    const { diaryList } = this.data
    if (diaryList.length === 0) return

    wx.showModal({
      title: '确认清空',
      content: `确定要删除所有 ${diaryList.length} 篇日记吗？此操作不可恢复！`,
      confirmText: '清空',
      confirmColor: '#ff4757',
      success: (res) => {
        if (res.confirm) {
          this.deleteAllDiaries()
        }
      }
    })
  },

  // 一键删除所有日记
  async deleteAllDiaries() {
    const { diaryList } = this.data
    if (diaryList.length === 0) return

    this.setData({ isDeletingAll: true })

    try {
      console.log('开始删除所有日记，数量:', diaryList.length)
      
      // 显示进度提示
      wx.showLoading({
        title: '正在删除...',
        mask: true
      })

      // 批量删除日记
      const deletePromises = diaryList.map(diary => {
        return wx.cloud.callFunction({
          name: 'deleteDiary',
          data: {
            diaryId: diary._id
          }
        }).catch(error => {
          console.error(`删除日记 ${diary._id} 失败:`, error)
          // 如果云函数失败，尝试直接删除
          return wx.cloud.database().collection('DiaryEntries').doc(diary._id).remove()
        })
      })

      // 等待所有删除操作完成
      const results = await Promise.allSettled(deletePromises)
      
      // 统计删除结果
      const successCount = results.filter(result => result.status === 'fulfilled').length
      const failCount = results.filter(result => result.status === 'rejected').length

      wx.hideLoading()

      if (successCount > 0) {
        wx.showToast({
          title: `已删除 ${successCount} 篇日记`,
          icon: 'success',
          duration: 2000
        })

        // 重新加载日记列表
        await this.loadDiaryList()
      }

      if (failCount > 0) {
        wx.showToast({
          title: `${failCount} 篇删除失败`,
          icon: 'none',
          duration: 2000
        })
      }

    } catch (error) {
      console.error('批量删除失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isDeletingAll: false })
    }
  },

  // 加载日记列表
  async loadDiaryList() {
    try {
      this.setData({ diaryListLoading: true })
      
      console.log('开始加载日记列表...')
      const result = await wx.cloud.callFunction({
        name: 'getDiaryEntries',
        data: {
          limit: 50
        }
      })
      
      console.log('日记列表查询结果:', result)
      
      if (result.result.ok) {
        console.log('成功获取日记数据:', result.result.data)
        this.setData({
          diaryList: result.result.data,
          diaryListLoading: false
        })
        
        // 显示加载结果提示
        if (result.result.data.length === 0) {
          wx.showToast({
            title: '暂无日记数据',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: `加载了${result.result.data.length}条日记`,
            icon: 'success'
          })
        }
      } else {
        console.error('云函数返回错误:', result.result.error)
        throw new Error(result.result.error || '加载失败')
      }
    } catch (error) {
      console.error('加载日记列表失败:', error)
      this.setData({
        diaryListLoading: false
      })
      wx.showToast({
        title: `加载失败: ${error.message}`,
        icon: 'none',
        duration: 3000
      })
    }
  },

  // 查看日记详情
  viewDiaryDetail(e) {
    const diaryId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/diary/detail/detail?id=${diaryId}`
    })
  },

  // 格式化时间
  formatTime(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    }
  },

  // 格式化星期几
  formatWeekday(dateStr) {
    const date = new Date(dateStr)
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()]
  },

  // 处理日历日期点击
  onDayClick(e) {
    const { date, emotionType, diaryId } = e.currentTarget.dataset
    
    if (emotionType && diaryId) {
      // 有日记记录，跳转到详情页面
      wx.navigateTo({
        url: `/pages/diary/detail/detail?id=${diaryId}`
      })
    } else {
      // 没有日记记录，提示用户
      wx.showToast({
        title: '这一天还没有日记记录',
        icon: 'none',
        duration: 2000
      })
    }
  },


})
