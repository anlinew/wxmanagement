import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
import qs from '../../plugins/qs.js';

const app = getApp()
const request = app.WxRequest;

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["手工调度", "空载列表"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    date: moment().format('YYYY-MM-DD'),
    time: "12:00:00",
    enddate: moment().format('YYYY-MM-DD'),
    endtime: "23:00:00",
    license:'',
    liceniseid:'',
    routeid:'',
    startSite: '',
    startSiteId:'',
    baseId:'',
    waySitindex: 0,
    waySitItems: [
      {
        name: '',
        id: 0
      }
    ],
    endSite: '',
    endSiteId: '',
    waybillList:[],
   
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      license: {
        required: true,
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      license: {
        required: '车牌号不能为空'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad(option) {
    console.log(this.data.waySitItems)
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    this.initValidate()
    this.getWaybillList();
    
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  handleAdd() {
    this.setData({
      waySitindex: ++this.data.waySitindex
    })
    console.log(this.data.waySitindex)
    var items = this.data.waySitItems;
    items.push({
      name: '',
      id: this.data.waySitindex
    });
    this.setData({
      waySitItems: items
    });
  },
  handleReduce(e) {
    console.log(e);
    // this.data.waySitindex--;
    var items = this.data.waySitItems;
    items.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      waySitItems: items
    });
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange(e) {
    this.setData({
      time: e.detail.value + ':00'
    })
  },
  bindendDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindendTimeChange(e) {
    this.setData({
      time: e.detail.value + ':00'
    })
  },
  createDispatch(e){
    if (!this.data.startSite) {
      wx.showModal({
        confirmColor: '#666',
        content: '开始站点不可为空',
        showCancel: false,
      })
      return false
    }
    if (!this.data.endSite) {
      wx.showModal({
        confirmColor: '#666',
        content: '到达站点不可为空',
        showCancel: false,
      })
      return false
    }
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0]
      wx.showModal({
        confirmColor: '#666',
        content: error.msg,
        showCancel: false,
      })
      return false
    }
    let siteName = '';
    let siteArr = [];
    let params = {};
    siteArr.push({
      name: this.data.startSite,
      id: this.data.startSiteId
    },{
        name: this.data.endSite,
        id: this.data.startSiteId
      }
    )
    this.data.waySitItems.forEach((item, i) => {
      if (item.name) {
        siteArr.splice((i+1), 0, item); 
      }
    }); 
    siteArr.forEach((item, i) => {
      console.log(item)
      if (item.name) {
          siteName += item.name + '-';
      }
    });
    request.getRequest(api.routeDetailApi,{
      data: {
        routeName: siteName.substring(0, siteName.length - 1)  
      }
    }).then(res => {
      console.log(res)
      if (res.result) {
        let schedule=[];
        schedule[0]= this.data.date + ' ' + this.data.time
        schedule[1]= this.data.enddate + ' ' + this.data.endtime
        params = {
          baseId: this.data.baseId, // 基地ID 必填
          dispatchType: 0, // 调度类型 必填
          issueType: 0, // 下发类型 必填
          routeId: res.data.id, // 线路ID 必填
          schedule: schedule, // 每个站点计划时间
          truckId: this.data.liceniseid, // 车辆ID
          remark: ''
        };
        this.todocreateDispatch(params)
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
        return false;
      }
    })
  },
  todocreateDispatch(params){
    request.postRequest(api.movewaybill, {
      data: params,
      header: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=UTF-8',
      },

    }).then(res => {
      if (res.result) {
        wx.navigateTo({ url: '../dispatch_success/dispatch_success' })
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
    })
  },
  getWaybillList(){
    request.getRequest(api.waybillList,{data:{pageNo:1,pageSize:500}}).then(res => {
      res.data.forEach(function (item, i) {
        if (item.status === 0) {
          item.status = '待下发';
        } else if (item.status === 1) {
          item.status = '待接受';
        } else if (item.status === 2) {
          item.status = '待发车';
        } else if (item.status === 3) {
          item.status = '运输中';
        } else if (item.status === 4) {
          item.status = '已送达';
        } else if (item.status === 5) {
          item.status = '已完成';
        }
      });
      this.setData({
        waybillList:res.data
      });
    })
  },
  callDriver: function(e) {
    const driverPhone = e.currentTarget.dataset.driver;
    wx.makePhoneCall({
      phoneNumber: driverPhone,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  }
});
