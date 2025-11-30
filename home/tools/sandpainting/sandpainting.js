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

    // 历史记录
    historyStack: [],

    // 抽屉交互
    drawerBottom: 0,
    touchStartY: 0,
    isDrawerMoving: false,
  },

  lastColor: '#333333', // 保存切换橡皮擦前的颜色

  onReady() {
    this.initCanvas();
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
        this.updateBrush();
      });
  },
  
  saveHistory() {
    if (!this.context) return;
    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.data.historyStack.push(imageData);
  },

  updateBrush() {
    if (!this.context) return;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.lineWidth = this.data.selectedSize;
    this.context.strokeStyle = this.data.isEraser ? this.data.canvasBgColor : this.data.selectedColor;
  },

  startDrawing(e) {
    if (!this.context) return;
    this.saveHistory();
    this.setData({ isDrawing: true });
    const { x, y } = e.touches[0];
    this.lastX = x;
    this.lastY = y;
  },

  onDrawing(e) {
    if (!this.data.isDrawing || !this.context) return;
    const { x, y } = e.touches[0];
    
    this.context.beginPath();
    this.context.moveTo(this.lastX, this.lastY);
    this.context.lineTo(x, y);
    this.context.stroke();
    
    this.lastX = x;
    this.lastY = y;
  },

  stopDrawing() {
    this.setData({ isDrawing: false });
  },

  undo() {
    if (this.data.historyStack.length > 0) {
      const lastState = this.data.historyStack.pop();
      this.context.putImageData(lastState, 0, 0);
    } else {
      wx.showToast({ title: '没有更多记录了', icon: 'none' });
    }
  },

  selectColor(e) {
    const color = e.currentTarget.dataset.color;
    this.lastColor = color;
    this.setData({ selectedColor: color, isEraser: false });
    this.updateBrush();
  },
  
  onColorChange(e) {
    const color = e.detail.color;
    this.lastColor = color;
    this.setData({ selectedColor: color, isEraser: false });
    this.updateBrush();
  },

  selectBrushSize(e) {
    this.setData({ selectedSize: e.detail.value });
    this.updateBrush();
  },

  toggleEraser() {
    const newIsEraser = !this.data.isEraser;
    if (newIsEraser) this.lastColor = this.data.selectedColor;
    this.setData({
      isEraser: newIsEraser,
      selectedColor: newIsEraser ? this.data.canvasBgColor : this.lastColor,
    });
    this.updateBrush();
  },

  clearCanvas(isShowModal = true) {
    const clear = () => {
      if (!this.context) return;
      this.saveHistory();
      this.context.fillStyle = this.data.canvasBgColor;
      this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.data.historyStack = [];
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

  // 新增功能
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

  // 上传作品
  uploadDrawing() {
    wx.showLoading({ title: '正在导出画布...' });
    wx.canvasToTempFilePath({
      canvas: this.canvas,
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
  
  doNothing() {}, // 阻止事件冒泡

  // 抽屉交互逻辑
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
    const touchMoveY = e.touches[0].clientY;
    const deltaY = this.data.touchStartY - touchMoveY; // 上滑为正
    // 限制抽屉移动范围
    if ( (this.data.isDrawerExpanded && deltaY < 0) || (!this.data.isDrawerExpanded && deltaY > 0) ) {
        // 向上拖动展开，向下拖动收起
        // 可以在这里做更精细的跟随移动效果，为简化暂时不做
    }
  },

  drawerTouchEnd(e) {
    if (!this.data.isDrawerMoving) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = this.data.touchStartY - touchEndY;
    const threshold = 50; // 拖动阈值

    if (deltaY > threshold) {
      this.setData({ isDrawerExpanded: true });
    } else if (deltaY < -threshold) {
      this.setData({ isDrawerExpanded: false });
    }
    this.setData({ isDrawerMoving: false });
  },
});
