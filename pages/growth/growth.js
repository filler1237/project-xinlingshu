// pages/growth/growth.js
const MINDFULNESS_TASKS = [
  { id: 1, title: '深呼吸练习', content: '请闭上眼睛，慢慢深呼吸 5 次。吸气... 呼气...', reward: 20 },
  { id: 2, title: '感恩时刻', content: '想一件今天发生的让你开心的小事。', reward: 15 },
  { id: 3, title: '感受当下', content: '环顾四周，找出 3 种蓝色的物体。', reward: 15 },
  { id: 4, title: '肩颈放松', content: '轻轻转动你的头部和肩膀，释放压力。', reward: 10 }
];

// 徽章元数据兜底字典
const BADGE_METADATA = {
  // 注意：这里的 iconUrl 使用了现有的水滴图标作为占位符，请您后续在云存储上传真实的徽章图片并替换此处路径
  'badge_watering_30': { name: '深根固柢', desc: '累计浇水30次，你的坚持让大树根深叶茂。', iconUrl: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/水滴-copy.png' },
  'badge_mind_3': { name: '内观者', desc: '完成3次正念练习，开始向内探索内心世界。', iconUrl: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/水滴-copy.png' },
  // 如果有旧的ID，也在这里添加配置
  'badge_001': { name: '新绿之芽', desc: '拥有第一颗心理树。', iconUrl: 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/水滴-copy.png' }
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    growthValue: 0,
    treeLevel: 1,
    unlockedAchievements: [],
    isWatering: false,
    isAnimating: false,
    waterdrops: 0,
    todayTasks: [],
    isPanelExpanded: false,

    // --- 新增：正念果实相关 ---
    fruits: [], // 树上的果实
    showMindfulnessPopup: false,
    currentTask: null, // 当前选中的正念任务

    // --- 新增：徽章详情相关 ---
    showBadgePopup: false,
    selectedBadge: null,

    // --- 新增：浇水选择相关 ---
    showWateringPopup: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getGrowthData();
    // 模拟生成果实 (实际可由后端控制)
    this.generateRandomFruit();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getGrowthData();
  },

  getGrowthData() {
    return new Promise((resolve, reject) => {
      // 保持加载体验，但不频繁showLoading干扰动画
      // wx.showLoading({ title:'加载中...', mask:true }); 

      wx.cloud.callFunction({
        name: 'getUserGrowthData',
        success: res => {
          if (res.result.code === 0) {
            const data = res.result.data;
            const oldLevel = this.data.treeLevel;

            // 丰富徽章数据用于展示
            const enrichedAchievements = (data.unlockedAchievements || []).map(item => {
              // item 可能是字符串ID，也可能是对象
              const id = typeof item === 'string' ? item : (item._id || item.id);
              const backendData = typeof item === 'object' ? item : {};
              const localMeta = BADGE_METADATA[id] || {};

              // 混合数据：后端 > 本地 > 兜底
              return {
                _id: id,
                name: backendData.name || localMeta.name || '神秘徽章',
                // 兼容数据库中的 description 字段
                desc: backendData.desc || backendData.description || localMeta.desc || '继续探索以解锁更多详情。',
                iconUrl: backendData.iconUrl || localMeta.iconUrl || 'cloud://cloud1-2gxal8as6b6bfe21.636c-cloud1-2gxal8as6b6bfe21-1378381651/image/badge_default.png',
                date: backendData.date || '2025-12-16'
              };
            });

            if (oldLevel !== data.treeLevel && oldLevel !== 0) {
              // 升级动画逻辑
              this.setData({ isAnimating: true });
              setTimeout(() => {
                this.setData({
                  growthValue: data.growthValue,
                  treeLevel: data.treeLevel,
                  unlockedAchievements: enrichedAchievements,
                  waterdrops: data.waterdrops,
                  isAnimating: false,
                  todayTasks: data.tasks.map(task => ({
                    id: task.id, title: task.name, done: task.completed
                  }))
                });
              }, 1000);
            } else {
              this.setData({
                growthValue: data.growthValue,
                treeLevel: data.treeLevel,
                unlockedAchievements: enrichedAchievements,
                waterdrops: data.waterdrops,
                todayTasks: data.tasks.map(task => ({
                  id: task.id, title: task.name, done: task.completed
                }))
              });
            }
            // wx.hideLoading();
            resolve(data);
          } else {
            // wx.hideLoading();
            // 静默失败，不打扰用户
          }
        },
        fail: err => {
          // wx.hideLoading()
          console.error('[云函数]调用失败', err)
          reject(err);
        }
      });
    });
  },

  // --- 正念果实玩法 ---

  generateRandomFruit() {
    // 20% 概率生成一个果实
    if (Math.random() > 0.2) {
      const taskIndex = Math.floor(Math.random() * MINDFULNESS_TASKS.length);
      const fruit = {
        id: Date.now(),
        top: 20 + Math.random() * 40, // 随机位置 (20% - 60%)
        left: 20 + Math.random() * 60,
        task: MINDFULNESS_TASKS[taskIndex]
      };
      this.setData({ fruits: [fruit] }); // 目前逻辑只允许同时存在一颗，保持简单
    }
  },

  onPickFruit(e) {
    const { index } = e.currentTarget.dataset;
    const fruit = this.data.fruits[index];
    this.setData({
      showMindfulnessPopup: true,
      currentTask: fruit.task,
      pickingFruitIndex: index // 暂存索引以便移除
    });
  },

  closeMindfulnessPopup() {
    this.setData({ showMindfulnessPopup: false });
  },

  onCompleteMindfulnessTask() {
    const { currentTask, pickingFruitIndex, fruits } = this.data;

    // 移除果实 (乐观更新)
    const newFruits = [...fruits];
    newFruits.splice(pickingFruitIndex, 1);
    this.setData({
      showMindfulnessPopup: false,
      fruits: newFruits
    });

    wx.showLoading({ title: '吸收能量中...' });

    // 调用云函数
    wx.cloud.callFunction({
      name: 'waterTheTree',
      data: {
        actionType: 'mindfulness',
        rewardGrowth: currentTask.reward,
        rewardWater: 5 // 额外奖励水滴
      },
      success: res => {
        wx.hideLoading();
        if (res.result.code === 0) {
          wx.showToast({
            title: `能量+${currentTask.reward} 水滴+5`,
            icon: 'none'
          });

          // 检查是否有新徽章
          if (res.result.data.newUnlocks && res.result.data.newUnlocks.length > 0) {
            wx.showModal({
              title: '恭喜解锁新徽章！',
              content: '快去徽章墙看看吧',
              showCancel: false
            });
          }

          // 刷新数据
          this.getGrowthData();
        } else {
          wx.showToast({ title: '任务记录失败', icon: 'none' });
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error('正念任务调用失败', err);
      }
    });
  },

  // --- 徽章详情弹窗 ---

  showBadgeDetail(e) {
    const { badge } = e.currentTarget.dataset;
    this.setData({
      selectedBadge: badge,
      showBadgePopup: true
    });
  },

  closeBadgePopup() {
    this.setData({ showBadgePopup: false });
  },

  // --- 浇水逻辑升级 ---

  // 1. 打开选择面板
  onWatering() {
    if (this.data.waterdrops <= 0) {
      wx.showToast({ title: '水滴不足', icon: 'none' });
      return;
    }
    this.setData({ showWateringPopup: true });
  },

  closeWateringPopup() {
    this.setData({ showWateringPopup: false });
  },

  // 2. 确认浇水
  onConfirmWater(e) {
    let amount = e.currentTarget.dataset.amount;

    // 如果选择是 'all'，则不需要传具体数值给 doWatering，后端如果不传amount默认就是all
    // 但为了前端显示 "+X"，我们最好知道是多少
    if (amount === 'all') {
      amount = this.data.waterdrops;
    } else {
      amount = parseInt(amount);
      if (this.data.waterdrops < amount) {
        wx.showToast({ title: '水滴不足', icon: 'none' });
        return;
      }
    }

    this.setData({ showWateringPopup: false });
    this.doWatering(amount);
  },

  // 3. 执行浇水
  doWatering(amount) {
    if (this.data.isWatering || this.data.isAnimating) return;

    this.setData({ isWatering: true });

    wx.cloud.callFunction({
      name: 'waterTheTree',
      data: {
        actionType: 'water',
        amount: amount // 传入具体数量
      },
      success: res => {
        if (res.result.code === 0) {
          setTimeout(() => {
            this.getGrowthData().then(data => {
              wx.showToast({
                title: `浇水成功 +${amount}`,
                icon: 'none',
                duration: 2000
              });

              if (res.result.data.newUnlocks && res.result.data.newUnlocks.length > 0) {
                wx.showModal({
                  title: '恭喜解锁新徽章！',
                  content: '快去徽章墙看看吧',
                  showCancel: false
                });
              }
            });
          }, 2000);
        } else {
          wx.showToast({ title: res.result.message || '浇水失败', icon: 'none' });
          this.setData({ isWatering: false });
        }
      },
      fail: err => {
        this.setData({ isWatering: false });
      }
    });

    setTimeout(() => {
      this.setData({ isWatering: false });
    }, 2000);
  },

  onPanelToggle(e) {
    this.setData({ isPanelExpanded: e.detail.isExpanded });
  },

  // 防止弹窗点击穿透
  doNothing() { }
})
