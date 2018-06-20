var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    waybillId:'',
    driver:'',
    date: moment().format('YYYY-MM-DD'),
    time: "12:00:00",
    license: '',
    phone:'',
    planArriveTime:'',
    actualArriveTime:'',
    startName:'',
    route: [],
    routeIndex: 0,
    routeId:''
  },
  onLoad(option) {
    let routeName = option.routeName.split('-');
    let startName = routeName[routeName.length-1]
    this.setData({
      driver: option.driverName,
      phone: option.driverPhone,
      license: option.truckLicense,
      planArriveTime: option.planArriveTime,
      actualArriveTime: option.actualArriveTime,
      startName: startName,
      waybillId: option.waybillId
    })
    this.getRoutes(startName)
  },
  bindrouteChange: function (e) {
    var index = e.detail.value;
    console.log(e.detail.value)
    var routeId = this.data.route[index].id; // 这个id就是选中项的id
    this.setData({
      routeIndex: e.detail.value,
      routeId: routeId
    })
  },
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange(e) {
    this.setData({
      time: e.detail.value + ':00'
    })
  },
  addEmptyFun(){
    let schedule = [];
    schedule[0] = this.data.actualArriveTime == "null" || this.data.actualArriveTime == "" ? this.data.planArriveTime : this.data.actualArriveTime;
    let endtime = this.data.date +' '+ this.data.time
    schedule[1] = endtime;
    let opt = {
      remark: 'remark',
      routeId: this.data.routeId, // 线路id
      schedule: schedule,
      waybillId: this.data.waybillId // 调度单id
    };
    request.postRequest(api.addEmptyFunWaybill, {
      data: opt,
      header: {
        'Accept': 'application/json, text/plain, */*'
      },
    }).then(res => {
      if (res.result) {
        wx.showModal({
          confirmColor: '#666',
          content: '创建成功',
          showCancel: false,
        })
        setTimeout(function () {
          wx.navigateTo({ url: '../createDispatch/createDispatch?activeIndex=1' })
        }, 1000)
      
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
      console.log(res)
    })
  },
  getRoutes(startName) {
    console.log(startName)
    request.getRequest(api.routeListApi).then(res => {
      let routeList = res.data.filter(item => item.name.indexOf(this.data.startName) !== -1 && item.dispatchType === 1)
      this.setData({
        route: routeList,
        routeId: routeList[this.data.routeIndex].id
      });
    });
  },
});