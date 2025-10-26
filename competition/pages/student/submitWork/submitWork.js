Page({
  data: {
    activities: [
      {
        id: '1',
        title: '心理绘画创作大赛',
        deadline: '2024-03-31'
      },
      {
        id: '2', 
        title: '心理主题征文比赛',
        deadline: '2024-03-15'
      }
    ],
    selectedActivity: null,
    workTitle: '',
    workDescription: '',
    files: []
  },

  // 返回 ，放js文件
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },
  
  onLoad() {
    console.log('提交作品页面加载');
  },

  onBackTap: function(e) {
    wx.navigateBack({                                    //返回上一页面
      delta: 1,
    });
  },



  // 选择活动
  onActivitySelect(e) {
    const activityId = e.currentTarget.dataset.id;
    const activity = this.data.activities.find(a => a.id === activityId);
    this.setData({ selectedActivity: activity });
  },

  // 输入作品标题
  onTitleInput(e) {
    this.setData({ workTitle: e.detail.value });
  },

  // 输入作品描述
  onDescriptionInput(e) {
    this.setData({ workDescription: e.detail.value });
  },

  // 选择文件
  onChooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const file = res.tempFiles[0];
        this.setData({
          files: [{
            name: file.name,
            size: this.formatFileSize(file.size),
            path: file.path
          }]
        });
      }
    });
  },

  // 格式化文件大小
  formatFileSize(size) {
    if (size < 1024) {
      return size + 'B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + 'KB';
    } else {
      return (size / (1024 * 1024)).toFixed(1) + 'MB';
    }
  },

  // 删除文件
  onRemoveFile() {
    this.setData({ files: [] });
  },

  // 提交作品
  onSubmit() {
    const { selectedActivity, workTitle, workDescription, files } = this.data;
    
    if (!selectedActivity) {
      wx.showToast({
        title: '请选择活动',
        icon: 'none'
      });
      return;
    }

    if (!workTitle.trim()) {
      wx.showToast({
        title: '请输入作品标题',
        icon: 'none'
      });
      return;
    }

    if (files.length === 0) {
      wx.showToast({
        title: '请上传作品文件',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '提交中...',
    });

    // 模拟提交
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 2000);
  }
})