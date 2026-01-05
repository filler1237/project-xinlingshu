// pages/judge/scoring/scoring.js
Page({
  data: {
    activityInfo: {
      title: '',
      organizer: '',
      id: '',
      description: '',
      workTitle: '',
      workDescription: ''
    },
    // 三维度评分框架
    scoreItems: [
      { 
        id: 1, 
        name: '内容与思想', 
        maxScore: 40,
        description: '思想深度、内容价值、逻辑结构',
        score: 0,
        placeholder: '0-40分'
      },
      { 
        id: 2, 
        name: '创意与创新', 
        maxScore: 30,
        description: '原创性、独特性、创新思维',
        score: 0,
        placeholder: '0-30分'
      },
      { 
        id: 3, 
        name: '表现与技巧', 
        maxScore: 30,
        description: '技术水平、表现形式、完成质量',
        score: 0,
        placeholder: '0-30分'
      }
    ],
    comment: '',
    totalScore: 0,
    activityId: null,
    submissionId: null,
    submissionData: null,
    loading: false,
    // 从云函数获取的作品列表
    allSubmissions: [],
    currentSubmissionIndex: 0
  },

  onLoad: function(options) {
    console.log('🎯 评审页面加载，参数:', options);
    
    // 直接从后端获取所有待评审作品
    this.loadAllSubmissions();
  },

  // 从云函数获取所有待评审作品
  loadAllSubmissions: function() {
    const that = this;
    wx.showLoading({
      title: '加载作品列表...',
      mask: true
    });

    console.log('🔄 从云函数获取所有待评审作品');
    
    // 调用云函数获取作品列表
    wx.cloud.callFunction({
      name: 'getJudgeWorks',
      data: {
        status: 'pending',  // 只获取待评审的作品
        page: 1,
        pageSize: 100
      },
      success: (res) => {
        wx.hideLoading();
        console.log('✅ 作品列表加载响应:', res.result);
        
        if (res.result.success) {
          const submissions = res.result.data || [];
          console.log(`📊 获取到 ${submissions.length} 个待评审作品`);
          
          if (submissions.length === 0) {
            that.showNoSubmissions();
            return;
          }
          
          // 转换数据格式以适配现有代码
          const formattedSubmissions = submissions.map(work => ({
            id: work.id || work._id,
            title: work.title,
            description: work.description,
            activityId: work.activityId,
            activity: {
              title: work.activityTitle,
              organizer: work.organizer,
              id: work.activityId
            },
            fileInfo: {
              fileName: work.fileName,
              fileID: work.fileID,
              fileType: work.fileType,
              fileSize: work.fileSize
            },
            reviewed: work.hasReviewed || false
          }));
          
          that.setData({
            allSubmissions: formattedSubmissions
          });
          
          // 加载第一个作品
          that.loadSubmissionByIndex(0);
        } else {
          const errorMsg = res.result.message || '加载失败';
          console.error('❌ 加载作品列表失败:', errorMsg);
          that.showError('加载作品列表失败: ' + errorMsg);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('💥 加载失败:', err);
        that.showError('网络错误，请稍后重试');
      }
    });
  },

  // 按索引加载作品
  loadSubmissionByIndex: function(index) {
    const submissions = this.data.allSubmissions;
    if (index < 0 || index >= submissions.length) {
      console.error('❌ 作品索引超出范围:', index);
      return;
    }
    
    const submission = submissions[index];
    console.log(`📖 加载第 ${index + 1}/${submissions.length} 个作品:`, submission.title);
    
    this.setData({
      currentSubmissionIndex: index,
      submissionId: submission.id
    });
    
    this.setDataFromSubmission(submission);
  },

  // 从作品数据设置页面数据
  setDataFromSubmission: function(submission) {
    console.log('🔧 设置页面数据，作品数据结构:', submission);
    
    // 使用后端返回的完整数据结构
    const activityInfo = {
      title: submission.activity?.title || '未知活动',
      organizer: submission.activity?.organizer || '未知组织',
      id: submission.activity?.id || '',
      description: submission.activity?.description || '',
      workTitle: submission.title || '未知作品',
      workDescription: submission.description || '无描述信息'
    };

    this.setData({
      submissionData: submission,
      activityInfo: activityInfo,
      activityId: submission.activityId,
      fileInfo: submission.fileInfo || null,
      submissionId: submission.id
    });
    
    console.log('✅ 页面数据设置完成:', {
      activityInfo: this.data.activityInfo,
      submissionId: this.data.submissionId
    });
    
    // 重置评分和评论
    this.resetScores();
    
    // 检查是否已经评审过
    this.checkPreviousReview(submission);
  },

  // 重置评分和评论
  resetScores: function() {
    const resetScoreItems = this.data.scoreItems.map(item => ({
      ...item,
      score: 0
    }));
    
    this.setData({
      scoreItems: resetScoreItems,
      comment: '',
      totalScore: 0
    });
  },

  // 检查之前的评审记录
  checkPreviousReview: function(submission) {
    const judgeId = this.getJudgeId();
    
    // 如果作品已经被当前评委评审过
    if (submission.reviewed) {
      // 尝试加载历史评审数据
      this.loadPreviousReviewData(submission.id);
    }
  },

  // 加载历史评审数据（从作品数据中获取）
  loadPreviousReviewData: function(submissionId) {
    const that = this;
    // 从作品列表中查找该作品
    const submission = this.data.allSubmissions.find(s => s.id === submissionId);
    
    if (submission && submission.reviewed) {
      // 如果作品已评审，从作品数据中获取评审信息
      // 这里需要从数据库获取完整的作品信息
      const db = wx.cloud.database();
      db.collection('works').doc(submissionId).get({
        success: (res) => {
          if (res.data && res.data.scores) {
            // 获取当前评委的评分
            wx.cloud.callFunction({
              name: 'login',
              success: (loginRes) => {
                const judgeId = loginRes.result.openid;
                const previousReview = res.data.scores.find(s => s.judgeId === judgeId);
                
                if (previousReview) {
                  wx.showModal({
                    title: '发现历史评审',
                    content: '检测到您之前已经评审过此作品，是否加载之前的评分？',
                    confirmText: '加载',
                    cancelText: '重新评审',
                    success: (modalRes) => {
                      if (modalRes.confirm) {
                        that.loadPreviousReview(previousReview);
                      }
                    }
                  });
                }
              }
            });
          }
        },
        fail: (err) => {
          console.error('加载历史评审数据失败:', err);
        }
      });
    }
  },

  // 加载之前的评审数据
  loadPreviousReview: function(review) {
    const scoreItems = this.data.scoreItems.map(item => {
      let score = 0;
      if (item.id === 1) score = review.scores?.content || 0;
      if (item.id === 2) score = review.scores?.creativity || 0;
      if (item.id === 3) score = review.scores?.technique || 0;
      
      return { ...item, score: score };
    });
    
    this.setData({
      scoreItems: scoreItems,
      comment: review.comment || '',
      totalScore: review.totalScore || 0
    });
  },

  // 切换到上一个作品
  loadPreviousSubmission: function() {
    const currentIndex = this.data.currentSubmissionIndex;
    const totalSubmissions = this.data.allSubmissions.length;
    
    if (currentIndex <= 0) {
      wx.showToast({
        title: '已经是第一个作品',
        icon: 'none'
      });
      return;
    }
    
    this.loadSubmissionByIndex(currentIndex - 1);
  },

  // 切换到下一个作品
  loadNextSubmission: function() {
    const currentIndex = this.data.currentSubmissionIndex;
    const totalSubmissions = this.data.allSubmissions.length;
    
    if (currentIndex >= totalSubmissions - 1) {
      wx.showToast({
        title: '已经是最后一个作品',
        icon: 'none'
      });
      return;
    }
    
    this.loadSubmissionByIndex(currentIndex + 1);
  },

  // 分数输入
  onScoreInput: function(e) {
    const scoreId = e.currentTarget.dataset.id;
    let scoreValue = e.detail.value;
    
    let maxScore = 0;
    const scoreItems = this.data.scoreItems;
    for (let i = 0; i < scoreItems.length; i++) {
      if (scoreItems[i].id == scoreId) {
        maxScore = scoreItems[i].maxScore;
        break;
      }
    }
    
    let numValue = parseFloat(scoreValue);
    if (isNaN(numValue)) numValue = 0;
    if (numValue > maxScore) numValue = maxScore;
    if (numValue < 0) numValue = 0;
    
    const updatedScoreItems = this.data.scoreItems.map(item => {
      if (item.id == scoreId) {
        return { ...item, score: numValue };
      }
      return item;
    });
    
    this.setData({ scoreItems: updatedScoreItems });
    this.calculateTotalScore();
  },

  // 计算总分
  calculateTotalScore: function() {
    let total = 0;
    const scoreItems = this.data.scoreItems;
    
    for (let i = 0; i < scoreItems.length; i++) {
      const score = scoreItems[i].score;
      if (!isNaN(score)) {
        total += score;
      }
    }
    
    this.setData({ totalScore: total.toFixed(1) });
  },

  // 评价输入
  onCommentInput: function(e) {
    this.setData({ comment: e.detail.value });
  },

  // 提交评分
  submitScore: function() {
    const scoreItems = this.data.scoreItems;
    const comment = this.data.comment;
    const totalScore = this.data.totalScore;
    const that = this;
    
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
    
    // 提交确认
    wx.showModal({
      title: '确认提交评审',
      content: `确定要提交评审吗？\n总分：${totalScore}分\n\n评分明细：\n${scoreItems.map(item => `${item.name}: ${item.score}分`).join('\n')}`,
      confirmText: '确认提交',
      cancelText: '再检查下',
      success: function(res) {
        if (res.confirm) {
          that.doRealSubmitScore();
        }
      }
    });
  },

  // 执行真实提交
  doRealSubmitScore: function() {
    const that = this;
    this.setData({ loading: true });
    
    wx.showLoading({ 
      title: '提交评审中...',
      mask: true
    });
    
    // 构建评分对象（以评分项名称为key）
    const scores = {};
    this.data.scoreItems.forEach((item, index) => {
      scores[item.name] = parseFloat(item.score) || 0;
    });
    
    const reviewData = {
      workId: this.data.submissionId,
      scores: scores,
      totalScore: parseFloat(this.data.totalScore) || 0,
      comment: this.data.comment.trim(),
      judgeName: this.getJudgeName()
    };
    
    console.log('📤 提交评审数据:', reviewData);
    
    // 调用云函数提交评审
    wx.cloud.callFunction({
      name: 'submitReview',
      data: reviewData,
      success: (res) => {
        wx.hideLoading();
        this.setData({ loading: false });
        console.log('📨 评审提交响应:', res.result);
        
        if (res.result.success) {
          wx.showToast({
            title: '评审提交成功',
            icon: 'success',
            duration: 2000
          });
          
          // 自动切换到下一个作品
          setTimeout(() => {
            that.loadNextSubmission();
          }, 1500);
        } else {
          wx.showToast({
            title: '提交失败: ' + (res.result.message || '服务器错误'),
            icon: 'none',
            duration: 3000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ loading: false });
        console.error('💥 提交失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 3000
        });
      }
    });
  },
  
  // 获取评委姓名
  getJudgeName: function() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      return userInfo?.username || userInfo?.nickName || '评委';
    } catch (error) {
      return '评委';
    }
  },

  // 下载作品文件
  downloadWorkFile: function() {
    const fileInfo = this.data.fileInfo;
    
    if (!fileInfo) {
      wx.showToast({
        title: '此作品没有可下载的文件',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '准备下载...',
      mask: true
    });
    
    const fileName = fileInfo.fileName || fileInfo.name;
    const fileUrl = fileInfo.url || fileInfo.path;
    
    if (!fileUrl) {
      wx.hideLoading();
      wx.showToast({
        title: '文件链接无效',
        icon: 'none'
      });
      return;
    }
    
    const fileType = this.getFileType(fileName);
    
    if (fileType === 'image') {
      this.previewImage(fileInfo);
    } else if (fileType === 'video') {
      this.previewVideo(fileInfo);
    } else {
      this.downloadFile(fileInfo);
    }
  },

  // 获取文件类型
  getFileType: function(filename) {
    if (!filename) return 'other';
    
    const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoExt = ['mp4', 'avi', 'mov', 'wmv', 'flv'];
    
    const ext = filename.split('.').pop().toLowerCase();
    
    if (imageExt.includes(ext)) return 'image';
    if (videoExt.includes(ext)) return 'video';
    return 'other';
  },

  // 预览图片
  previewImage: function(fileInfo) {
    wx.hideLoading();
    const imageUrl = fileInfo.url || fileInfo.path;
    if (imageUrl) {
      wx.previewImage({
        urls: [imageUrl],
        fail: () => {
          wx.showToast({
            title: '预览失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '图片链接无效',
        icon: 'none'
      });
    }
  },

  // 预览视频
  previewVideo: function(fileInfo) {
    wx.hideLoading();
    wx.showToast({
      title: '请在作品详情中查看视频',
      icon: 'none'
    });
  },

  // 下载文件
  downloadFile: function(fileInfo) {
    wx.downloadFile({
      url: fileInfo.url,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.showToast({
            title: '下载成功',
            icon: 'success'
          });
          console.log('文件下载到:', res.tempFilePath);
        } else {
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('下载失败:', err);
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },

  // 获取评委ID（不再需要，云函数会自动获取openid）
  getJudgeId: function() {
    // 这个方法保留用于兼容，但实际不再使用
    return '';
  },

  // 显示错误
  showError: function(message) {
    wx.showModal({
      title: '提示',
      content: message,
      showCancel: false,
      success: () => {
        this.goBack();
      }
    });
  },

  // 显示无作品提示
  showNoSubmissions: function() {
    wx.showModal({
      title: '提示',
      content: '当前没有待评审的作品',
      showCancel: false,
      success: () => {
        this.goBack();
      }
    });
  },

  // 返回
  goBack: function() {
    wx.navigateBack();
  }
});