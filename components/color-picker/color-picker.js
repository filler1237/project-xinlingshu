// components/color-picker/color-picker.js
Component({
  properties: {
    initialColor: {
      type: String,
      value: '#000000',
    },
  },
  data: {
    r: 0,
    g: 0,
    b: 0,
    show: false,
  },
  lifetimes: {
    attached() {
      this.updateColor(this.properties.initialColor);
    },
  },
  methods: {
    show() {
      this.updateColor(this.properties.initialColor);
      this.setData({ show: true });
    },

    hide() {
      this.setData({ show: false });
    },

    updateColor(hex) {
      if (hex.startsWith('#')) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        this.setData({ r, g, b });
      }
    },

    onSliderChange(e) {
      const channel = e.currentTarget.dataset.channel;
      this.setData({
        [channel]: e.detail.value,
      });
    },

    onConfirm() {
      const { r, g, b } = this.data;
      const toHex = c => ('0' + c.toString(16)).slice(-2);
      const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      this.triggerEvent('confirm', { color: hexColor });
      this.hide();
    },

    onCancel() {
      this.triggerEvent('cancel');
      this.hide();
    },
    
    onMaskClick() {
      this.onCancel();
    },

    preventBubble() {
      // 阻止事件冒泡
    },
  },
});
