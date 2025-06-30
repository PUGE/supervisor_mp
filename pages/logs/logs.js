// pages/logs.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showText: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    wx.request({
      url: 'https://supervisor.lamp.run/' + options.type,
      method: 'POST',
      timeout: 5000,
      data: {
        ip: options.ip,
        password: options.password,
        port: options.port,
        username: options.username,
        name: options.name
      },
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        console.log('获取的数据:', res.data);
        this.setData({
          "showText": res.data.success
        });
      },
      fail: err => {
        wx.showModal({
          title: '错误',
          content: "请求失败!",
          showCancel: false, // 不显示取消按钮
          confirmText: '知道了',
          confirmColor: '#f44', // 红色按钮
        })
      }
    });
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