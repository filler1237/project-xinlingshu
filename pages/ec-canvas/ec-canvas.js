import WxCanvas from './wx-canvas';
import * as echarts from './echarts';

let ctx;

Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },
    ec: {
      type: Object
    },
    forceUseOldCanvas: {
      type: Boolean,
      value: false
    }
  },

  data: {
    isUseNewCanvas: false
  },

  ready: function () {
    if (!this.data.ec) {
      console.warn('组件需绑定 ec 变量，例：<ec-canvas id="mychart-dom-bar" '
        + 'canvas-id="mychart-bar" ec="{{ ec }}"></ec-canvas>');
      return;
    }

    if (!this.data.ec.lazyLoad) {
      this.init();
    }
  },

  methods: {
    init: function (callback) {
      const version = wx.version.version.split('.').map(n => parseInt(n, 10));
      const isOldVersion = version[0] * 10000 + version[1] * 100 + version[2] < 20700;
      const useOldCanvas = this.data.forceUseOldCanvas || isOldVersion;
      this.setData({ isUseNewCanvas: !useOldCanvas });

      if (useOldCanvas) {
        this.initOld(callback);
      } else {
        this.initNew(callback);
      }
    },

    initOld: function (callback) {
      ctx = wx.createCanvasContext(this.data.canvasId, this);
      const canvas = new WxCanvas(ctx, this.data.canvasId, false);

      echarts.setCanvasCreator(() => canvas);
      const query = wx.createSelectorQuery().in(this);
      query.select('.ec-canvas').boundingClientRect(res => {
        if (typeof callback === 'function') {
          this.chart = callback(canvas, res.width, res.height);
        }
        else if (this.data.ec && typeof this.data.ec.onInit === 'function') {
          this.chart = this.data.ec.onInit(canvas, res.width, res.height);
        }
      }).exec();
    },

    initNew: function (callback) {
      const query = wx.createSelectorQuery().in(this);
      query.select(`#${this.data.canvasId}`)
        .fields({ node: true, size: true })
        .exec(res => {
          const { node, width, height } = res[0];
          const canvas = node;
          const dpr = wx.getSystemInfoSync().pixelRatio;
          canvas.width = width * dpr;
          canvas.height = height * dpr;

          const ctx = canvas.getContext('2d');
          ctx.scale(dpr, dpr);

          const canvasProxy = new WxCanvas(ctx, this.data.canvasId, true, node);
          echarts.setCanvasCreator(() => canvasProxy);

          if (typeof callback === 'function') {
            this.chart = callback(canvasProxy, width, height, dpr);
          } else if (this.data.ec && typeof this.data.ec.onInit === 'function') {
            this.chart = this.data.ec.onInit(canvasProxy, width, height, dpr);
          }
        });
    },

    canvasToTempFilePath(opt) {
      if (this.data.isUseNewCanvas) {
        const query = wx.createSelectorQuery().in(this);
        query.select(`#${this.data.canvasId}`)
          .fields({ node: true, size: true })
          .exec(res => {
            const canvasNode = res[0].node;
            opt.canvas = canvasNode;
            wx.canvasToTempFilePath(opt, this);
          });
      } else {
        wx.canvasToTempFilePath(opt, this);
      }
    },

    touchStart(e) {
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        var handler = this.chart.getZr().handler;
        handler.dispatch('mousedown', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
      }
    },

    touchMove(e) {
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        var handler = this.chart.getZr().handler;
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
      }
    },

    touchEnd(e) {
      if (this.chart) {
        const touch = e.changedTouches ? e.changedTouches[0] : {};
        var handler = this.chart.getZr().handler;
        handler.dispatch('mouseup', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.dispatch('click', {
          zrX: touch.x,
          zrY: touch.y
        });
      }
    }
  }
});
