// 全局 chart 实例
let chart = null;

// ---------------- 图表配置 ----------------
function getChartOption(data, title) {
  const colors =
    title === '消极情绪详情'
      ? ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'] // 消极情绪详情的颜色
      : title === '积极情绪详情'
      ? ['#409eff', '#e6a23c', '#90ee7e'] // 积极情绪详情的颜色
      : title === '中性情绪详情'
      ? ['#bda29a', '#6e7074'] // 中性情绪详情的颜色
      : ['#409eff', '#e6a23c', '#f56c6c']; // 总体情绪分布的颜色

  return {
    title: {
      text: title,
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 人 ({d}%)'
    },
    legend: {
      bottom: 10,
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['30%', '65%'],
        center: ['50%', '55%'],
        roseType: 'area',
        label: {
          formatter: '{b}\n{c}人 ({d}%)'
        },
        data: data.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index % colors.length]
          }
        }))
      }
    ]
  };
}

// ---------------- 页面逻辑 ----------------
Page({
  data: {
    ec: {
      lazyLoad: true
    },
    activeRange: '7days', // 默认选择最近7天
    isDrilledDown: false,
    summary: {},
    emotionData: { // 用于存储从云函数获取的原始情绪数据
      mainData: [],
      positiveDetailData: [],
      neutralDetailData: [],
      negativeDetailData: []
    }
  },

  /**
   * ⚠️ 一定要在 onReady
   */
  onReady() {
    this.ecComponent = this.selectComponent('.ec-canvas');
    console.log('调试信息：onReady中this.ecComponent的值：', this.ecComponent);

    if (!this.ecComponent) {
      console.log('调试信息：ec-canvas 组件查找失败');
      console.error('❌ ec-canvas 组件未找到');
      return;
    }
    this.onRangeChange({ currentTarget: { dataset: { range: this.data.activeRange } } });
  },

  /**
   * 初始化图表
   */
  initChart(data, title) {
    this.ecComponent.init((canvas, width, height, dpr) => {
      // ⚠️ 关键：同分包路径
      console.log('调试信息：初始化图表，数据：', data, '标题：', title);
      const echarts = require('../ec-canvas/echarts');

      chart = echarts.init(canvas, null, { 
        width, 
        height, 
        devicePixelRatio: dpr 
      });

      // 必须绑定
      canvas.setChart(chart);

      chart.setOption(getChartOption(data, title));

      // 点击下钻
      chart.off('click'); // 先移除旧的事件监听，防止重复绑定
      chart.on('click', (params) => {
        if (this.data.isDrilledDown) return;
        this.drillDown(params.name);
      });

      return chart;
    });
  },

  /**
   * 根据时间范围获取情绪数据并更新图表
   */
  async fetchEmotionData(days) {
    console.log('调试信息：开始获取情绪数据，天数：', days);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const formatToISOString = (date) => {
      return date.toISOString().split('T')[0];
    };

    const start = formatToISOString(startDate);
    const end = formatToISOString(endDate);
    console.log('调试信息：查询情绪数据日期范围：', start, '到', end);

    wx.cloud.callFunction({
      name: 'getEmotionTrend',
      data: {
        startDate: start,
        endDate: end,
        scope:'global'
      },
      success: res => {
        console.log('云函数返回数据：', res);
        if (res.result.ok) {
          const { series } = res.result;

          // 定义情绪强度到主情绪类型的映射
          const emotionIntensityToMainTypeMap = {
            '快乐': '积极',
            '激动': '积极',
            '满足': '积极',
            '平静': '中性',
            '其他': '中性',
            '疲惫': '消极',
            '委屈': '消极',
            '焦虑': '消极',
            '悲伤': '消极',
            '愤怒': '消极'
          };

          const mainEmotionMap = {};
          const positiveDetailMap = {};
          const neutralDetailMap = {};
          const negativeDetailMap = {};

          series.forEach(item => {
            const detailedEmotionName = item.emotionType; // 实际的详细情绪名称，如"平静", "焦虑"
            const mainEmotionCategory = emotionIntensityToMainTypeMap[detailedEmotionName];

            if (mainEmotionCategory) {
              // 统计主情绪
              mainEmotionMap[mainEmotionCategory] = (mainEmotionMap[mainEmotionCategory] || 0) + 1;

              // 统计下钻情绪
              if (mainEmotionCategory === '积极') {
                positiveDetailMap[detailedEmotionName] = (positiveDetailMap[detailedEmotionName] || 0) + 1;
              } else if (mainEmotionCategory === '中性') {
                neutralDetailMap[detailedEmotionName] = (neutralDetailMap[detailedEmotionName] || 0) + 1;
              } else if (mainEmotionCategory === '消极') {
                negativeDetailMap[detailedEmotionName] = (negativeDetailMap[detailedEmotionName] || 0) + 1;
              }
            } else {
                console.warn(`调试信息：未知的详细情绪名称：${detailedEmotionName}`);
            }
          });

          const mainData = Object.keys(mainEmotionMap).map(key => ({ name: key, value: mainEmotionMap[key] }));
          const positiveDetailData = Object.keys(positiveDetailMap).map(key => ({ name: key, value: positiveDetailMap[key] }));
          const neutralDetailData = Object.keys(neutralDetailMap).map(key => ({ name: key, value: neutralDetailMap[key] }));
          const negativeDetailData = Object.keys(negativeDetailMap).map(key => ({ name: key, value: negativeDetailMap[key] }));

          this.setData({
            emotionData: {
              mainData,
              positiveDetailData,
              neutralDetailData,
              negativeDetailData
            }
          }, () => {
            console.log('调试信息：处理后的情绪数据：', this.data.emotionData);
            this.initChart(mainData, '总体情绪分布'); // 首次渲染只显示总体情绪分布
            this.calculateSummary(mainData, '总体情绪分布');
          });
        } else {
          console.error('获取情绪数据失败：', res.result.error);
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('调用云函数失败：', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 下钻
   */
  drillDown(emotionType) {
    let detailData = [];
    let title = '';

    if (emotionType === '消极') {
      detailData = this.data.emotionData.negativeDetailData;
      title = '消极情绪详情';
    } else if (emotionType === '积极') {
      detailData = this.data.emotionData.positiveDetailData;
      title = '积极情绪详情';
    } else if (emotionType === '中性') {
      detailData = this.data.emotionData.neutralDetailData;
      title = '中性情绪详情';
    } else {
      wx.showToast({
        title: '暂无详细数据或无法下钻',
        icon: 'none'
      });
      return;
    }

    if (detailData.length > 0) {
      chart.setOption(getChartOption(detailData, title), true);
      this.setData({ isDrilledDown: true });
      this.calculateSummary(detailData, title);
    } else {
      wx.showToast({
        title: '暂无详细数据',
        icon: 'none'
      });
    }
  },

  /**
   * 返回上一级
   */
  onDrillBack() {
    const { mainData } = this.data.emotionData;
    chart.setOption(getChartOption(mainData, '总体情绪分布'), true);
    this.setData({ isDrilledDown: false });
    this.calculateSummary(mainData, '总体情绪分布');
  },

  /**
   * 时间范围切换
   */
  onRangeChange(e) {
    const { range } = e.currentTarget.dataset;
    let days = 0;
    if (range === '7days') {
      days = 7;
    } else if (range === '30days') {
      days = 30;
    } else if (range === '90days') {
      days = 90;
    }
    this.setData({ activeRange: range, isDrilledDown: false });
    this.fetchEmotionData(days);
  },

  /**
   * 计算摘要
   */
  calculateSummary(data, title) {
    const total = data.reduce((sum, i) => sum + i.value, 0);
    const majorEmotion = data.length > 0 ? data.reduce((a, b) => (b.value > a.value ? b : a)).name : '无';

    let suggestion = '';

    if (title === '总体情绪分布') {
      if (majorEmotion === '积极') suggestion = '整体情绪良好，请继续保持。';
      else if (majorEmotion === '中性') suggestion = '情绪较平稳，可适度放松。';
      else if (majorEmotion === '消极') suggestion = '消极情绪偏多，建议关注心理状态。';
      else suggestion = '暂无情绪数据。';
    } else {
      suggestion = `当前 "${majorEmotion}" 情绪占比较高，请重点关注。`;
    }

    this.setData({
      summary: {
        title,
        total,
        majorEmotion,
        suggestion
      }
    });
  }
});
