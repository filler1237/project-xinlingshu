import * as echarts from '../../components/ec-canvas/echarts';

let chart = null; // 将 chart 提升为全局变量，方便在页面方法中调用

// --- 模拟数据 ---
const mainData = [
  { name: '积极', value: 306 },
  { name: '中性', value: 452 },
  { name: '消极', value: 259 }
];

const positiveDetailData = [
  { name: '快乐', value: 128 },
  { name: '激动', value: 89 },
  { name: '满足', value: 89 }
];

const neutralDetailData = [
  { name: '平静', value: 235 },
  { name: '其他', value: 217 }
];

const negativeDetailData = [
  { name: '疲惫', value: 49 },
  { name: '委屈', value: 67 },
  { name: '焦虑', value: 82 },
  { name: '悲伤', value: 36 },
  { name: '愤怒', value: 25 }
];

// --- 图表配置生成函数 ---
function getChartOption(data, title) {
  const colors = title === '消极情绪详情'
    ? ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'] // 为详情页提供不同颜色
    : ['#409eff', '#e6a23c', '#f56c6c'];

  const option = {
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
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      show: true,
      bottom: 10,
      left: 'center',
      icon: 'circle',
    },
    series: [{
      name: '心情数据',
      type: 'pie',
      radius: ['30%', '65%'],
      center: ['50%', '55%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{c}人 ({d}%)',
        fontSize: 12,
      },
      labelLine: {
        length: 10,
        length2: 15,
      },
      data: data.map((item, index) => ({
        ...item,
        itemStyle: {
          color: colors[index % colors.length]
        }
      }))
    }]
  };
  return option;
}

// --- 页面逻辑 ---
Page({
  data: {
    ec: {
      lazyLoad: true // 开启懒加载
    },
    currentDate: new Date().toISOString().split('T')[0],
    isDrilledDown: false,
    summary: {}
  },

  onLoad() {
    this.ecComponent = this.selectComponent('#mychart-dom-pie');
    this.initChart(mainData, '总体情绪分布');
    this.calculateSummary(mainData, '总体情绪分布');
  },

  // 初始化图表
  initChart(data, title) {
    this.ecComponent.init((canvas, width, height, dpr) => {
      chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      const option = getChartOption(data, title);
      chart.setOption(option);

      // 绑定点击事件
      chart.on('click', (params) => {
        if (!this.data.isDrilledDown) {
          if (params.name === '消极') {
            this.drillDown('negative');
          } else if (params.name === '积极') {
            this.drillDown('positive');
          } else if (params.name === '中性') {
            this.drillDown('neutral');
          }
        }
      });

      return chart;
    });
  },

  // 下钻到情绪详情
  drillDown(type) {
    let detailData, detailTitle;
    
    if (type === 'negative') {
      detailData = negativeDetailData;
      detailTitle = '消极情绪详情';
    } else if (type === 'positive') {
      detailData = positiveDetailData;
      detailTitle = '积极情绪详情';
    } else if (type === 'neutral') {
      detailData = neutralDetailData;
      detailTitle = '中性情绪详情';
    }
    
    const option = getChartOption(detailData, detailTitle);
    chart.setOption(option, true); // true 表示不合并，直接替换
    this.setData({ isDrilledDown: true });
    this.calculateSummary(detailData, detailTitle);
  },

  // 返回上一级
  onDrillBack() {
    const option = getChartOption(mainData, '总体情绪分布');
    chart.setOption(option, true);
    this.setData({ isDrilledDown: false });
    this.calculateSummary(mainData, '总体情绪分布');
  },

  // 日期选择变化
  onDateChange(e) {
    this.setData({
      currentDate: e.detail.value
    });
    // 这里可以加入根据日期获取新数据的逻辑
    // 为演示，我们重置为初始状态
    this.onDrillBack(); 
  },

  // 返回页面
  onBackTap() {
    wx.navigateBack();
  },

  // 计算摘要信息
  calculateSummary(data, title) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const majorEmotion = data.reduce((max, item) => (item.value > max.value ? item : max), data[0]).name;
    let suggestion = '';

    if (title === '总体情绪分布') {
      if (majorEmotion === '积极') {
        suggestion = '整体情绪状态良好，请继续保持积极心态。';
      } else if (majorEmotion === '中性') {
        suggestion = '情绪状态平稳，可适当增加放松活动。';
      } else {
        suggestion = '近期消极情绪占比较高，建议关注情绪变化。';
      }
    } else if (title === '消极情绪详情') {
      suggestion = `在消极情绪中，"${majorEmotion}" 表现最为突出，请重点关注。`;
    } else if (title === '积极情绪详情') {
      suggestion = `在积极情绪中，"${majorEmotion}" 表现最为突出，这是一个很好的现象。`;
    } else if (title === '中性情绪详情') {
      suggestion = `在中性情绪中，"${majorEmotion}" 表现最为突出，情绪状态相对稳定。`;
    }

    this.setData({
      summary: {
        title: title,
        total,
        majorEmotion,
        suggestion
      }
    });
  }
});
