// home/card/card.js
const tarotData = require('./tarot-data.js');

Page({
  data: {
    fullDeck: [],
    selectedCards: [],
    analysisResult: '',
    isLoading: false,
    userQuestion: '',
    factInterval: null,
    currentFact: '',
    tarotFacts: [
      "塔罗牌分为22张大阿尔卡那和56张小阿尔卡那。",
      "圣杯牌组通常与情感、关系和直觉相关。",
      "权杖牌组代表创造力、激情和行动力。",
      "宝剑牌组象征思想、挑战和智慧。",
      "星币牌组与物质世界、财务和工作有关。",
      "逆位牌不一定代表坏事，它可能意味着能量的堵塞或内在的反思。",
      "大阿尔卡那代表生命中的重要课题和转折点。",
      "小阿尔卡那则反映了日常生活的具体事件和挑战。",
      "宫廷牌（侍从、骑士、王后、国王）可以代表人，也可以代表一种行事风格。",
      "抽牌时的心态很重要，保持开放和诚实能让你获得更清晰的指引。",
      "塔罗牌不是预测未来的绝对工具，而是提供一种可能性和内在洞察的镜子。"
    ]
  },

  onLoad: function (options) {
    if (options.question) {
      this.setData({
        userQuestion: decodeURIComponent(options.question)
      });
    }
    this.initGame();
  },

  onBackTap: function(e) {
    wx.navigateBack({
      delta: 1,
    })
  },

  initGame: function () {
    let deck = [...tarotData.majorArcana, ...tarotData.minorArcana];

    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    this.setData({
      fullDeck: deck.map(card => ({
        ...card,
        isReversed: Math.random() < 0.5,
        frontImage: card.image_path,
        isFlipped: false, // Add isFlipped state for animation
      })),
      selectedCards: [],
      analysisResult: '', // Reset analysis on new game
    });
  },

  handleDealTap: function () {
    if (this.data.selectedCards.length >= 3) {
      return; // Stop if 3 cards are already selected
    }

    const remainingDeck = this.data.fullDeck.slice(this.data.selectedCards.length);
    if (remainingDeck.length === 0) return;

    const newCard = remainingDeck[0];
    const newSelectedCards = [...this.data.selectedCards, newCard];
    const cardIndex = newSelectedCards.length - 1;

    this.setData({
      selectedCards: newSelectedCards,
    });

    // Delay the flip animation
    setTimeout(() => {
      this.setData({
        [`selectedCards[${cardIndex}].isFlipped`]: true,
      });
    }, 500); // 500ms delay for the card to move into place
  },

  handleRetry: function () {
    this.initGame();
  },

  viewResult: function () {
    if (this.data.selectedCards.length < 3 || this.data.isLoading) {
      return;
    }

    this.setData({ isLoading: true });

    // Start showing tarot facts
    const facts = this.data.tarotFacts;
    this.setData({
      currentFact: facts[Math.floor(Math.random() * facts.length)]
    });

    const factInterval = setInterval(() => {
      this.setData({
        currentFact: facts[Math.floor(Math.random() * facts.length)]
      });
    }, 3000);

    this.setData({ factInterval: factInterval });

    wx.cloud.callFunction({
      name: 'analyzeTarot',
      data: {
        selectedCards: this.data.selectedCards,
        question: this.data.userQuestion
      },
      success: res => {
        this.setData({
          analysisResult: res.result.analysisResult,
        });
      },
      fail: err => {
        console.error('[云函数] [analyzeTarot] 调用失败', err);
        wx.showToast({
          title: '分析失败，请重试',
          icon: 'none',
        });
      },
      complete: () => {
        clearInterval(this.data.factInterval); // Stop the interval
        this.setData({ isLoading: false, factInterval: null });
      }
    });
  },
});
