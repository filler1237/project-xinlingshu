// home/tools/sandpainting/sandpainting.js
Page({
  data: {
    // 颜色和画笔
    colors: ['#333333', '#FF0000', '#FF6B35', '#F7931E', '#FDB813', '#8DC63F', '#39B54A', '#00A651', '#00ADEE', '#29ABE2', '#5E3D99', '#92278F', '#C12283', '#ED1C24', '#FFFFFF'],
    selectedColor: '#333333',
    selectedSize: 15,
    isEraser: false,
    canvasBgColor: '#FFFFFF',

    // 状态
    isDrawing: false,
    showColorPicker: false,
    showActivity: false,
    isDrawerExpanded: false,

    // 抽屉交互
    drawerBottom: 0,
    touchStartY: 0,
    isDrawerMoving: false,
  },

  historyStack: [], // 保存笔画路径
  currentStroke: null, // 当前正在绘制的笔画
  lastColor: '#333333', // 保存切换橡皮擦前的颜色

  onReady() {
    setTimeout(() => {
      this.initCanvas();
    }, 100);
    const query = wx.createSelectorQuery();
    query.select('#canvas-wrapper').boundingClientRect(rect => {
      const canvasQuery = wx.createSelectorQuery().select('#sandCanvas').node();
      canvasQuery.exec(res => {
        const canvasNode = res[0].node;
        const ctx = canvasNode.getContext('2d');
        canvasNode.width = rect.width - 40;
        canvasNode.height = rect.height - 40;
      });
    }).exec();
  },

  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#sandCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) {
          console.error("无法获取Canvas节点");
          return;
        }
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;

        this.canvasWidth = res[0].width;
        this.canvasHeight = res[0].height;

        canvas.width = this.canvasWidth * dpr;
        canvas.height = this.canvasHeight * dpr;
        ctx.scale(dpr, dpr);

        this.canvas = canvas;
        this.context = ctx;

        this.clearCanvas(false);
      });
  },

  // 重绘整个画布
  redrawCanvas() {
    if (!this.context) return;
    // 1. 清空画布
    this.context.fillStyle = this.data.canvasBgColor;
    this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 2. 遍历历史记录并重绘每一笔
    this.historyStack.forEach(stroke => {
      if (stroke.points.length < 2) return;

      this.context.beginPath();
      this.context.strokeStyle = stroke.color;
      this.context.lineWidth = stroke.size;
      this.context.lineCap = 'round';
      this.context.lineJoin = 'round';

      this.context.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        this.context.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      this.context.stroke();
    });
  },

  startDrawing(e) {
    if (!this.context) return;
    this.setData({ isDrawing: true });

    // 创建一个新的笔画对象
    this.currentStroke = {
      color: this.data.isEraser ? this.data.canvasBgColor : this.data.selectedColor,
      size: this.data.selectedSize,
      points: [e.touches[0]]
    };
  },

  onDrawing(e) {
    if (!this.data.isDrawing || !this.context || !this.currentStroke) return;

    const { x, y } = e.touches[0];
    this.currentStroke.points.push({ x, y });

    // 实时绘制当前笔画
    if (this.currentStroke.points.length < 2) return;

    const points = this.currentStroke.points;
    const lastPoint = points[points.length - 2];

    this.context.beginPath();
    this.context.strokeStyle = this.currentStroke.color;
    this.context.lineWidth = this.currentStroke.size;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';

    this.context.moveTo(lastPoint.x, lastPoint.y);
    this.context.lineTo(x, y);
    this.context.stroke();
  },

  stopDrawing() {
    if (this.currentStroke && this.currentStroke.points.length > 1) {
      this.historyStack.push(this.currentStroke);
    }
    this.currentStroke = null;
    this.setData({ isDrawing: false });
  },

  undo() {
    if (this.historyStack.length > 0) {
      this.historyStack.pop();
      this.redrawCanvas();
    } else {
      wx.showToast({ title: '没有更多记录了', icon: 'none' });
    }
  },

  selectColor(e) {
    const color = e.currentTarget.dataset.color;
    this.lastColor = color;
    this.setData({ selectedColor: color, isEraser: false });
  },

  onColorChange(e) {
    const color = e.detail.color;
    this.lastColor = color;
    this.setData({ selectedColor: color, isEraser: false });
  },

  selectBrushSize(e) {
    this.setData({ selectedSize: e.detail.value });
  },

  toggleEraser() {
    const newIsEraser = !this.data.isEraser;
    if (newIsEraser) this.lastColor = this.data.selectedColor;
    this.setData({
      isEraser: newIsEraser,
      selectedColor: newIsEraser ? this.data.canvasBgColor : this.lastColor,
    });
  },

  clearCanvas(isShowModal = true) {
    const clear = () => {
      if (!this.context) return;
      this.historyStack = [];
      this.redrawCanvas();
    };

    if (isShowModal) {
      wx.showModal({
        title: '提示',
        content: '确定要清空画布吗？',
        success: (res) => res.confirm && clear(),
      });
    } else {
      clear();
    }
  },

  saveCanvas() {
    wx.canvasToTempFilePath({
      canvas: this.canvas,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
          fail: (err) => {
            if (err.errMsg.includes('auth deny')) {
              wx.showModal({
                title: '授权失败',
                content: '请开启保存到相册的权限',
                confirmText: '去设置',
                success: (modalRes) => modalRes.confirm && wx.openSetting(),
              });
            } else {
              wx.showToast({ title: '保存失败', icon: 'none' });
            }
          },
        });
      },
      fail: () => wx.showToast({ title: '导出失败', icon: 'none' }),
    }, this);
  },

  uploadDrawing() {
    wx.showLoading({ title: '正在导出画布...' });
    wx.canvasToTempFilePath({
      canvas: this.canvas,
      fileType: 'jpg', // 使用 JPG 格式以减小积
      quality: 0.8,    // 压缩质量
      success: (res) => {
        wx.hideLoading();
        const tempFilePath = encodeURIComponent(res.tempFilePath);
        wx.navigateTo({
          url: `/home/tools/publish-drawing/publish-drawing?tempFilePath=${tempFilePath}`
        });
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '导出画布失败', icon: 'none' });
        console.error("导出画布失败:", err);
      }
    }, this);
  },

  showActivityPopup() {
    this.setData({ showActivity: true });
  },

  hideActivityPopup() {
    this.setData({ showActivity: false });
  },

  toggleColorPicker() {
    this.setData({ showColorPicker: !this.data.showColorPicker });
  },

  doNothing() { },

  toggleDrawer() {
    this.setData({ isDrawerExpanded: !this.data.isDrawerExpanded });
  },

  drawerTouchStart(e) {
    this.setData({
      touchStartY: e.touches[0].clientY,
      isDrawerMoving: true,
    });
  },

  drawerTouchMove(e) {
    if (!this.data.isDrawerMoving) return;
  },

  drawerTouchEnd(e) {
    if (!this.data.isDrawerMoving) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = this.data.touchStartY - touchEndY;
    const threshold = 50;

    if (deltaY > threshold) {
      this.setData({ isDrawerExpanded: true });
    } else if (deltaY < -threshold) {
      this.setData({ isDrawerExpanded: false });
    }
    this.setData({ isDrawerMoving: false });
  },
});
