// components/waterDropEffect/waterDropEffect.js
Component({
  properties: {
    defaultIcon: {
      type: String,
      value: '/image/tree.png'
    }
  },

  data: {
    visible: false,
    isActive: false, // 控制 'show' class 的添加与移除
    count: 0,
    icon: ''
  },

  methods: {
    play(count = 1, options = {}) {
      const { duration = 1800, icon } = options; // 动画总时长，比 css transition (1s+0.6s) 稍长
      const finalIcon = icon || this.properties.defaultIcon;

      if (this.data.visible) {
        return;
      }

      this.setData({
        visible: true,
        count: count,
        icon: finalIcon
      });

      // 步骤1: 立即让元素可见，但动画还未开始 (因为 'show' class 还没加)
      wx.nextTick(() => {
        // 步骤2: 添加 'show' class，触发 CSS transition 动画
        this.setData({ isActive: true });

        // 步骤3: 在动画快结束时移除 'show' class，触发返回动画 (淡出)
        setTimeout(() => {
          this.setData({ isActive: false });
        }, duration - 600); // 配合新的 opacity 时长

        // 步骤4: 在整个动画周期结束后，彻底隐藏元素
        setTimeout(() => {
          this.setData({ visible: false });
        }, duration);
      });
    }
  }
})
