// index.js

Page({
  data: {
    openid: "",
    userID: "",
    username: "",
    showInputDialog: false,
    isLoading: true,
    serverConfig: {
      ip: '',
      port: '',
      username: '',
      password: ''
    },
    userData: [],
    processList: [
    ]
  },
  onLoad() {
    this.userLogin()
  },
  userLogin () {
    // 登录
    wx.login({
      success: res => {
        if (res.code) {
          wx.request({
            url: 'https://user.lamp.run/getOpenId',
            method: 'POST',
            data: {
              code: res.code,
              appid: "wxf4c672e17c4aac25"
            },
            header: {
              'content-type': 'application/json'
            },
            success: res => {
              console.log('获取的数据:', res.data);
              let userData = res.data.data.value
              if (JSON.stringify(userData) == '{}') userData = []
              this.setData({
                openid: res.data.openid,
                userID: res.data.userID,
                username: res.data.username,
                userData: userData
              });
              this.getServer()
              this.setData({ isLoading: false });
            },
            fail: err => {
              console.error('请求失败:', err);
            }
          });
        }
      }
    });
  },
  showDialog() {
    this.setData({ showInputDialog: true });
  },

  cancelDialog() {
    this.setData({ showInputDialog: false });
  },

  confirmDialog() {
    const config = this.data.serverConfig;
    console.log('你输入的服务器配置为：', config);
    this.setData({ isLoading: true });
    this.getServerInfo(config, (data) => {
      console.log(data)
      this.setData({ showInputDialog: false });
      this.saveServerInfo()
      this.setData({ isLoading: false });
    })
    // 你可以在这里发送请求，例如 wx.request(...)
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`serverConfig.${field}`]: value
    });
  },
  getServer () {
    for (let index = 0; index < this.data.userData.length; index++) {
      const element = this.data.userData[index];
      console.log(element)
      this.getServerInfo(element, (data) => {
        data.forEach(element => {
          element.server = element['ip']
          this.data.processList.push(element)
        });
        this.setData({
          "processList": this.data.processList
        });
      })
    }
  },
  getServerInfo (serverInfo, callBack) {
    wx.request({
      url: 'https://supervisor.lamp.run/processes',
      method: 'POST',
      timeout: 5000,
      data: serverInfo,
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        console.log('获取的数据:', res.data);
        console.log(this.data.processList)
        if (callBack) {
          callBack(res.data)
        }
        
      },
      fail: err => {
        wx.showModal({
          title: '错误',
          content: '请求地址失败:' + serverInfo.ip,
          showCancel: false, // 不显示取消按钮
          confirmText: '知道了',
          confirmColor: '#f44', // 红色按钮
        })
        this.setData({ isLoading: true });
      }
    });
  },
  saveServerInfo () {
    wx.request({
      url: 'https://user.lamp.run/updata',
      method: 'POST',
      timeout: 5000,
      data: {
        "type":"supervisor管理",
        "username":this.data.openid,
        "session":this.data.openid,
        "value":this.data.userData
      },
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        console.log('数据保存成功:', res.data);
      },
      fail: err => {
        wx.showModal({
          title: '错误',
          content: '用户数据保存失败!',
          showCancel: false, // 不显示取消按钮
          confirmText: '知道了',
          confirmColor: '#f44', // 红色按钮
        })
      }
    });
  }
})
