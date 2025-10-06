// home/card/tarot-data.js

const majorArcana = [
  {
    id: 0,
    name: '愚人 (The Fool)',
    image_path: '/Cards-jpg/00-TheFool.jpg', // 图片路径占位符
    meaning_up: '开始，天真，自发性，自由精神',
    meaning_rev: '天真，鲁莽，冒险'
  },
  {
    id: 1,
    name: '魔术师 (The Magician)',
    image_path: '/Cards-jpg/01-TheMagician.jpg',
    meaning_up: '显化，足智多谋，权力，灵感',
    meaning_rev: '操纵，计划不周，才能未被利用'
  },
  {
    id: 2,
    name: '女祭司 (The High Priestess)',
    image_path: '/Cards-jpg/02-TheHighPriestess.jpg',
    meaning_up: '直觉，神圣的女性，潜意识',
    meaning_rev: '秘密，脱离直觉，压抑的感情'
  },
  {
    id: 3,
    name: '皇后 (The Empress)',
    image_path: '/Cards-jpg/03-TheEmpress.jpg',
    meaning_up: '女性气质，美丽，自然，养育',
    meaning_rev: '创意受阻，依赖他人'
  },
  {
    id: 4,
    name: '皇帝 (The Emperor)',
    image_path: '/Cards-jpg/04-TheEmperor.jpg',
    meaning_up: '权威，结构，控制，父亲形象',
    meaning_rev: '专横，僵化，控制欲强'
  },
  {
    id: 5,
    name: '教皇 (The Hierophant)',
    image_path: '/Cards-jpg/05-TheHierophant.jpg',
    meaning_up: '传统，整合，信仰，制度',
    meaning_rev: '挑战传统，墨守成规'
  },
  {
    id: 6,
    name: '恋人 (The Lovers)',
    image_path: '/Cards-jpg/06-TheLovers.jpg',
    meaning_up: '爱，和谐，关系，价值观对齐',
    meaning_rev: '不和谐，失衡，价值观错位'
  },
  {
    id: 7,
    name: '战车 (The Chariot)',
    image_path: '/Cards-jpg/07-TheChariot.jpg',
    meaning_up: '控制，意志力，胜利，行动',
    meaning_rev: '失控，缺乏方向，侵略性'
  },
  {
    id: 8,
    name: '力量 (Strength)',
    image_path: '/Cards-jpg/08-Strength.jpg',
    meaning_up: '力量，勇气，说服，影响力',
    meaning_rev: '软弱，自我怀疑，缺乏自信'
  },
  {
    id: 9,
    name: '隐士 (The Hermit)',
    image_path: '/Cards-jpg/09-TheHermit.jpg',
    meaning_up: '灵魂探索，内省，孤独',
    meaning_rev: '孤立，孤独，退缩'
  },
  {
    id: 10,
    name: '命运之轮 (Wheel of Fortune)',
    image_path: '/Cards-jpg/10-WheelOfFortune.jpg',
    meaning_up: '好运，业力，生命周期，转折点',
    meaning_rev: '厄运，阻力，破局'
  },
  {
    id: 11,
    name: '正义 (Justice)',
    image_path: '/Cards-jpg/11-Justice.jpg',
    meaning_up: '正义，公平，真理，因果',
    meaning_rev: '不公，不负责任，不诚实'
  },
  {
    id: 12,
    name: '倒吊人 (The Hanged Man)',
    image_path: '/Cards-jpg/12-TheHangedMan.jpg',
    meaning_up: '暂停，限制，新的视角',
    meaning_rev: '停滞，优柔寡断，拖延'
  },
  {
    id: 13,
    name: '死神 (Death)',
    image_path: '/Cards-jpg/13-Death.jpg',
    meaning_up: '结束，转变，过渡',
    meaning_rev: '抗拒改变，无法前进'
  },
  {
    id: 14,
    name: '节制 (Temperance)',
    image_path: '/Cards-jpg/14-Temperance.jpg',
    meaning_up: '平衡，温和，耐心，目的',
    meaning_rev: '失衡，过度，缺乏长远眼光'
  },
  {
    id: 15,
    name: '恶魔 (The Devil)',
    image_path: '/Cards-jpg/15-TheDevil.jpg',
    meaning_up: '束缚，成瘾，物质主义',
    meaning_rev: '挣脱束缚，独立，恢复控制'
  },
  {
    id: 16,
    name: '塔 (The Tower)',
    image_path: '/Cards-jpg/16-TheTower.jpg',
    meaning_up: '突变，剧变，混乱，启示',
    meaning_rev: '避免灾难，害怕改变'
  },
  {
    id: 17,
    name: '星星 (The Star)',
    image_path: '/Cards-jpg/17-TheStar.jpg',
    meaning_up: '希望，信念，目标，更新',
    meaning_rev: '绝望，缺乏信念，迷失方向'
  },
  {
    id: 18,
    name: '月亮 (The Moon)',
    image_path: '/Cards-jpg/18-TheMoon.jpg',
    meaning_up: '幻觉，恐惧，焦虑，潜意识',
    meaning_rev: '释放恐惧，真相大白'
  },
  {
    id: 19,
    name: '太阳 (The Sun)',
    image_path: '/Cards-jpg/19-TheSun.jpg',
    meaning_up: '积极，乐趣，温暖，成功',
    meaning_rev: '内心幼稚，过于乐观，缺乏成功'
  },
  {
    id: 20,
    name: '审判 (Judgement)',
    image_path: '/Cards-jpg/20-Judgement.jpg',
    meaning_up: '审判，重生，内心召唤，赦免',
    meaning_rev: '自我怀疑，无视召唤'
  },
  {
    id: 21,
    name: '世界 (The World)',
    image_path: '/Cards-jpg/21-TheWorld.jpg',
    meaning_up: '完成，整合，成就，旅行',
    meaning_rev: '未完成，走捷径，延迟'
  }
];

