Component({
  properties: {
    title: {
      type: String,
      value: '默认任务'
    },
    done: {
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal) {
        // 仅在状态真实改变时执行动画，忽略首次加载
        if (this._attached && newVal !== oldVal) {
          if (newVal) {
            this._animateDone();
          } else {
            this._animateUndo();
          }
        }
      }
    }
  },

  data: {
    lineAnimation: {},
    iconAnimation: {}
  },

  lifetimes: {
    attached: function() {
      this._attached = true; // 标记组件已加载
      this._setInitialState(); // 设置初始状态
    }
  },

  methods: {
    _setInitialState() {
      // 使用 duration: 0 的动画来立即设置初始状态
      if (this.data.done) {
        const lineAnimation = wx.createAnimation({ duration: 0 }).width('100%').step();
        const iconAnimation = wx.createAnimation({ duration: 0 }).scale(1).opacity(1).step();
        this.setData({
          lineAnimation: lineAnimation.export(),
          iconAnimation: iconAnimation.export()
        });
      } else {
        const lineAnimation = wx.createAnimation({ duration: 0 }).width('0%').step();
        const iconAnimation = wx.createAnimation({ duration: 0 }).scale(0.3).opacity(0).step();
        this.setData({
          lineAnimation: lineAnimation.export(),
          iconAnimation: iconAnimation.export()
        });
      }
    },

    _animateDone() {
      // 横线展开动画
      const lineAnimation = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out',
      }).width('100%').step();

      // 图标弹性出现动画
      const iconAnimation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease-out',
      }).scale(1.2).opacity(1).step({ duration: 250 }).scale(1).step({ duration: 250 });
      
      this.setData({
        lineAnimation: lineAnimation.export(),
        iconAnimation: iconAnimation.export(),
      });
    },

    _animateUndo() {
      // 横线收回动画
      const lineAnimation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-in',
      }).width('0%').step();

      // 图标消失动画
      const iconAnimation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-in',
      }).scale(0.3).opacity(0).step();
      
      this.setData({
        lineAnimation: lineAnimation.export(),
        iconAnimation: iconAnimation.export(),
      });
    }
  }
});
