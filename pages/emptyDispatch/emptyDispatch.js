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
    startName:'',
    route: [],
    routeIndex: 0,
    routeId:'',
    pzTime: '',
    fcTime: null
  },
  onLoad(option) {
    let routeName = option.routeName.split('-');
    console.log(routeName);
    let startName = routeName[routeName.length-1]
    console.log(startName);
    this.setData({
      driver: option.driverName,
      phone: option.driverPhone,
      license: option.truckLicense,
      startName: startName,
      waybillId: option.waybillId,
    })
    this.getRoutes(startName)
    this._getTime();
  },
  bindrouteChange: function (e) {
    console.log(this.data.route)
    var index = e.detail.value;
    var routeId = this.data.route.lenght>0?this.data.route[index].id:null; // 这个id就是选中项的id
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
    schedule[0] = this.data.fcTime;
    let endtime = this.data.date +' '+ this.data.time
    schedule[1] = endtime;
    console.log(schedule[0],schedule[1])
    if (new Date(schedule[0].replace(/-/g, '/')).getTime()>new Date(schedule[1].replace(/-/g, '/')).getTime()) {
      wx.showToast({
        title: '到达时间不能早于出发时间',
        icon: 'none',
        duration: 1000
      });
      return false
    }
    
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
        setTimeout(function () {
          wx.navigateTo({ url: '../empty_success/empty_success?num='+res.data.num+'&routeName='+res.data.routeName+'&driverName='+res.data.driverName+'&truckLicense='+res.data.truckLicense })
        }, 1000)
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
    })
  },
  getRoutes(startName) {
    request.getRequest(api.routeListApi,{data:{pageNo:1,pageSize:500}}).then(res => {
      let routeList = res.data.filter(item => item.name.indexOf(this.data.startName) !== -1 && item.dispatchType === 1)
      routeList.forEach(item=>{
        item.siteNames = item.siteNames[item.siteNames.length - 1];
      })
      if (routeList.length===0) {
        routeList.push({siteNames:'无站点信息'})
      }
      this.setData({
        route: routeList,
        routeId: routeList.length>0? routeList[this.data.routeIndex].id:null
      });
    });
  },
  // 获取配置时间得到发车时间和到达时间
  _getTime() {
    request.getRequest(api.pzTime,{data:{sysGroup: 'interval_task', sysKey: 'intervalTime'}}).then(res=> {
      console.log(res);
      const sysInfo = res.data;
      this.setData({
        pzTime: sysInfo.intervalTime,
        // fcTime: moment().add(sysInfo.intervalTime,'hour').format('YYYY-MM-DD HH:mm:ss')
        fcTime: moment().format('YYYY-MM-DD HH:mm:ss')
      })
    })
  },
  // 返回
  back () {
    wx.navigateBack({
      delta: 1,
    })
  }
});