// competition/pages/judge/scoring/scoring.js
Page({
  data: {
    workId: '',
    work: null,
    activity: null,
    // 评分项（从活动的评分细则动态生成）
    scoreItems: [],
    comment: '',
    totalScore: 0,
    loading: false,
    hasReviewed: false // 是否已评审过
  },

  onLoad(options) {
    const { workId } = options;
    console.log('🎯 评审页面加载，作品ID:', workId);
    
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
   * 加载作品详情和活动信息
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
          this.setData({ work: work });
          
          // 检查是否已评审过
          // 先获取当前用户的openid
          wx.cloud.callFunction({
            name: 'login',
            success: (loginRes) => {
              const judgeId = loginRes.result.openid;
              const existingReview = work.scores ? work.scores.find(s => s.judgeId === judgeId) : null;
              
              if (existingReview) {
                this.setData({ hasReviewed: true });
                // 加载之前的评分
                this.loadPreviousReview(existingReview, work);
              }
            }
          });
          
          // 加载活动信息以获取评分细则
          this.loadActivityDetail(work.activityId);
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '作品不存在',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('加载作品失败:', err);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 加载活动详情（获取评分细则）
   */
  loadActivityDetail(activityId) {
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
          const activity = res.result.data.find(a => 
            (a.id === activityId || a._id === activityId)
          );
          
          if (activity) {
            this.setData({ activity: activity });
            // 根据活动的评分细则生成评分项
            this.initScoreItems(activity.scoreRules || []);
          }
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ loading: false });
        console.error('加载活动失败:', err);
      }
    });
  },

  /**
   * 初始化评分项（根据活动的评分细则）
   */
  initScoreItems(scoreRules) {
    if (!scoreRules || scoreRules.length === 0) {
      // 如果没有评分细则，使用默认的
      this.setData({
        scoreItems: [
          { id: 1, name: '内容与思想', maxScore: 40, description: '思想深度、内容价值、逻辑结构', score: 0 },
          { id: 2, name: '创意与创新', maxScore: 30, description: '原创性、独特性、创新思维', score: 0 },
          { id: 3, name: '表现与技巧', maxScore: 30, description: '技术水平、表现形式、完成质量', score: 0 }
        ]
      });
      return;
    }

    // 根据评分细则生成评分项
    const scoreItems = scoreRules.map((rule, index) => ({
      id: index + 1,
      name: rule.name || rule.criterion || `评分项${index + 1}`,
      maxScore: parseInt(rule.maxScore || rule.score || 0),
      description: rule.description || '',
      score: 0
    }));

    this.setData({ scoreItems: scoreItems });
  },

  /**
   * 加载之前的评审记录
   */
  loadPreviousReview(review, work) {
    const scoreItems = this.data.scoreItems.map((item, index) => {
      // 从之前的评分中获取对应项的分值
      const scoreKey = Object.keys(review.scores || {})[index];
      const score = review.scores ? review.scores[scoreKey] : 0;
      
      return {
        ...item,
        score: score || 0
      };
    });

    this.setData({
      scoreItems: scoreItems,
      comment: review.comment || '',
      totalScore: review.totalScore || 0
    });
  },

  /**
   * 分数输入
   */
  onScoreInput(e) {
    const scoreId = e.currentTarget.dataset.id;
    let scoreValue = parseFloat(e.detail.value) || 0;
    
    const scoreItems = this.data.scoreItems.map(item => {
      if (item.id == scoreId) {
        // 限制分数范围
        if (scoreValue > item.maxScore) scoreValue = item.maxScore;
        if (scoreValue < 0) scoreValue = 0;
        return { ...item, score: scoreValue };
      }
      return item;
    });

    this.setData({ scoreItems: scoreItems });
    this.calculateTotalScore();
  },

  /**
   * 计算总分
   */
  calculateTotalScore() {
    const total = this.data.scoreItems.reduce((sum, item) => {
      return sum + (item.score || 0);
    }, 0);
    
    this.setData({ totalScore: parseFloat(total.toFixed(2)) });
  },

  /**
   * 评语输入
   */
  onCommentInput(e) {
    this.setData({ comment: e.detail.value });
  },

  /**
   * 提交评分
   */
  submitScore() {
    const { scoreItems, comment, totalScore, workId } = this.data;
    
    // 验证评分
    let allScored = true;
    for (let i = 0; i < scoreItems.length; i++) {
      if (scoreItems[i].score === 0 || isNaN(scoreItems[i].score)) {
        allScored = false;
        break;
      }
    }

    if (!allScored) {
      wx.showToast({ title: '请完成所有评分项', icon: 'none' });
      return;
    }

    if (!comment.trim()) {
      wx.showToast({ title: '请输入评价内容', icon: 'none' });
      return;
    }

    // 构建评分对象（以评分项名称为key）
    const scores = {};
    scoreItems.forEach(item => {
      scores[item.name] = item.score;
    });

    // 提交确认
    wx.showModal({
      title: '确认提交评审',
      content: `确定要提交评审吗？\n总分：${totalScore}分\n\n评分明细：\n${scoreItems.map(item => `${item.name}: ${item.score}分`).join('\n')}`,
      confirmText: '确认提交',
      cancelText: '再检查下',
      success: (res) => {
        if (res.confirm) {
          this.doSubmitScore(scores, totalScore, comment);
        }
      }
    });
  },

  /**
   * 执行提交评分
   */
  doSubmitScore(scores, totalScore, comment) {
    this.setData({ loading: true });
    
    wx.showLoading({ 
      title: '提交评审中...',
      mask: true
    });

    wx.cloud.callFunction({
      name: 'submitReview',
      data: {
        workId: this.data.workId,
        scores: scores,
        totalScore: totalScore,
        comment: comment,
        judgeName: this.getJudgeName()
      },
      success: (res) => {
        wx.hideLoading();
        this.setData({ loading: false });
        
        if (res.result.success) {
          wx.showToast({
            title: '评审提交成功',
            icon: 'success',
            duration: 2000
          });
          
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: res.result.message || '提交失败',
            icon: 'none',
            duration: 3000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ loading: false });
        console.error('提交失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 3000
        });
      }
    });
  },

  /**
   * 获取评委ID
   */
  getJudgeId() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      return userInfo?.userId || wx.getStorageSync('judgeId') || '';
    } catch (error) {
      return '';
    }
  },

  /**
   * 获取评委姓名
   */
  getJudgeName() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      return userInfo?.username || userInfo?.nickName || '评委';
    } catch (error) {
      return '评委';
    }
  },

  /**
   * 下载/预览作品文件
   */
  downloadWorkFile() {
    const work = this.data.work;
    if (!work || !work.fileID) {
      wx.showToast({
        title: '此作品没有可下载的文件',
        icon: 'none'
      });
      return;
    }

    // 根据文件类型处理
    const fileType = work.fileType;
    if (fileType === 'image') {
      // 预览图片
      wx.previewImage({
        urls: [work.fileID],
        fail: () => {
          wx.showToast({
            title: '预览失败',
            icon: 'none'
          });
        }
      });
    } else {
      // 下载文件
      wx.cloud.downloadFile({
        fileID: work.fileID,
        success: (res) => {
          wx.showToast({
            title: '下载成功',
            icon: 'success'
          });
        },
        fail: (err) => {
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      });
    }
  }
});

