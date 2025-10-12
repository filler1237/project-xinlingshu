// home/tools/whitenoise/whitenoise.js
Page({
  // 返回上一级页面
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  },
  data: {
    isPlaying: false,
    currentSound: '',
    currentSoundName: '',
    volume: 0.5,
    sounds: [
      { id: 'rain', name: '雨声', icon: '/image/TestIcon.png' },
      { id: 'forest', name: '森林', icon: '/image/TestIcon.png' },
      { id: 'ocean', name: '海浪', icon: '/image/TestIcon.png' },
      { id: 'night', name: '夜晚', icon: '/image/TestIcon.png' },
      { id: 'fireplace', name: '壁炉', icon: '/image/TestIcon.png' },
      { id: 'meditation', name: '冥想', icon: '/image/TestIcon.png' }
    ],
    innerAudioContext: null,
    // 使用定时器模拟白噪音
    noiseTimer: null,
    // 音频是否可用（用于不同设备兼容性处理）
    audioAvailable: true
  },

  onLoad() {
    try {
      // 创建微信小程序的音频上下文
      this.setData({
        innerAudioContext: wx.createInnerAudioContext()
      });
      
      // 设置音频事件监听
      this.data.innerAudioContext.onError((res) => {
        console.error('音频播放错误:', res.errMsg);
        this.setData({
          isPlaying: false,
          audioAvailable: false
        });
        wx.showToast({
          title: '音频播放失败',
          icon: 'none'
        });
      });
    } catch (e) {
      console.error('创建音频上下文失败:', e);
      this.setData({
        audioAvailable: false
      });
      wx.showToast({
        title: '当前设备不支持音频播放',
        icon: 'none'
      });
    }
  },

  togglePlay() {
    if (!this.data.audioAvailable) {
      wx.showToast({
        title: '当前设备不支持音频播放',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.isPlaying && !this.data.currentSound) {
      // 如果没有选择声音，选择第一个
      this.selectSound(this.data.sounds[0].id);
    }
    
    if (this.data.isPlaying) {
      this.stopSound();
    } else {
      this.playSound();
    }
  },

  selectSound(e) {
    // 从事件对象中获取声音ID
    let soundId;
    if (e && e.currentTarget && e.currentTarget.dataset) {
      soundId = e.currentTarget.dataset.soundId;
    } else {
      // 如果直接传入soundId（如自动选择第一个）
      soundId = e;
    }
    
    if (this.data.isPlaying) {
      this.stopSound();
    }
    
    // 查找选择的声音名称
    let soundName = '';
    for (let i = 0; i < this.data.sounds.length; i++) {
      if (this.data.sounds[i].id === soundId) {
        soundName = this.data.sounds[i].name;
        break;
      }
    }
    
    this.setData({
      currentSound: soundId,
      currentSoundName: soundName
    });
    
    // 如果之前是播放状态，选择新声音后自动播放
    if (this.data.isPlaying) {
      this.playSound();
    }
  },

  playSound() {
    if (!this.data.audioAvailable || !this.data.currentSound) return;
    
    try {
      // 实际播放白噪音
      this.actualPlaySound();
      
      this.setData({
        isPlaying: true
      });
    } catch (e) {
      console.error('播放声音失败:', e);
      this.setData({
        isPlaying: false
      });
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      });
    }
  },

  // 实际播放白噪音的方法
  actualPlaySound() {
    // 清除之前的定时器
    this.stopSound();
    
    // 设置音频音量
    if (this.data.innerAudioContext) {
      this.data.innerAudioContext.volume = this.data.volume;
      
      // 显示加载提示
      wx.showLoading({
        title: '正在加载音频...',
      });
      
      // 从云存储获取音频资源
      wx.cloud.callFunction({
        name: 'getAudioResources',
        data: {
          action: 'getList',
          soundType: this.data.currentSound
        },
        success: res => {
          console.log('获取音频资源成功', res);
          if (res.result && res.result.success && res.result.data && res.result.data.length > 0) {
            // 获取第一个匹配的音频资源
            const audioResource = res.result.data[0];
            
            // 使用云存储中的音频文件
            this.data.innerAudioContext.src = audioResource.fileID;
            this.data.innerAudioContext.loop = true; // 设置循环播放
            
            // 添加加载监听
            this.data.innerAudioContext.onCanplay(() => {
              this.data.innerAudioContext.play();
              wx.hideLoading();
              wx.showToast({
                title: this.data.currentSoundName + '播放中...',
                icon: 'none',
                duration: 2000
              });
            });
            
            // 在控制台输出提示信息
            console.log('白噪音播放已启动:', this.data.currentSoundName, '音频文件ID:', audioResource.fileID);
          } else {
            wx.hideLoading();
            console.error('未找到音频资源');
            
            // 显示错误提示
            wx.showModal({
              title: '音频播放失败',
              content: `未找到对应的音频资源: ${this.data.currentSound}\n\n请使用"音频资源管理"页面上传对应音频文件`,
              showCancel: false
            });
            
            // 如果播放失败，使用定时器模拟播放状态
            this.data.noiseTimer = setInterval(() => {
              // 这里可以添加播放状态检查逻辑
            }, 1000);
            
            // 显示模拟播放提示
            wx.showToast({
              title: '正在模拟播放' + this.data.currentSoundName,
              icon: 'none',
              duration: 2000
            });
          }
        },
        fail: err => {
          wx.hideLoading();
          console.error('调用云函数失败', err);
          
          // 显示错误提示
          wx.showModal({
            title: '云函数调用失败',
            content: `无法获取音频资源: ${err.message}\n\n请检查网络连接或使用"音频资源管理"页面上传音频`,
            showCancel: false
          });
          
          // 使用定时器模拟播放状态
          this.data.noiseTimer = setInterval(() => {
            // 这里可以添加播放状态检查逻辑
          }, 1000);
          
          // 显示模拟播放提示
          wx.showToast({
            title: '正在模拟播放' + this.data.currentSoundName,
            icon: 'none',
            duration: 2000
          });
        }
      });
      
      // 添加加载完成监听
      this.data.innerAudioContext.onWaiting(() => {
        wx.showLoading({
          title: '音频加载中...',
        });
      });
      
      this.data.innerAudioContext.onCanplay(() => {
        wx.hideLoading();
      });
      
      // 监听错误事件
      this.data.innerAudioContext.onError((res) => {
        wx.hideLoading();
        console.error('音频播放错误:', res.errMsg);
        
        // 显示更详细的错误提示
        wx.showModal({
          title: '音频播放错误',
          content: `错误信息: ${res.errMsg}\n\n可能原因:\n1. 网络连接不稳定\n2. 音频文件格式不支持\n3. 云存储资源不存在\n\n请使用"音频资源管理"页面重新上传音频`,
          showCancel: false
        });
        
        // 切换到模拟播放状态
        this.stopSound();
        this.data.noiseTimer = setInterval(() => {}, 1000);
        wx.showToast({
          title: '已切换到模拟播放',
          icon: 'none',
          duration: 2000
        });
      });
    } else {
      // 如果没有音频上下文，使用定时器模拟播放状态
      wx.showToast({
        title: this.data.currentSoundName + '模拟播放中...',
        icon: 'none',
        duration: 2000
      });
      
      this.data.noiseTimer = setInterval(() => {
        // 这里可以添加播放状态检查逻辑
      }, 1000);
    }
    
    console.log('提示: 为了能够真正播放白噪音，请使用"音频资源管理"页面上传以下音频资源：');
    console.log('rain (雨声), forest (森林), ocean (海浪), night (夜晚), fireplace (壁炉), meditation (冥想)');
  },

  stopSound() {
    if (this.data.noiseTimer) {
      clearInterval(this.data.noiseTimer);
      this.data.noiseTimer = null;
    }
    
    // 停止音频播放
    if (this.data.innerAudioContext) {
      this.data.innerAudioContext.stop();
    }
    
    this.setData({
      isPlaying: false
    });
  },

  adjustVolume(e) {
    const volume = e.detail.value / 100;
    this.setData({
      volume: volume
    });
    
    // 设置音频音量
    if (this.data.innerAudioContext) {
      this.data.innerAudioContext.volume = volume;
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.stopSound();
    if (this.data.innerAudioContext) {
      this.data.innerAudioContext.destroy();
    }
  }
})