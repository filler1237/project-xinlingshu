Component({
  properties: {
    dataList: {
      type: Array,
      value: []
    }
  },
  data: {
    // 新的柔和色系
    bgColor: [
      '#a8d8ea', '#f7c9c9', '#f9eac3', '#c8e6c9', '#b2dfdb',
      '#d1c4e9', '#f4c2c2', '#d0f4ea', '#f8d5a3', '#d9d2e9',
      '#e1f5fe', '#fce4ec', '#fff9c4', '#dcedc8', '#c8e6c9',
      '#f3e5f5', '#ffe0b2', '#d7ccc8', '#cfd8dc', '#f5f5f5',
      '#a8d8ea', '#f7c9c9', '#f9eac3', '#c8e6c9', '#b2dfdb',
      '#d1c4e9', '#f4c2c2', '#d0f4ea', '#f8d5a3', '#d9d2e9',
      '#e1f5fe', '#fce4ec', '#fff9c4', '#dcedc8', '#c8e6c9'
    ],
  },
  methods: {
    clickItem(event) {
      const item = event.currentTarget.dataset.item;
      this.triggerEvent('change', item);
    }
  }
});
