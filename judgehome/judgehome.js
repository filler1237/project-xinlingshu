Page({
  data: {
    userInfo: null,
    isChiefJudge: false,
    stats: {
      assignedWorks: 0,
      reviewedWorks: 0,
      pendingWorks: 0
    }
  },

  onBack() {
    console.log('🔙 返回按钮被点击');
    
    const pages = getCurrentPages();
    console.log('📚 当前页面栈长度:', pages.length);
    
    if (pages.length <= 1) {
      console.log('⚠️ 没有上一页，跳转到 mine 页');
      wx.switchTab({
        url: '/pages/mine/mine',
        success: () => {
          console.log('✅ 跳转到 mine 页成功');
        },
        fail: (err) => {
          console.error('❌ 跳转到 mine 页失败:', err);
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
      return;
    }
    
    wx.navigateBack({
      delta: 1,
      success: () => {
        console.log('✅ 返回上一页成功');
      },
      fail: (err) => {
        console.error('❌ 返回上一页失败:', err);
        wx.switchTab({
          url: '/pages/mine/mine',
          fail: (err2) => {
            console.error('❌ 跳转到 mine 页也失败:', err2);
            wx.showToast({
              title: '返回失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  onLoad() {
    this.getUserInfo();
    this.loadStats();
  },

  onShow() {
    this.getUserInfo();
  },

  onPullDownRefresh() {
    this.loadStats();
    wx.stopPullDownRefresh();
  },

  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.switchTab({
        url: '/pages/mine/mine'
      });
      return;
    }
    
    const isChiefJudge = userInfo.role === 'chief_judge';
    this.setData({ 
      userInfo,
      isChiefJudge 
    });
  },

  loadStats() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // 调用云函数获取统计数据
    wx.cloud.callFunction({
      name: 'getJudgeWorks',
      data: {
        status: 'all',  // 获取所有作品
        page: 1,
        pageSize: 1000  // 获取足够多的数据以统计
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.result.success) {
          const works = res.result.data || [];
          const assignedWorks = works.length;  // 分配的作品总数
          const reviewedWorks = res.result.reviewedCount || 0;  // 已评审数量
          const pendingWorks = res.result.pendingCount || 0;  // 待评审数量
          
          this.setData({
            stats: {
              assignedWorks: assignedWorks,
              reviewedWorks: reviewedWorks,
              pendingWorks: pendingWorks
            }
          });
        } else {
          // 如果失败，使用默认值
          this.setData({
            stats: {
              assignedWorks: 0,
              reviewedWorks: 0,
              pendingWorks: 0
            }
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('加载统计数据失败:', err);
        // 失败时使用默认值
        this.setData({
          stats: {
            assignedWorks: 0,
            reviewedWorks: 0,
            pendingWorks: 0
          }
        });
      }
    });
  },

  toWorkList() {
    wx.navigateTo({
      url: '/competition/pages/judge/workList/workList'
    });
  },

  toScoreStandard() {
    wx.navigateTo({
      url: '/competition/pages/judge/scoreStandard/scoreStandard'
    });
  },

  toScoreSummary() {
    wx.navigateTo({
      url: '/competition/pages/judge/scoreSummary/scoreSummary'
    });
  },

  // 返回函数 - 保留作为备选
  goBack: function() {
    wx.switchTab({ url: '/pages/mine/mine' });
  }
})