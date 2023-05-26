// 获取小程序实例
var app = getApp()

// 定义所有卡牌的数组
var allCard = ['card1', 'card2', 'card3', 'card4', 'card5', 'card6', 'card7', 'card8', 'card9', 'card10'];

// 定义卡牌的背面图片地址
var backCardImage = "../images/background4.jpg"

// 定义页面对象
Page({
  // 初始数据
  data: {
    clickNum: 0,      // 点击次数 
    checked: 0,       // 已匹配牌数
    allCard: allCard,    // 全部卡牌数组
    backImage: backCardImage, // 牌背面 图片地址
    modalHidden: true,    // 游戏完成提示是否显示
    firstX: -1,        // 点击的第一张卡牌的坐标 
    firstY: -1,
    cards: [],        // 随机挑选出来的牌   
    size: 6,        // 界面显示的牌数=size*2
    clickable: false,    // 当前是否可点击
  },

  // 开始游戏
  startGame: function () {
    // 获取当前页面对象的数据
    var data = this.data;

    // 缓存当前页面对象
    var that = this;

    // 打乱所有卡牌顺序，挑选出size/2张牌
    var tmp = this.data.allCard.sort(function (a, b) { return Math.random() > .5 ? -1 : 1; }).splice(0, Math.floor(data.size));

    // 添加图片src和卡牌翻转状态state,存在二维数组方便展示
    var cards = [];
    var ix = -1; var iy = 0;
    for (var i in tmp) {
      if (i % 3 == 0) {
        cards.push([]);
        ix++; iy = 0;
      }
      cards[ix].push({
        src: 'cloud://tuxls-4gadsqlb8cd8de9e.7475-tuxls-4gadsqlb8cd8de9e-1317306213/image/' + tmp[i] + '.jpg',
        state: 1   // 为1时显示图片,为0时显示牌背面
      });
    }

    // 更新页面数据
    this.data.cards = cards;
    this.setData({
      cards: cards,
      clickNum: 0,
      checked: 0,
      firstX: -1,
      clickable: false
    });

    // 延时0毫秒后，将所有牌翻到背面
    var that = this;
    setTimeout(function () {
      that.turnAllBack();
      console.log('turn all back');
      data.clickable = true;
    }, 0);
  },

  // 点击卡牌
  onTap: function (event) {
    // 缓存当前页面对象和页面数据
    var that = this;
    var data = this.data;

    // 获取点击对象的坐标
    var ix = event.currentTarget.dataset.ix;
    var iy = event.currentTarget.dataset.iy;
    console.log('onTap ' + ix + ' ' + iy);

    // 如果点击的不是未翻过来的牌或者现在不让点，直接返回
    if (data.cards[ix][iy].state != 0 || !data.clickable)
      return;
    else {
      // 将该牌翻过来
      data.cards[ix][iy].state = 1;
      data.firstX = ix;
      data.firstY = iy;

      // 更新页面数据
      that.setData({ cards: data.cards });
    }
    console.log(this.data.cards);
  },

  // 将所有牌翻到背面
  turnAllBack: function () {
    for (var ix in this.data.cards)
      for (var iy in this.data.cards[ix])
        this.data.cards[ix][iy].state = 0;

    // 更新页面数据
    this.setData({ cards: this.data.cards });
  },

  // 页面加载
  onLoad: function () {
    // 开始游戏
    this.startGame();
    console.log(this.data.cards);
  }
})