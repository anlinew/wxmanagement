import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    planDepartureTimeBefore:'',
    planDepartureTimeAfter:'',
    monthstart:'',
    todaynum:'',
    monthnum:'',
    username: '',
    grids: [
      { title: '车辆检测', pageUrl: '../carRepair/carRepair', imageUrl:'../image/rpair@2x.png' },
      { title: '生成调令', pageUrl:'../createDispatch/createDispatch',imageUrl:'../image/move@2x.png' },
      { title: '借款审核', pageUrl: '../borrowMoney/borrowMoney', imageUrl:'../image/borrow@2x.png' },
      { title: '在途维修', pageUrl: '../onwayRepair/onwayRepair', imageUrl:'../image/way@2x.png' },
      { title: '请假审核', pageUrl: '../driverLeave/driverLeave', imageUrl:'../image/leave@2x.png' },
      { title: '单据审核', pageUrl: '../documentReview/documentReview', imageUrl:'../image/type@2x.png' }
    ]
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    let endtiem = moment().format('YYYY-MM-DD')
    let starttiem = moment().format('YYYY-MM-DD')
    let year = moment().format('YYYY');
    let month = moment().format('MM');

    let aMonth = moment().add(1, 'months');
    let endmonth = moment(aMonth).format('MM');
    wx.getStorage({
      key: 'username',
      success: (res)=> {
        app.globalData.userInfo = res.data;
        this.setData({
          username: app.globalData.userInfo.realName
        })
      }
    })
    console.log(app.globalData.userInfo)
    this.setData({
      planDepartureTimeAfter: starttiem + " " + '00:00:00',
      monthstart: year + "-" + month + '-01 00:00:00'
    })
    let params = {
      createTimeAfter: this.data.planDepartureTimeAfter,
      pageNo: 1,
      pageSzie: 500
    }
    let payload = {
      createTimeAfter: this.data.monthstart,
      pageNo: 1,
      pageSzie: 500
    }
    this.getwabytodayNum(params)
    this.getwabymonthNum(payload)
    this._upData()
  },
  getwabytodayNum(params){
    request.getRequest(api.waybillCount, {
      data: params
    })
    .then(res => {
      this.setData({
        todaynum:res.data
      })
    })
  },
  getwabymonthNum(params) {
    request.getRequest(api.waybillCount, {
      data: params
    })
      .then(res => {
        this.setData({
          monthnum: res.data
        })
      })
  },
  // 判断是否要更新小程序
  _upData() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        console.log(res)
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  }
})
