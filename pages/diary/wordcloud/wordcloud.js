import * as echarts from '../../ec-canvas/echarts';

// 全局变量，用于存储图表实例
let chart = null;

function initChart(canvas, width, height, dpr, data) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b} : {c}'
    },
    series: [{
      type: 'wordCloud',
      gridSize: 2,
      sizeRange: [12, 50],
      rotationRange: [-90, 90],
      shape: 'pentagon',
      width: '95%',
      height: '95%',
      drawOutOfBound: false,
      textStyle: {
        color: function () {
          return 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160)
          ].join(',') + ')';
        }
      },
      emphasis: {
        textStyle: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: data
    }]
  };

  chart.setOption(option);
  return chart;
}

Page({
  data: {
    ec: {
      onInit: null
    },
    activeTab: 'personal', // 'personal' or 'global'
    loading: true,
    error: null,
    wordData: [],
    days: 30 // 默认时间范围
  },

  onLoad(options) {
    this.setData({
      ec: {
        onInit: this.initChartWithData
      }
    });
    this.fetchWordCloudData();
  },

  initChartWithData(canvas, width, height, dpr) {
    return initChart(canvas, width, height, dpr, this.data.wordData);
  },

  async fetchWordCloudData() {
    this.setData({ loading: true, error: null });
    try {
      const result = await wx.cloud.callFunction({
        name: 'getWordCloudData',
        data: {
          scope: this.data.activeTab,
          days: this.data.days
        }
      });

      if (result.result.ok) {
        this.setData({
          wordData: result.result.data,
          loading: false
        });
        if (chart) {
          // 如果图表已初始化，则更新数据
          chart.setOption({
            series: [{
              data: result.result.data
            }]
          });
        }
      } else {
        throw new Error(result.result.error || '加载失败');
      }
    } catch (e) {
      this.setData({
        loading: false,
        error: e.message
      });
    }
  },

  onTabChange(event) {
    this.setData({
      activeTab: event.detail.name
    });
    this.fetchWordCloudData();
  },

  onDaysChange(event) {
    this.setData({
      days: parseInt(event.detail.value)
    });
    this.fetchWordCloudData();
  }
});
