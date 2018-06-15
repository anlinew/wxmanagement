import api from '../../requests/api.js'

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    grids: [
      { title: '车辆检测', pageUrl: '../carRepair/carRepair', imageUrl:'../image/rpair@2x.png' },
      { title: '生成调令', pageUrl:'../createDispatch/createDispatch',imageUrl:'../image/move@2x.png' },
      { title: '借款审核', pageUrl: '../borrowMoney/borrowMoney', imageUrl:'../image/borrow@2x.png' },
      { title: '在途维修', pageUrl: '../createDispatch/createDispatch', imageUrl:'../image/way@2x.png' },
      { title: '请假审核', pageUrl: '../createDispatch/createDispatch', imageUrl:'../image/leave@2x.png' },
      { title: '单据审核', pageUrl: '../createDispatch/createDispatch', imageUrl:'../image/type@2x.png' }
    ]
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    
  }
  
})
