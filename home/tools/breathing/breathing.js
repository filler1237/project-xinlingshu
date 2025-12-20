// home/tools/breathing/breathing.js
Page({
  // 返回上一级页面
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  },
  data: {
    status: 'ready', // ready, inhaling, holding, exhaling, paused
    instruction: '准备开始',
    countdown: 0,
    progress: 0,
    animationType: 'none',
    inhaleTime: 4,
    holdTime: 7,
    exhaleTime: 8,
    cycleCount: 0,
    totalCycles: 3,
    statusBarHeight: 0,
    navBarHeight: 44, // Default navigation bar height
    totalNavHeight: 0, // Total height for padding
    timer: null,
    // 保存暂停时的状态，用于恢复
    pausedStep: 0,
    pausedCycle: 1,
    pausedTotalSteps: 0,
    pausedPhaseSteps: 0
  },

  startBreathing() {
    this.setData({
      status: 'inhaling',
      progress: 0,
      countdown: this.data.inhaleTime,
      instruction: '缓慢吸气',
      animationType: 'inhaling',
      pausedStep: 0,
      pausedCycle: 1,
      pausedTotalSteps: 0,
      pausedPhaseSteps: 0
    });

    this._continueBreathing(0, 1, 0, 0);
  },

  // 从暂停状态继续呼吸练习
  resumeBreathing() {
    const { pausedStep, pausedCycle, pausedTotalSteps, pausedPhaseSteps } = this.data;
    const statusMap = ['inhaling', 'holding', 'exhaling'];
    const instructionMap = ['缓慢吸气', '保持屏息', '缓缓呼气'];

    this.setData({
      status: statusMap[pausedStep],
      animationType: statusMap[pausedStep],
      instruction: instructionMap[pausedStep]
    });

    this._continueBreathing(pausedStep, pausedCycle, pausedTotalSteps, pausedPhaseSteps);
  },

  // 内部方法：继续呼吸练习逻辑
  _continueBreathing(cycleStep, currentCycle, totalSteps, phaseSteps) {
    const totalBreathingSteps = (this.data.inhaleTime + this.data.holdTime + this.data.exhaleTime) * this.data.cycles;

    this.data.timer = setInterval(() => {
      // 检查是否已被暂停
      if (this.data.status === 'paused') {
        clearInterval(this.data.timer);
        return;
      }

      totalSteps++;
      phaseSteps++;

      // 保存当前状态，用于暂停后恢复
      this.setData({
        pausedStep: cycleStep,
        pausedCycle: currentCycle,
        pausedTotalSteps: totalSteps,
        pausedPhaseSteps: phaseSteps
      });

      const progress = Math.min((totalSteps / totalBreathingSteps) * 100, 100);

      if (cycleStep === 0) { // 吸气阶段
        const countdown = this.data.inhaleTime - phaseSteps;
        this.setData({ countdown: countdown });

        if (countdown <= 0) {
          cycleStep = 1;
          phaseSteps = 0;
          this.setData({
            status: 'holding',
            countdown: this.data.holdTime,
            instruction: '保持屏息',
            animationType: 'holding'
          });
        }
      } else if (cycleStep === 1) { // 屏息阶段
        const countdown = this.data.holdTime - phaseSteps;
        this.setData({ countdown: countdown });

        if (countdown <= 0) {
          cycleStep = 2;
          phaseSteps = 0;
          this.setData({
            status: 'exhaling',
            countdown: this.data.exhaleTime,
            instruction: '缓缓呼气',
            animationType: 'exhaling'
          });
        }
      } else { // 呼气阶段
        const countdown = this.data.exhaleTime - phaseSteps;
        this.setData({ countdown: countdown });

        if (countdown <= 0) {
          currentCycle++;
          phaseSteps = 0;

          if (currentCycle > this.data.cycles) {
            // 完成所有循环
            this.stopBreathing();
            this.setData({
              status: 'ready',
              instruction: '完成练习！🎉',
              progress: 100,
              animationType: 'finished'
            });
            return;
          }

          cycleStep = 0;
          this.setData({
            status: 'inhaling',
            countdown: this.data.inhaleTime,
            instruction: '缓慢吸气',
            animationType: 'inhaling'
          });
        }
      }

      this.setData({ progress: progress });
    }, 1000);
  },

  stopBreathing() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.data.timer = null;
    }

    // 只有在练习进行中才更新为暂停状态
    if (this.data.status !== 'ready' && this.data.status !== 'paused') {
      this.setData({
        status: 'paused',
        instruction: '练习已暂停',
        animationType: 'paused'
      });
    }
  },

  resetBreathing() {
    this.stopBreathing();
    this.setData({
      status: 'ready',
      progress: 0,
      countdown: 0,
      instruction: '准备开始',
      animationType: ''
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.stopBreathing();
  }
})