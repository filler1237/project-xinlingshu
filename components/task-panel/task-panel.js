Component({
  properties: {
    tasks: {
      type: Array,
      value: []
    }
  },

  data: {
    isExpanded: false
  },

  methods: {
    togglePanel() {
      this.setData({
        isExpanded: !this.data.isExpanded
      });
    }
  }
});
