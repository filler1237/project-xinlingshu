// home/test/intro/intro.js
Page({
  GoTest(){
    wx.redirectTo({
      url: this.data.Url[this.data.id] + '?color=' + this.data.color + '&ReturnAddressId=' + this.data.id,
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    Title: ["抑郁自评量表 SDS", "焦虑自评量表 SAS", "阿森斯失眠量表 AIS", "一般健康问卷 GHQ-12"],
    IconTitle: ["抑郁自评量表\nSDS", "焦虑自评量表\nSAS", "阿森斯失眠量表\nAIS", "一般健康问卷\nGHQ-12"],
    Color: ["#E5FFF0", "#EDF9FC", "#FFFBE3", "#F0F4FF"],
    Intro: ["抑郁自评量表（Self-rating depression scale SDS），是含有20个项目，分为4级评分的自评量表，原型是W.K.Zung编制的抑郁量表（1965）。其特点是使用简便，并能相当直观地反映抑郁患者的主观感受及其在治疗中的变化。主要适用于具有抑郁症状的成年人，包括门诊及住院患者。只是对严重迟缓症状的抑郁，评定有困难。",
    "焦虑自评量表（Self一Rating Anxiety Seale, SAS）由Zung于1971年编制,从量表构造的形式到具体评定办法,都与抑郁自评量表（SDS）十分相似,它也是一个含有20个项目,分为4级评分的自评量表,用于评出焦虑病人的主观感受。",
    "阿森斯失眠量表也称亚森失眠量表，是国际公认的睡眠质量自测量表，可用于对公众的睡眠质量状况进行调查。在我国，也推荐人们使用该量表对睡眠质量进行调查。\n阿森斯失眠量表可用于对你经历的睡眠障碍进行自我评估。对于下列问题，如果过去1个月内每星期至少在你身上发生3次，你就应该进行评测，并圈出符合你的情况的选项。",
    "一般健康问卷GHQ-20（General Health Questionnaire）原为Goldberg编制，后由清华大学教育研究所李虹博士等人修订。共20个项目，含GHQ-自我肯定（9个项目），GHQ-忧郁量表（6个项目），GHQ-焦虑量表（5个项目）3个分量表。忧郁量表和焦虑量表得分越高，表明忧郁和焦虑程度越强，自我肯定分量表得分越高，自我肯定程度越强；将自我肯定分量表记分进行反向转换与忧郁、焦虑量表分合成，形成身心问题总分，总分越高，身心健康水平越低。"
    ],
    Url: ["/home/test/SDS/SDS", "/home/test/SAS/SAS", "/home/test/AIS/AIS", "/home/test/GHQ/GHQ"],
    title: "心理测评",
    color: "#E5FFF0",
    icontitle: "",
    intro: "",
    id: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      id : options.id
    })
    this.setData({
      title : this.data.Title[this.data.id]
    })
    this.setData({
      icontitle : this.data.IconTitle[this.data.id]
    })
    this.setData({
      color : this.data.Color[this.data.id]
    })
    this.setData({
      intro : this.data.Intro[this.data.id]
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})