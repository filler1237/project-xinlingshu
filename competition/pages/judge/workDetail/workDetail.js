// competition/pages/judge/workDetail/workDetail.js
Page({
  data: {
    workId: '',
    work: null,
    activity: null,
    loading: true,
    // 评审信息
    reviewInfo: null,
    hasReviewed: false
  },

  onLoad(options) {
    const { workId } = options;
    console.log('📄 作品详情页面加载，作品ID:', workId);
    
    if (workId) {
      this.setData({ workId: workId });
      this.loadWorkDetail(workId);
    } else {
      wx.showToast({
        title: '作品ID缺失',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 加载作品详情
   */
  loadWorkDetail(workId) {
    this.setData({ loading: true });
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // 获取作品信息
    const db = wx.cloud.database();
    db.collection('works').doc(workId).get({
      success: (res) => {
        if (res.data) {
          const work = res.data;
          console.log('✅ 作品数据:', work);
          
          // 处理作品数据
          const processedWork = {
            id: work._id,
            title: work.title || '未命名作品',
            description: work.description || '无描述',
            studentId: work.studentId,
            studentName: work.studentName || '匿名学生',
            activityId: work.activityId,
            fileID: work.fileID,
            fileName: work.fileName || '作品文件',
            fileType: work.fileType,
            fileSize: work.fileSize,
            submittedAt: work.submittedAt,
            scores: work.scores || [],
            averageScore: work.averageScore || 0,
            totalScore: work.totalScore || 0,
            judgeCount: work.judgeCount || 0
          };
          
          this.setData({ work: processedWork });
          
          // 检查是否已评审过
          this.checkReviewStatus(work);
          
          // 加载活动信息
          this.loadActivityDetail(work.activityId);
        } else {
          wx.hideLoading();
          this.setData({ loading: false });
          wx.showToast({
            title: '作品不存在',
            icon: 'none'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ loading: false });
        console.error('❌ 加载作品失败:', err);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 检查评审状态
   */
  checkReviewStatus(work) {
    // 获取当前评委的openid
    wx.cloud.callFunction({
      name: 'login',
      success: (loginRes) => {
        const judgeId = loginRes.result.openid;
        const existingReview = work.scores ? work.scores.find(s => s.judgeId === judgeId) : null;
        
        if (existingReview) {
          this.setData({
            hasReviewed: true,
            reviewInfo: {
              scores: existingReview.scores || [],
              totalScore: existingReview.totalScore || 0,
              comment: existingReview.comment || '',
              reviewedAt: existingReview.reviewedAt
            }
          });
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
      }
    });
  },

  /**
   * 加载活动详情
   */
  loadActivityDetail(activityId) {
    if (!activityId) {
      wx.hideLoading();
      this.setData({ loading: false });
      return;
    }

    wx.cloud.callFunction({
      name: 'getActivities',
      data: {
        status: 'all',
        page: 1,
        pageSize: 100
      },
      success: (res) => {
        wx.hideLoading();
        this.setData({ loading: false });
        
        if (res.result.success && res.result.data) {
          // 查找指定的活动
          const activity = res.result.data.find(a => 
            (a.id === activityId || a._id === activityId)
          );
          
          if (activity) {
            this.setData({ activity: activity });
          } else {
            console.warn('活动不存在:', activityId);
          }
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ loading: false });
        console.error('加载活动详情失败:', err);
      }
    });
  },

  /**
   * 查看/下载作品文件
   */
  downloadWorkFile() {
    const { work } = this.data;
    
    if (!work || !work.fileID) {
      wx.showToast({
        title: '文件不存在',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '准备文件...',
      mask: true
    });

    // 获取临时下载链接
    wx.cloud.getTempFileURL({
      fileList: [work.fileID],
      success: (res) => {
        wx.hideLoading();
        
        if (res.fileList && res.fileList.length > 0) {
          const fileInfo = res.fileList[0];
          const downloadUrl = fileInfo.tempFileURL;
          
          // 复制链接到剪贴板
          wx.setClipboardData({
            data: downloadUrl,
            success: () => {
              wx.showModal({
                title: '文件链接已复制',
                content: `文件链接已复制到剪贴板\n\n您可以在浏览器中打开链接查看文件\n\n文件名：${work.fileName}`,
                confirmText: '知道了',
                showCancel: false
              });
            },
            fail: () => {
              wx.showToast({
                title: '复制失败',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '获取文件链接失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('获取文件链接失败:', err);
        wx.showToast({
          title: '获取文件失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 开始评审
   */
  startReview() {
    const { workId } = this.data;
    
    if (!workId) {
      wx.showToast({
        title: '作品ID无效',
        icon: 'none'
      });
      return;
    }
    
    // 跳转到评审页面
    wx.navigateTo({
      url: `/competition/pages/judge/scoring/scoring?workId=${workId}`
    });
  },

  /**
   * 返回
   */
  goBack() {
    wx.navigateBack();
  }
});

