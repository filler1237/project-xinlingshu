// home/divination/divination.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hexagram: [], // 存储六个爻的结果
    result: null, // 修改：存储结构化的解读结果
    isResultObject: false, // 新增：用于WXML判断result类型
    isDivining: false, // 是否正在起卦
    throwCount: 0, // 投掷次数
    canThrow: true, // 是否可以投掷
    coins: [
      { value: 0, animationClass: '' },
      { value: 0, animationClass: '' },
      { value: 0, animationClass: '' }
    ], // 存储三枚硬币的状态
  },

  /**
   * 模拟投掷三枚铜钱
   */
  throwCoins() {
    if (!this.data.canThrow) {
      return;
    }

    this.setData({ isDivining: true, canThrow: false });

    // 重置动画
    this.setData({
      'coins[0].animationClass': '',
      'coins[1].animationClass': '',
      'coins[2].animationClass': '',
    });

    // 模拟三枚铜钱，正面为3，反面为2
    const coin1 = Math.floor(Math.random() * 2) + 2;
    const coin2 = Math.floor(Math.random() * 2) + 2;
    const coin3 = Math.floor(Math.random() * 2) + 2;
    const sum = coin1 + coin2 + coin3;

    // 触发动画
    setTimeout(() => {
      this.setData({
        'coins[0].animationClass': coin1 === 3 ? 'flip-heads' : 'flip-tails',
        'coins[1].animationClass': coin2 === 3 ? 'flip-heads' : 'flip-tails',
        'coins[2].animationClass': coin3 === 3 ? 'flip-heads' : 'flip-tails',
      });
    }, 100);


    let line;
    // 6: 老阴 (--) x
    // 7: 少阳 (—)
    // 8: 少阴 (--)
    // 9: 老阳 (—) o
    switch (sum) {
      case 6:
        line = { type: 'old_yin', value: 6, symbol: '⚋', isChanging: true };
        break;
      case 7: // 两反一正，为少阴
        line = { type: 'young_yin', value: 8, symbol: '⚋', isChanging: false };
        break;
      case 8: // 两正一反，为少阳
        line = { type: 'young_yang', value: 7, symbol: '⚊', isChanging: false };
        break;
      case 9:
        line = { type: 'old_yang', value: 9, symbol: '⚊', isChanging: true };
        break;
    }

    const newHexagram = [...this.data.hexagram, line]; // 修正：将新爻添加到数组末尾
    const newThrowCount = this.data.throwCount + 1;

    setTimeout(() => {
      this.setData({
        hexagram: newHexagram,
        throwCount: newThrowCount,
        isDivining: false,
        canThrow: newThrowCount < 6,
      });

      if (newThrowCount === 6) {
        this.analyzeHexagram(newHexagram);
      }
    }, 1200); // 增加延迟以等待动画完成
  },

  /**
   * 解析卦象 - 调用云函数
   */
  analyzeHexagram(hexagram) {
    wx.showLoading({
      title: 'AI 正在解读...',
    });

    const movingLinesCount = hexagram.filter(line => line.isChanging).length;

    // 1. 获取本卦的爻符号 (数组顺序已经是初爻到上爻，无需反转)
    const originalLines = hexagram.map(l => l.symbol);

    // 2. 获取变卦的爻符号
    let changedLines = null;
    if (movingLinesCount > 0) {
      changedLines = hexagram.map(l => {
        if (l.isChanging) {
          return l.symbol === '⚊' ? '⚋' : '⚊';
        }
        return l.symbol;
      });
    }
    
    // 如果是六爻全动，传递对卦的爻符号
    if (movingLinesCount === 6) {
        changedLines = this.getOppositeHexagram(originalLines);
    }

    const cloudCallData = {
      originalLines: originalLines.join(''), // 传递字符串
      changedLines: changedLines ? changedLines.join('') : null,
      movingLinesCount: movingLinesCount,
    };

    // 3. 调用云函数
    wx.cloud.callFunction({
      name: 'analyzeHexagram',
      data: cloudCallData
    }).then(res => {
      wx.hideLoading();
      if (res.result && res.result.success) {
        this.setData({
          result: res.result.analysis, // 现在 analysis 是一个对象
          isResultObject: true
        });
      } else {
        // 保持错误信息为字符串，以便前端可以区分
        this.setData({
          result: '解读失败，请稍后再试。\n' + (res.result ? res.result.error : '未知错误'),
          isResultObject: false
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('调用云函数失败', err);
      this.setData({
        result: '网络错误，调用云函数失败，请检查网络连接或稍后再试。'
      });
    });
  },

  // 不再需要 getHexagramInfo 函数，因为 AI 会直接处理

  /**
   * 获取对卦（所有爻都取反）
   */
  getOppositeHexagram(lines) {
    return lines.map(line => (line === '⚊' ? '⚋' : '⚊'));
  },

  /**
   * 重置
   */
  reset() {
    this.setData({
      hexagram: [],
      result: null,
      isResultObject: false,
      throwCount: 0,
      canThrow: true,
      coins: [
        { value: 0, animationClass: '' },
        { value: 0, animationClass: '' },
        { value: 0, animationClass: '' }
      ],
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 在这里可以加载完整的64卦数据
  },
})
