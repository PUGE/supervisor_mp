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
  showError (msg) {
    wx.showModal({
      title: '错误',
      content: msg,
      showCancel: false, // 不显示取消按钮
      confirmText: '知道了',
      confirmColor: '#f44', // 红色按钮
    })
  },
  showSuccess (msg) {
    wx.showToast({
      title: msg,  // 提示的内容
      icon: 'success',    // 图标：success / loading / none
      duration: 2000      // 显示时间，单位 ms
    })
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
              this.setData({ isLoading: false });
              console.log('用户数据:', res.data);
              let userData = res.data.data.value
              if (JSON.stringify(userData) == '{}') userData = []
              this.setData({
                openid: res.data.openid,
                userID: res.data.userID,
                username: res.data.username,
                userData: userData
              });
              this.getServer()
              
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
      this.data.userData.push(config);
      this.saveServerInfo()
      this.setData({ isLoading: false });
      this.userLogin()
      this.setData({ showInputDialog: false });
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
    this.setData({
      "processList": []
    });
    for (let index = 0; index < this.data.userData.length; index++) {
      const element = this.data.userData[index];
      
      this.getServerInfo(element, (data) => {
        data.forEach(element2 => {
          console.log(element)
          element2.server = element['ip']
          element2.port = element['port']
          element2.username = element['username']
          element2.password = element['password']
          this.data.processList.push(element2)
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
        this.setData({ isLoading: false });
        if (res.data.error) {
          if (res.data.error.includes('Unauthorized')) {
            this.showError('用户名或密码错误')
          }
          else if (res.data.error.includes('Connection refused')) {
            this.showError('连接服务器失败')
          } else {
            this.showError(res.data)
          }
          return
        }
        console.log(this.data.processList)
        if (callBack) {
          callBack(res.data)
        }
        
      },
      fail: err => {
        this.showError('请求地址失败:' + serverInfo.ip)
        this.setData({ isLoading: false });
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
        this.showError('用户数据保存失败')
      }
    });
  },
  viewLog (event) {
    console.log(event)
    wx.navigateTo({
      url: `/pages/logs/logs?name=${event.target.dataset.name}&ip=${event.target.dataset.ip}&port=${event.target.dataset.port}&username=${event.target.dataset.username}&password=${event.target.dataset.password}&type=${event.target.dataset.type}`
    })
  },
  sendEnv (event) {
    wx.request({
      url: 'https://supervisor.lamp.run/' + event.target.dataset.type,
      method: 'POST',
      timeout: 5000,
      data: event.target.dataset,
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        console.log('获取的数据:', res.data);
        this.showSuccess('操作成功')
        this.getServer()
      },
      fail: err => {
        this.showError('请求失败')
        this.setData({ isLoading: false });
      }
    });
  },
})
