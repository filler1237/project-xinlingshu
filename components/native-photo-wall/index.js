Component({
  properties: {
    dataList: {
      type: Array,
      value: []
    }
  },
  data: {
    bgColor: ['#58b9b3', '#d4584a', '#e58239', '#9ac656', '#60b257', '#387ff6', '#623ab2', '#9132ac',
      '#d04797', '#9d6947', '#333333', '#58b9b3', '#d4584a', '#e58239', '#9ac656', '#60b257', '#387ff6',
      '#623ab2', '#9132ac',
      '#d04797', '#9d6947', '#333333', '#58b9b3', '#d4584a', '#e58239', '#9ac656', '#60b257', '#387ff6',
      '#623ab2', '#9132ac',
      '#d04797', '#9d6947', '#333333'
    ],
  },
  methods: {
    clickItem(event) {
      const item = event.currentTarget.dataset.item;
      this.triggerEvent('change', item);
    }
  }
});
