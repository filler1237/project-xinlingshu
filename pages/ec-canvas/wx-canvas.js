export default class WxCanvas {
  constructor(ctx, canvasId, isNew, canvasNode) {
    this.ctx = ctx;
    this.canvasId = canvasId;
    this.isNew = isNew;
    if (isNew) {
      this.canvasNode = canvasNode;
    } else {
      this._initStyle(ctx);
    }
  }

  getContext(contextType) {
    if (contextType === '2d') {
      return this.ctx;
    }
  }

  setChart(chart) {
    this.chart = chart;
  }

  attachEvent() {}

  detachEvent() {}

  _initStyle(ctx) {
    var styles = ['fillStyle', 'strokeStyle', 'globalAlpha',
      'textAlign', 'textBaseAlign', 'shadow', 'lineWidth',
      'lineCap', 'lineJoin', 'lineDash', 'miterLimit',
      'fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'fontVariant'
    ];

    styles.forEach(style => {
      Object.defineProperty(ctx, style, {
        set: value => {
          if (style !== 'fillStyle' && style !== 'strokeStyle'
            || value !== 'none' && value !== null
          ) {
            ctx['set' + style.charAt(0).toUpperCase() + style.slice(1)](value);
          }
        }
      });
    });

    ctx.createRadialGradient = () => {
      return ctx.createCircularGradient(arguments);
    };
  }
}