const minorArcana = [
  // Wands (权杖)
  { id: 22, name: '权杖 Ace', image_path: '/Cards-jpg/Wands01.jpg', meaning_up: '创造力, 意志力', meaning_rev: '缺乏动力' },
  { id: 23, name: '权杖 Two', image_path: '/Cards-jpg/Wands02.jpg', meaning_up: '计划, 决策', meaning_rev: '恐惧未知' },
  { id: 24, name: '权杖 Three', image_path: '/Cards-jpg/Wands03.jpg', meaning_up: '扩张, 远见', meaning_rev: '延迟, 障碍' },
  { id: 25, name: '权杖 Four', image_path: '/Cards-jpg/Wands04.jpg', meaning_up: '庆祝, 和谐', meaning_rev: '不稳定' },
  { id: 26, name: '权杖 Five', image_path: '/Cards-jpg/Wands05.jpg', meaning_up: '冲突, 竞争', meaning_rev: '避免冲突' },
  { id: 27, name: '权杖 Six', image_path: '/Cards-jpg/Wands06.jpg', meaning_up: '胜利, 认可', meaning_rev: '自负, 失利' },
  { id: 28, name: '权杖 Seven', image_path: '/Cards-jpg/Wands07.jpg', meaning_up: '挑战, 坚持', meaning_rev: '不知所措' },
  { id: 29, name: '权杖 Eight', image_path: '/Cards-jpg/Wands08.jpg', meaning_up: '行动, 速度', meaning_rev: '延迟, 沮丧' },
  { id: 30, name: '权杖 Nine', image_path: '/Cards-jpg/Wands09.jpg', meaning_up: '韧性, 防御', meaning_rev: '偏执, 防御性' },
  { id: 31, name: '权杖 Ten', image_path: '/Cards-jpg/Wands10.jpg', meaning_up: '负担, 责任', meaning_rev: '不堪重负' },
  { id: 32, name: '权杖 Page', image_path: '/Cards-jpg/Wands11.jpg', meaning_up: '热情, 探索', meaning_rev: '缺乏方向' },
  { id: 33, name: '权杖 Knight', image_path: '/Cards-jpg/Wands12.jpg', meaning_up: '能量, 激情', meaning_rev: '冲动, 轻率' },
  { id: 34, name: '权杖 Queen', image_path: '/Cards-jpg/Wands13.jpg', meaning_up: '自信, 独立', meaning_rev: '嫉妒, 要求高' },
  { id: 35, name: '权杖 King', image_path: '/Cards-jpg/Wands14.jpg', meaning_up: '领导, 远见', meaning_rev: '专横, 无情' },
  // Cups (圣杯)
  { id: 36, name: '圣杯 Ace', image_path: '/Cards-jpg/Cups01.jpg', meaning_up: '爱, 情感', meaning_rev: '情感压抑' },
  { id: 37, name: '圣杯 Two', image_path: '/Cards-jpg/Cups02.jpg', meaning_up: '团结, 伙伴', meaning_rev: '不和谐' },
  { id: 38, name: '圣杯 Three', image_path: '/Cards-jpg/Cups03.jpg', meaning_up: '庆祝, 友谊', meaning_rev: '孤独, 丑闻' },
  { id: 39, name: '圣杯 Four', image_path: '/Cards-jpg/Cups04.jpg', meaning_up: '冷漠, 沉思', meaning_rev: '退缩, 冷漠' },
  { id: 40, name: '圣杯 Five', image_path: '/Cards-jpg/Cups05.jpg', meaning_up: '失落, 悲伤', meaning_rev: '接受, 继续前进' },
  { id: 41, name: '圣杯 Six', image_path: '/Cards-jpg/Cups06.jpg', meaning_up: '怀旧, 童年', meaning_rev: '停留在过去' },
  { id: 42, name: '圣杯 Seven', image_path: '/Cards-jpg/Cups07.jpg', meaning_up: '选择, 幻想', meaning_rev: '诱惑, 幻觉' },
  { id: 43, name: '圣杯 Eight', image_path: '/Cards-jpg/Cups08.jpg', meaning_up: '放弃, 离开', meaning_rev: '优柔寡断' },
  { id: 44, name: '圣杯 Nine', image_path: '/Cards-jpg/Cups09.jpg', meaning_up: '满足, 愿望成真', meaning_rev: '自满, 不满' },
  { id: 45, name: '圣杯 Ten', image_path: '/Cards-jpg/Cups10.jpg', meaning_up: '幸福, 家庭', meaning_rev: '家庭不和' },
  { id: 46, name: '圣杯 Page', image_path: '/Cards-jpg/Cups11.jpg', meaning_up: '创意, 直觉', meaning_rev: '情感不成熟' },
  { id: 47, name: '圣杯 Knight', image_path: '/Cards-jpg/Cups12.jpg', meaning_up: '浪漫, 魅力', meaning_rev: '情绪化' },
  { id: 48, name: '圣杯 Queen', image_path: '/Cards-jpg/Cups13.jpg', meaning_up: '同情, 平静', meaning_rev: '依赖, 情绪化' },
  { id: 49, name: '圣杯 King', image_path: '/Cards-jpg/Cups14.jpg', meaning_up: '情感成熟, 控制', meaning_rev: '情绪操纵' },
  // Swords (宝剑)
  { id: 50, name: '宝剑 Ace', image_path: '/Cards-jpg/Swords01.jpg', meaning_up: '清晰, 真理', meaning_rev: '混乱, 误解' },
  { id: 51, name: '宝剑 Two', image_path: '/Cards-jpg/Swords02.jpg', meaning_up: '僵局, 决策', meaning_rev: '优柔寡断' },
  { id: 52, name: '宝剑 Three', image_path: '/Cards-jpg/Swords03.jpg', meaning_up: '心碎, 悲伤', meaning_rev: '恢复, 宽恕' },
  { id: 53, name: '宝剑 Four', image_path: '/Cards-jpg/Swords04.jpg', meaning_up: '休息, 恢复', meaning_rev: '停滞, 倦怠' },
  { id: 54, name: '宝剑 Five', image_path: '/Cards-jpg/Swords05.jpg', meaning_up: '冲突, 失败', meaning_rev: '和解, 过去' },
  { id: 55, name: '宝剑 Six', image_path: '/Cards-jpg/Swords06.jpg', meaning_up: '过渡, 离开', meaning_rev: '无法前进' },
  { id: 56, name: '宝剑 Seven', image_path: '/Cards-jpg/Swords07.jpg', meaning_up: '欺骗, 策略', meaning_rev: '坦白, 忏悔' },
  { id: 57, name: '宝剑 Eight', image_path: '/Cards-jpg/Swords08.jpg', meaning_up: '限制, 监禁', meaning_rev: '自由, 释放' },
  { id: 58, name: '宝剑 Nine', image_path: '/Cards-jpg/Swords09.jpg', meaning_up: '焦虑, 噩梦', meaning_rev: '希望, 克服' },
  { id: 59, name: '宝剑 Ten', image_path: '/Cards-jpg/Swords10.jpg', meaning_up: '失败, 结局', meaning_rev: '恢复, 重生' },
  { id: 60, name: '宝剑 Page', image_path: '/Cards-jpg/Swords11.jpg', meaning_up: '好奇, 新思想', meaning_rev: '八卦, 误导' },
  { id: 61, name: '宝剑 Knight', image_path: '/Cards-jpg/Swords12.jpg', meaning_up: '雄心, 行动', meaning_rev: '冲动, 鲁莽' },
  { id: 62, name: '宝剑 Queen', image_path: '/Cards-jpg/Swords13.jpg', meaning_up: '独立, 清晰', meaning_rev: '冷酷, 刻薄' },
  { id: 63, name: '宝剑 King', image_path: '/Cards-jpg/Swords14.jpg', meaning_up: '权威, 真理', meaning_rev: '专横, 残酷' },
  // Pentacles (星币)
  { id: 64, name: '星币 Ace', image_path: '/Cards-jpg/Pentacles01.jpg', meaning_up: '机会, 繁荣', meaning_rev: '错失机会' },
  { id: 65, name: '星币 Two', image_path: '/Cards-jpg/Pentacles02.jpg', meaning_up: '平衡, 适应', meaning_rev: '不平衡' },
  { id: 66, name: '星币 Three', image_path: '/Cards-jpg/Pentacles03.jpg', meaning_up: '团队合作, 协作', meaning_rev: '不合作' },
  { id: 67, name: '星币 Four', image_path: '/Cards-jpg/Pentacles04.jpg', meaning_up: '安全, 保守', meaning_rev: '贪婪, 物质主义' },
  { id: 68, name: '星币 Five', image_path: '/Cards-jpg/Pentacles05.jpg', meaning_up: '贫困, 困难', meaning_rev: '恢复, 希望' },
  { id: 69, name: '星币 Six', image_path: '/Cards-jpg/Pentacles06.jpg', meaning_up: '慷慨, 慈善', meaning_rev: '债务, 自私' },
  { id: 70, name: '星币 Seven', image_path: '/Cards-jpg/Pentacles07.jpg', meaning_up: '耐心, 投资', meaning_rev: '沮丧, 缺乏回报' },
  { id: 71, name: '星币 Eight', image_path: '/Cards-jpg/Pentacles08.jpg', meaning_up: '技能, 勤奋', meaning_rev: '完美主义' },
  { id: 72, name: '星币 Nine', image_path: '/Cards-jpg/Pentacles09.jpg', meaning_up: '富足, 独立', meaning_rev: '财务依赖' },
  { id: 73, name: '星币 Ten', image_path: '/Cards-jpg/Pentacles10.jpg', meaning_up: '财富, 遗产', meaning_rev: '财务失败' },
  { id: 74, name: '星币 Page', image_path: '/Cards-jpg/Pentacles11.jpg', meaning_up: '学习, 新机会', meaning_rev: '缺乏承诺' },
  { id: 75, name: '星币 Knight', image_path: '/Cards-jpg/Pentacles12.jpg', meaning_up: '勤奋, 可靠', meaning_rev: '懒惰, 无聊' },
  { id: 76, name: '星币 Queen', image_path: '/Cards-jpg/Pentacles13.jpg', meaning_up: '养育, 务实', meaning_rev: '财务不独立' },
  { id: 77, name: '星币 King', image_path: '/Cards-jpg/Pentacles14.jpg', meaning_up: '富裕, 成功', meaning_rev: '财务失利' },
];

module.exports = {
  majorArcana,
  minorArcana
};
