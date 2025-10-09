// home/card/card.js
const tarotData = require('./tarot-data.js');

Page({
  data: {
    fullDeck: [],
    selectedCards: [],
    analysisResult: '',
    isLoading: false,
  },

  onLoad: function () {
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

    wx.cloud.callFunction({
      name: 'analyzeTarot',
      data: {
        selectedCards: this.data.selectedCards,
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
        this.setData({ isLoading: false });
      }
    });
  },
});
