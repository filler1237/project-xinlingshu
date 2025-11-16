// home/tools/sandpainting/sandpainting.js
Page({
  data: {
    canvasWidth: 0,
    canvasHeight: 0,
    colors: ['#333333', '#FF0000', '#FF6B35', '#F7931E', '#FDB813', '#8DC63F', '#39B54A', '#00A651', '#00ADEE', '#29ABE2', '#5E3D99', '#92278F', '#C12283', '#ED1C24', '#FFFFFF'],
    selectedColor: '#333333',
    brushSizes: [5, 10, 15, 20, 25],
    selectedSize: 15,
    isDrawing: false,
    lastX: 0,
    lastY: 0
  },
  
  // 初始化状态
  isInitComplete: false,
  initCallbacks: [],
  pendingTouchEvent: null,

  /**
   * 生命周期函数--监听页面加载
   */
onLoad(options) {
    // 初始化画布尺寸，考虑自定义导航栏高度
    const systemInfo = wx.getSystemInfoSync();
    const isAndroid = systemInfo.platform === 'android';
    
    // 导航栏高度：状态栏高度 + (Android 48px / iOS 44px)
    const navBarHeight = systemInfo.statusBarHeight + (isAndroid ? 48 : 44);
    
    // 控制面板高度大约是150rpx
    const controlPanelHeight = 150 / 2; // 转换为px
    
    // 其他padding：20rpx（canvas-container的padding）* 2
    const padding = (20 / 2) * 2;
    
    const canvasWidth = systemInfo.windowWidth - padding;
    const canvasHeight = systemInfo.windowHeight - navBarHeight - controlPanelHeight - padding;
    
    this.setData({
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight
    });
  },

  /**
   * 开始绘制
   */
  startDrawing: function(e) {
    console.log('startDrawing called:', e.touches[0]);
    // 如果canvas上下文或位置信息未初始化，先初始化并保存事件
    if (!this.isInitComplete || !this.context || !this.canvasRect) {
      console.log('Canvas not initialized, saving event...');
      this.pendingTouchEvent = e;
      this.initCanvas();
      return;
    }
    
    // 使用clientX/clientY更可靠
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const offsetX = touchX - this.canvasRect.left;
    const offsetY = touchY - this.canvasRect.top;
    
    this.setData({
      isDrawing: true,
      lastX: offsetX,
      lastY: offsetY
    });
    console.log('Drawing started at:', offsetX, offsetY);
  },

  /**
   * 绘制中
   */
  onDrawing: function(e) {
    console.log('onDrawing called:', e.touches[0]);
    // 如果canvas上下文或位置信息未初始化，先初始化
    if (!this.context || !this.canvasRect) {
      console.log('Canvas not initialized, initializing now...');
      this.initCanvas();
      return;
    }
    
    if (!this.data.isDrawing) return;

    // 使用clientX/clientY更可靠
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const currentX = touchX - this.canvasRect.left;
    const currentY = touchY - this.canvasRect.top;

    // 绘制线条
    try {
      this.context.beginPath();
      this.context.moveTo(this.data.lastX, this.data.lastY);
      this.context.lineTo(currentX, currentY);
      this.context.stroke();
      console.log('Line drawn from', this.data.lastX, this.data.lastY, 'to', currentX, currentY);
    } catch (error) {
      console.error('Error drawing line:', error);
    }

    // 更新最后位置
    this.setData({
      lastX: currentX,
      lastY: currentY
    });
  },

  /**
   * 停止绘制
   */
  stopDrawing: function(e) {
    this.setData({
      isDrawing: false
    });
  },

  /**
   * 选择颜色
   */
  selectColor: function(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      selectedColor: color
    });
    this.context.strokeStyle = color;
  },

  /**
   * 选择画笔粗细
   */
  selectBrushSize: function(e) {
    const size = parseInt(e.currentTarget.dataset.size);
    this.setData({
      selectedSize: size
    });
    this.context.lineWidth = size;
  },

  /**
   * 清空画布
   */
  clearCanvas: function() {
    const that = this;
    wx.showModal({
      title: '提示',
      content: '确定要清空画布吗？',
      success: function(res) {
        if (res.confirm && that.context) {
          that.context.clearRect(0, 0, that.context.canvas.width, that.context.canvas.height);
        }
      }
    });
  },

  /**
   * 返回上一级
   */
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 初始化画布
   */
  initCanvas: function(callback = null, attempt = 0) {
    console.log('Initializing canvas, attempt:', attempt);
    // 如果已经初始化则调用回调并返回
    if (this.isInitComplete && this.context && this.canvasRect) {
      console.log('Canvas already initialized');
      if (callback) callback();
      return;
    }
    
    // 添加回调到队列
    if (callback) {
      this.initCallbacks.push(callback);
    }
    
    // 使用页面内选择器查询更可靠
    this.createSelectorQuery()
      .select('#sandCanvas')
      .boundingClientRect()
      .exec((rectRes) => {
        console.log('Bounding client rect result:', rectRes);
        if (rectRes && rectRes[0]) {
          this.canvasRect = rectRes[0];
          console.log('CanvasRect set:', this.canvasRect);
          
          this.createSelectorQuery()
            .select('#sandCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
              console.log('Canvas fields result:', res);
              if (res && res[0]) {
                const canvas = res[0].node;
                // 设置画布实际尺寸
                canvas.width = res[0].width;
                canvas.height = res[0].height;
                this.context = canvas.getContext('2d');
                
                // 设置画布属性
                this.context.lineCap = 'round';
                this.context.lineJoin = 'round';
                this.context.lineWidth = this.data.selectedSize;
                this.context.strokeStyle = this.data.selectedColor;
                console.log('Canvas context initialized:', this.context);
                
                // 标记初始化完成并执行所有回调
                this.isInitComplete = true;
                this.initCallbacks.forEach(cb => cb());
                this.initCallbacks = [];
                
                // 如果有 pending 的触摸事件，处理它
                if (this.pendingTouchEvent) {
                  console.log('Processing pending touch event:', this.pendingTouchEvent);
                  const event = this.pendingTouchEvent;
                  this.pendingTouchEvent = null;
                  
                  // 根据事件类型调用相应的处理函数
                  if (event.type === 'touchstart') {
                    this.startDrawing(event);
                  } else if (event.type === 'touchmove') {
                    this.onDrawing(event);
                  }
                }
              } else {
                console.log('Failed to get canvas node or size, retrying...');
                // 重试初始化
                this.retryInitCanvas(callback, attempt + 1);
              }
            });
        } else {
          console.log('Failed to get canvas bounding rect, retrying...');
          // 重试初始化
          this.retryInitCanvas(callback, attempt + 1);
        }
      });
  },
  
  /**
   * 重试初始化画布
   */
  retryInitCanvas: function(callback = null, attempt = 0) {
    // 最多重试5次
    const maxAttempts = 5;
    if (attempt < maxAttempts) {
      setTimeout(() => {
        this.initCanvas(callback, attempt + 1);
      }, 100);
    } else {
      console.log('Failed to initialize canvas after max attempts');
      // 初始化失败，清空回调
      this.initCallbacks = [];
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.initCanvas();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
});