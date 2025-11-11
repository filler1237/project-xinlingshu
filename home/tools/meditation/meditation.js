// home/tools/meditation/meditation.js
Page({
  // 返回上一级页面
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  },
  
  data: {
    status: 'ready', // ready, meditating, paused, completed
    selectedDuration: 5, // 默认5分钟
    selectedMusic: 'rain', // 默认雨声
    selectedBackground: '', // 背景图片路径
    selectedBackgroundType: 'none', // 背景类型: forest, ocean, mountain, none
    backgroundImages: {
      forest: '/image/TreeBack.jpg',
      ocean: '/image/QingTan-con.png',
      mountain: '/image/QingSu-con.png'
    },
    totalSeconds: 0,
    remainingSeconds: 0,
    progress: 0,
    timer: null,
    formattedTime: '00:00',
    instruction: '准备开始冥想',
    guidanceText: '开始您的冥想之旅',
    currentEmoji: '🧘',
    currentColor1: '#6a11cb',
    currentColor2: '#2575fc',
    pulseSpeed: 5, // 呼吸动画速度（秒）
    showBreathingGuide: true,
    breathingInstruction: '深呼吸...',
    breathingPhase: 0, // 0: 吸气, 1: 屏息, 2: 呼气
    breathingTimer: null,
    totalMinutes: 0, // 今日冥想总时长
    audioContext: null, // 音频上下文
    isAudioPlaying: false
  },
  
  onLoad() {
    // 从本地存储获取今日冥想记录
    const today = new Date().toDateString();
    const meditationRecord = wx.getStorageSync('meditationRecord') || {};
    if (meditationRecord.date === today) {
      this.setData({
        totalMinutes: meditationRecord.totalMinutes || 0
      });
    }
    
    // 初始化音频上下文 - 增强的安全初始化
    try {
      // 检查wx.createInnerAudioContext是否可用
      if (typeof wx.createInnerAudioContext === 'function') {
        const audioContext = wx.createInnerAudioContext();
        
        // 仅在audioContext成功创建时设置属性和事件监听
        if (audioContext) {
          // 设置音频上下文基本属性
          try {
            audioContext.obeyMuteSwitch = false; // 允许在静音模式下播放
            audioContext.volume = 0.3;
          } catch (propertyErr) {
            console.log('设置音频属性失败:', propertyErr);
            // 静默处理属性设置错误
          }
          
          // 使用try-catch包装每个事件监听器的添加
          try {
            audioContext.onError((err) => {
              console.log('音频错误:', err);
              // 错误已在播放函数中处理，这里仅记录
            });
          } catch (err) {
            console.log('添加错误监听失败:', err);
          }
          
          try {
            audioContext.onPlay(() => {
              console.log('音频开始播放');
            });
          } catch (err) {
            console.log('添加播放监听失败:', err);
          }
          
          try {
            audioContext.onPause(() => {
              console.log('音频暂停');
            });
          } catch (err) {
            console.log('添加暂停监听失败:', err);
          }
          
          try {
            audioContext.onStop(() => {
              console.log('音频停止');
            });
          } catch (err) {
            console.log('添加停止监听失败:', err);
          }
          
          this.setData({
            audioContext: audioContext
          });
        } else {
          console.log('创建音频上下文失败: 返回了null/undefined');
          this.setData({ audioContext: null });
        }
      } else {
        console.log('createInnerAudioContext不可用');
        this.setData({ audioContext: null });
      }
    } catch (e) {
      console.log('音频初始化失败:', e);
      // 确保设置audioContext为null，避免后续操作时出错
      this.setData({ audioContext: null });
    }
  },
  
  // 选择冥想时长
  selectDuration(e) {
    const duration = parseInt(e.currentTarget.dataset.duration);
    this.setData({
      selectedDuration: duration
    });
  },
  
  // 选择背景音乐
  selectMusic(e) {
    const music = e.currentTarget.dataset.music;
    this.setData({
      selectedMusic: music
    });
  },
  
  // 选择背景
  selectBackground(e) {
    const type = e.currentTarget.dataset.type;
    let backgroundPath = '';
    
    if (type !== 'none' && this.data.backgroundImages[type]) {
      backgroundPath = this.data.backgroundImages[type];
    }
    
    this.setData({
      selectedBackgroundType: type,
      selectedBackground: backgroundPath
    });
  },
  
  // 开始冥想
  startMeditation() {
    try {
      // 重置状态 - 添加防御性检查确保数值有效
      const selectedDuration = typeof this.data.selectedDuration === 'number' && this.data.selectedDuration > 0 ? this.data.selectedDuration : 5;
      const totalSeconds = selectedDuration * 60;
      
      this.setData({
        status: 'meditating',
        totalSeconds: totalSeconds,
        remainingSeconds: totalSeconds,
        progress: 0,
        instruction: '保持专注，感受当下',
        guidanceText: '保持平静，专注呼吸',
        currentEmoji: '🙏',
        formattedTime: this.formatTime(totalSeconds),
        startTimestamp: Date.now()
      });
      
      // 设置引导字幕定时更新
      this.guidanceInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - this.data.startTimestamp) / 1000);
        const guidanceTexts = [
          '感受气息的流动',
          '让思绪慢慢平静',
          '关注当下，放下杂念',
          '体会身体的放松',
          '保持自然的呼吸节奏'
        ];
        
        // 每30秒更换一次引导字幕
        if (elapsedTime > 0 && elapsedTime % 30 === 0) {
          const index = Math.floor(Math.random() * guidanceTexts.length);
          this.setData({
            guidanceText: guidanceTexts[index]
          });
        }
      }, 1000);
      
      // 清除旧计时器 - 确保timer存在且是有效的计时器ID
      if (this.data.timer && typeof this.data.timer === 'number') {
        try {
          clearInterval(this.data.timer);
          this.data.timer = null; // 显式设置为null
        } catch (clearErr) {
          console.log('清除计时器失败:', clearErr);
        }
      }
      
      // 安全地播放背景音乐 - 严格的空值和类型检查
      const { selectedMusic, audioContext } = this.data;
      if (selectedMusic !== 'none' && audioContext && typeof audioContext === 'object') {
        // 将音频操作包装在单独的try-catch中，确保即使失败也不会影响主功能
        try {
          // 确保在播放前停止任何可能正在播放的音频
          if (typeof audioContext.stop === 'function') {
            audioContext.stop();
          }
          
          // 延迟播放，确保状态已完全重置
          setTimeout(() => {
            // 再次检查audioContext是否仍然有效
            if (this.data.audioContext && typeof this.data.audioContext === 'object') {
              this.playBackgroundMusic();
            }
          }, 200);
        } catch (audioErr) {
          console.log('音频初始化失败:', audioErr);
          // 静默处理，不影响主功能
        }
      }
      
      // 开始呼吸引导 - 包装在try-catch中
      try {
        this.startBreathingGuide();
      } catch (breathingErr) {
        console.log('呼吸引导启动失败:', breathingErr);
        // 静默处理，继续执行
      }
      
      // 启动计时器 - 这是核心功能，必须确保执行
      try {
        this.data.timer = setInterval(() => {
          // 再次检查必要的状态
          if (this.data && typeof this.data.remainingSeconds === 'number' && typeof this.data.totalSeconds === 'number') {
            let remainingSeconds = this.data.remainingSeconds - 1;
            
            // 更新进度 - 确保不会出现NaN
            let progress = this.data.totalSeconds > 0 ? ((this.data.totalSeconds - remainingSeconds) / this.data.totalSeconds) * 100 : 0;
            
            if (remainingSeconds <= 0) {
              // 冥想完成
              if (this.data.timer) {
                clearInterval(this.data.timer);
              }
              try {
                this.stopBreathingGuide();
              } catch (e) {}
              try {
                this.stopBackgroundMusic();
              } catch (e) {}
              this.completeMeditation();
              return;
            }
            
            this.setData({
              remainingSeconds: remainingSeconds,
              progress: progress,
              formattedTime: this.formatTime(remainingSeconds)
            });
            
            // 最后10秒提示
            if (remainingSeconds === 10) {
              try {
                wx.vibrateLong();
                this.setData({
                  instruction: '即将结束，保持专注',
                  currentEmoji: '🌟'
                });
              } catch (vibrateErr) {
                console.log('振动提示失败:', vibrateErr);
              }
            }
          } else {
            // 如果状态无效，清除计时器
            if (this.data.timer) {
              clearInterval(this.data.timer);
              this.data.timer = null;
            }
            console.log('计时器状态无效，已停止');
          }
        }, 1000);
      } catch (timerErr) {
        console.log('启动计时器失败:', timerErr);
        // 如果计时器启动失败，至少尝试清理资源
        try {
          this.stopBreathingGuide();
        } catch (e) {}
        try {
          this.stopBackgroundMusic();
        } catch (e) {}
      }
    } catch (mainErr) {
      console.log('启动冥想过程中发生错误:', mainErr);
      // 即使主函数出错，也尝试设置为完成状态，避免界面卡住
      try {
        this.setData({ status: 'completed' });
      } catch (e) {
        console.log('设置完成状态失败:', e);
      }
    }
  },
  
  // 暂停冥想
  pauseMeditation() {
    clearInterval(this.data.timer);
    this.stopBreathingGuide();
    this.pauseBackgroundMusic();
    
    this.setData({
      status: 'paused',
      instruction: '冥想已暂停',
      currentEmoji: '⏸️'
    });
  },
  
  // 继续冥想
  resumeMeditation() {
    this.setData({
      status: 'meditating',
      instruction: '保持专注，感受当下',
      currentEmoji: '🙏'
    });
    
    // 恢复背景音乐
    this.resumeBackgroundMusic();
    
    // 恢复呼吸引导
    this.startBreathingGuide();
    
    // 恢复计时器
    this.data.timer = setInterval(() => {
      let remainingSeconds = this.data.remainingSeconds - 1;
      let progress = ((this.data.totalSeconds - remainingSeconds) / this.data.totalSeconds) * 100;
      
      if (remainingSeconds <= 0) {
        // 冥想完成
        clearInterval(this.data.timer);
        this.stopBreathingGuide();
        this.stopBackgroundMusic();
        this.completeMeditation();
        return;
      }
      
      this.setData({
        remainingSeconds: remainingSeconds,
        progress: progress,
        formattedTime: this.formatTime(remainingSeconds)
      });
    }, 1000);
  },
  
  // 重置冥想
  resetMeditation() {
    clearInterval(this.data.timer);
    // 清除引导字幕定时器
    if (this.guidanceInterval) {
      clearInterval(this.guidanceInterval);
      this.guidanceInterval = null;
    }
    this.stopBreathingGuide();
    this.stopBackgroundMusic();
    
    this.setData({
      status: 'ready',
      remainingSeconds: this.data.selectedDuration * 60,
      progress: 0,
      instruction: '准备开始冥想',
      currentEmoji: '🧘',
      formattedTime: this.formatTime(this.data.selectedDuration * 60)
    });
  },
  
  // 冥想完成
  completeMeditation() {
    // 整个函数包装在try-catch中，确保即使出错也能完成基本的UI更新
    try {
      // 清除计时器 - 静默处理，即使失败也继续执行
      try {
        if (this.data.timer && typeof this.data.timer === 'number') {
          clearInterval(this.data.timer);
          this.data.timer = null;
        }
        // 清除引导字幕定时器
        if (this.guidanceInterval) {
          clearInterval(this.guidanceInterval);
          this.guidanceInterval = null;
        }
      } catch (timerErr) {
        console.log('清除计时器失败:', timerErr);
      }
      
      // 停止呼吸引导 - 包装在独立的try-catch中
      try {
        this.stopBreathingGuide();
      } catch (breathingErr) {
        console.log('停止呼吸引导失败:', breathingErr);
      }
      
      // 停止背景音乐 - 包装在独立的try-catch中
      try {
        this.stopBackgroundMusic();
      } catch (musicErr) {
        console.log('停止背景音乐失败:', musicErr);
      }
      
      // 更新今日冥想记录 - 包装在独立的try-catch中
      try {
        const today = new Date().toDateString();
        let totalMinutes = this.data.totalMinutes + this.data.selectedDuration;
        
        wx.setStorageSync('meditationRecord', {
          date: today,
          totalMinutes: totalMinutes
        });
      } catch (storageErr) {
        console.log('更新冥想记录失败:', storageErr);
      }
      
      // 振动提示 - 包装在独立的try-catch中
      try {
        wx.vibrateShort();
      } catch (vibrateErr) {
        console.log('振动提示失败:', vibrateErr);
      }
      
      // 更新UI状态 - 这是关键操作，确保执行
      try {
        this.setData({
          status: 'completed',
          progress: 100,
          instruction: '冥想完成',
          currentEmoji: '✨',
          totalMinutes: this.data.totalMinutes + this.data.selectedDuration,
          formattedTime: '00:00',
          isAudioPlaying: false
        });
      } catch (uiErr) {
        console.log('更新UI状态失败:', uiErr);
      }
      
      // 显示完成提示 - 包装在独立的try-catch中
      try {
        wx.showToast({
          title: '冥想完成！',
          icon: 'success',
          duration: 2000
        });
      } catch (toastErr) {
        console.log('显示提示失败:', toastErr);
      }
    } catch (mainErr) {
      console.log('完成冥想过程中发生严重错误:', mainErr);
      // 作为最后的保障，即使整个函数执行失败，也要尝试更新UI状态
      try {
        this.setData({ 
          status: 'completed',
          isAudioPlaying: false 
        });
      } catch (finalErr) {
        console.log('最终UI状态更新也失败:', finalErr);
      }
    }
  },
  
  // 启动呼吸引导
  startBreathingGuide() {
    const breathingPattern = [
      { phase: 'inhaling', text: '吸气...', duration: 4, emoji: '🌬️', color1: '#4facfe', color2: '#00f2fe' },
      { phase: 'holding', text: '屏息...', duration: 4, emoji: '⏸️', color1: '#00f2fe', color2: '#4facfe' },
      { phase: 'exhaling', text: '呼气...', duration: 6, emoji: '💨', color1: '#00c6ff', color2: '#0072ff' }
    ];
    
    let currentPatternIndex = 0;
    
    this.data.breathingTimer = setInterval(() => {
      const pattern = breathingPattern[currentPatternIndex];
      
      this.setData({
        breathingInstruction: pattern.text,
        currentEmoji: pattern.emoji,
        currentColor1: pattern.color1,
        currentColor2: pattern.color2,
        pulseSpeed: pattern.duration
      });
      
      currentPatternIndex = (currentPatternIndex + 1) % breathingPattern.length;
    }, breathingPattern[currentPatternIndex].duration * 1000);
  },
  
  // 停止呼吸引导
  stopBreathingGuide() {
    if (this.data.breathingTimer) {
      clearInterval(this.data.breathingTimer);
      this.data.breathingTimer = null;
    }
  },
  
  // 播放背景音乐
  playBackgroundMusic() {
    const { selectedMusic, audioContext } = this.data;
    
    // 严格的空值检查
    if (selectedMusic === 'none' || !audioContext || typeof audioContext !== 'object') {
      console.log('音频上下文不可用');
      return;
    }
    
    // 确保selectedMusic有效
    const audioType = selectedMusic || 'rain';
    const audioPath = `/audio/${audioType}.mp3`;
    
    try {
      // 移除之前可能存在的事件监听器（避免重复监听）
      try {
        if (typeof audioContext.offError === 'function') {
          audioContext.offError();
        }
        if (typeof audioContext.offCanplay === 'function') {
          audioContext.offCanplay();
        }
      } catch (removeErr) {
        console.log('移除事件监听器失败:', removeErr);
        // 静默处理
      }
      
      // 设置音频参数，增加安全检查
      try {
        if (typeof audioContext.loop !== 'undefined') {
          audioContext.loop = true;
        }
        if (typeof audioContext.volume !== 'undefined') {
          audioContext.volume = 0.3;
        }
      } catch (paramErr) {
        console.log('设置音频参数失败:', paramErr);
        // 静默处理，继续执行
      }
      
      // 安全地重置音频上下文
      try {
        if (typeof audioContext.stop === 'function') {
          audioContext.stop();
        }
      } catch (stopErr) {
        console.log('停止音频失败:', stopErr);
        // 静默处理，继续执行
      }
      
      // 安全地设置src
      try {
        audioContext.src = ''; // 清除之前的源
        audioContext.src = audioPath;
      } catch (srcErr) {
        console.log('设置音频源失败:', srcErr);
        this.setData({ isAudioPlaying: false });
        return;
      }
      
      // 错误处理函数
      const handleAudioError = (err) => {
        console.log(`音频(${audioType})播放错误:`, err);
        
        // 备选音频机制 - 但更加安全
        try {
          const fallbackAudioTypes = ['rain', 'forest', 'waves'].filter(type => type !== audioType);
          
          // 移除当前错误监听
          if (typeof audioContext.offError === 'function') {
            audioContext.offError(handleAudioError);
          }
          
          // 尝试第一个备选音频
          if (fallbackAudioTypes.length > 0) {
            const firstFallback = fallbackAudioTypes[0];
            console.log(`尝试使用备选音频: ${firstFallback}`);
            
            try {
              if (typeof audioContext.src !== 'undefined') {
                audioContext.src = `/audio/${firstFallback}.mp3`;
                
                // 使用setTimeout避免立即触发错误
                setTimeout(() => {
                  try {
                    if (typeof audioContext.play === 'function') {
                      audioContext.play();
                      console.log(`备选音频(${firstFallback})开始播放尝试`);
                    }
                  } catch (playErr) {
                    console.log(`备选音频(${firstFallback})播放失败:`, playErr);
                    // 最终失败，不继续尝试
                  }
                }, 100);
              }
            } catch (fallbackErr) {
              console.log(`切换到备选音频(${firstFallback})失败:`, fallbackErr);
            }
          }
        } catch (e) {
          console.log('处理音频备选失败:', e);
        }
        
        // 确保状态正确
        this.setData({ isAudioPlaying: false });
      };
      
      // 安全地添加错误监听
      if (typeof audioContext.onError === 'function') {
        audioContext.onError(handleAudioError);
      }
      
      // 安全地添加canplay监听
      if (typeof audioContext.onCanplay === 'function') {
        audioContext.onCanplay(() => {
          console.log('音频可播放');
          try {
            if (typeof audioContext.play === 'function') {
              audioContext.play();
              this.setData({ isAudioPlaying: true });
            }
          } catch (e) {
            console.log('播放失败:', e);
            this.setData({ isAudioPlaying: false });
          }
        });
      } else {
        // 如果onCanplay不可用，使用setTimeout作为备选方案
        setTimeout(() => {
          try {
            if (typeof audioContext.play === 'function') {
              audioContext.play();
              this.setData({ isAudioPlaying: true });
            }
          } catch (e) {
            console.log('延迟播放失败:', e);
            this.setData({ isAudioPlaying: false });
          }
        }, 300);
      }
      
    } catch (e) {
      console.log('播放背景音乐过程中发生错误:', e);
      this.setData({ isAudioPlaying: false });
    }
  },
  
  // 暂停背景音乐
  pauseBackgroundMusic() {
    const { audioContext, isAudioPlaying } = this.data;
    
    // 严格的空值检查和类型检查
    if (!audioContext || typeof audioContext !== 'object' || !isAudioPlaying) {
      return;
    }
    
    try {
      // 安全地调用pause方法
      if (typeof audioContext.pause === 'function') {
        audioContext.pause();
      }
      // 无论pause是否成功，都更新状态
      this.setData({ isAudioPlaying: false });
    } catch (e) {
      console.log('暂停背景音乐失败:', e);
      // 确保状态正确更新
      this.setData({ isAudioPlaying: false });
    }
  },
  
  // 停止背景音乐
  stopBackgroundMusic() {
    const { audioContext } = this.data;
    
    // 严格的空值检查和类型检查
    if (!audioContext || typeof audioContext !== 'object') {
      return;
    }
    
    try {
      // 移除所有可能的事件监听器
      try {
        if (typeof audioContext.offError === 'function') {
          audioContext.offError();
        }
        if (typeof audioContext.offCanplay === 'function') {
          audioContext.offCanplay();
        }
        if (typeof audioContext.offPlay === 'function') {
          audioContext.offPlay();
        }
        if (typeof audioContext.offPause === 'function') {
          audioContext.offPause();
        }
        if (typeof audioContext.offStop === 'function') {
          audioContext.offStop();
        }
      } catch (removeErr) {
        console.log('移除事件监听器失败:', removeErr);
        // 继续执行，不中断流程
      }
      
      // 安全地调用stop方法
      if (typeof audioContext.stop === 'function') {
        audioContext.stop();
      }
      
      // 清空src以释放资源
      try {
        if (typeof audioContext.src !== 'undefined') {
          audioContext.src = '';
        }
      } catch (srcErr) {
        console.log('清空音频源失败:', srcErr);
      }
      
      // 更新播放状态
      this.setData({ isAudioPlaying: false });
    } catch (e) {
      console.log('停止背景音乐失败:', e);
      // 确保状态正确更新
      this.setData({ isAudioPlaying: false });
    }
  },
  
  // 恢复背景音乐
  resumeBackgroundMusic() {
    const { selectedMusic, audioContext, isAudioPlaying } = this.data;
    
    // 严格的空值检查和类型检查
    if (selectedMusic === 'none' || !audioContext || typeof audioContext !== 'object' || isAudioPlaying) {
      return;
    }
    
    try {
      // 检查是否已经有有效的src，如果没有则重新设置
      if (typeof audioContext.src === 'undefined' || !audioContext.src) {
        try {
          audioContext.src = `/audio/${selectedMusic}.mp3`;
        } catch (srcErr) {
          console.log('设置音频源失败:', srcErr);
          return;
        }
      }
      
      // 使用更安全的方式恢复播放
      if (typeof audioContext.onCanplay === 'function') {
        // 移除之前可能存在的canplay监听
        try {
          if (typeof audioContext.offCanplay === 'function') {
            audioContext.offCanplay();
          }
        } catch (err) {
          console.log('移除canplay监听失败:', err);
        }
        
        // 添加新的canplay监听
        audioContext.onCanplay(() => {
          try {
            if (typeof audioContext.play === 'function') {
              audioContext.play();
              this.setData({ isAudioPlaying: true });
            }
          } catch (playErr) {
            console.log('恢复播放失败:', playErr);
            this.setData({ isAudioPlaying: false });
          }
        });
      } else {
        // 如果onCanplay不可用，使用setTimeout作为备选方案
        setTimeout(() => {
          try {
            if (typeof audioContext.play === 'function') {
              audioContext.play();
              this.setData({ isAudioPlaying: true });
            }
          } catch (playErr) {
            console.log('延迟恢复播放失败:', playErr);
            this.setData({ isAudioPlaying: false });
          }
        }, 200);
      }
    } catch (e) {
      console.log('恢复背景音乐失败:', e);
      this.setData({ isAudioPlaying: false });
    }
  },
  
  // 格式化时间
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },
  
  onUnload() {
    // 组件卸载时的完整资源清理，防止内存泄漏
    try {
      // 清除计时器 - 安全地清理计时器资源
      if (this.data.timer && typeof this.data.timer === 'number') {
        try {
          clearInterval(this.data.timer);
          this.data.timer = null;
        } catch (timerErr) {
          console.log('清除计时器失败:', timerErr);
        }
      }
      
      // 停止并清理音频播放 - 安全地移除所有音频事件监听器
      if (this.data.audioContext && typeof this.data.audioContext === 'object') {
        try {
          // 移除所有可能的事件监听器，避免内存泄漏
          if (typeof this.data.audioContext.off === 'function') {
            try {
              this.data.audioContext.off('error');
              this.data.audioContext.off('play');
              this.data.audioContext.off('pause');
              this.data.audioContext.off('stop');
              this.data.audioContext.off('ended');
              this.data.audioContext.off('timeupdate');
              this.data.audioContext.off('canplay');
              this.data.audioContext.off('waiting');
            } catch (offErr) {
              console.log('移除音频事件监听器失败:', offErr);
            }
          }
          
          // 停止音频播放
          if (typeof this.data.audioContext.stop === 'function') {
            try {
              this.data.audioContext.stop();
            } catch (stopErr) {
              console.log('停止音频失败:', stopErr);
            }
          }
          
          // 释放音频资源
          if (typeof this.data.audioContext.destroy === 'function') {
            try {
              this.data.audioContext.destroy();
            } catch (destroyErr) {
              console.log('销毁音频上下文失败:', destroyErr);
            }
          }
          
          // 确保引用被清除
          this.data.audioContext = null;
          this.data.isAudioPlaying = false;
        } catch (audioCleanupErr) {
          console.log('音频资源清理失败:', audioCleanupErr);
        }
      }
      
      // 停止呼吸引导 - 确保呼吸引导的定时器也被清理
      try {
        this.stopBreathingGuide();
        // 额外确保呼吸引导的定时器被清理
        if (this.data.breathingTimer && typeof this.data.breathingTimer === 'number') {
          clearInterval(this.data.breathingTimer);
          this.data.breathingTimer = null;
        }
      } catch (breathingErr) {
        console.log('停止呼吸引导失败:', breathingErr);
      }
      
      console.log('冥想组件资源已成功清理');
    } catch (mainCleanupErr) {
      console.log('组件卸载清理过程中发生错误:', mainCleanupErr);
      // 即使清理过程出错，也要尝试重置关键状态
      try {
        this.data.audioContext = null;
        this.data.timer = null;
        this.data.breathingTimer = null;
        this.data.isAudioPlaying = false;
      } catch (resetErr) {
        console.log('重置状态失败:', resetErr);
      }
    }
  }
});