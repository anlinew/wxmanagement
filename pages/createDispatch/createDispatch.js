import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import qs from '../../plugins/qs.js';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

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
    license:'',
    liceniseid:'',
    routeid:'',
    startSite: '',
    startSiteId:'',
    baseId:'',
    waySitindex: 0,
    driverName: '',
    waySitItems: [
      {
        name: '',
        id: 0
      }
    ],
    endSite: '',
    endSiteId: '',
    waybillList:[],
    pzTime: '',
    pageNo: 1,
    pageSize: 10,
    radioItems: [
      { name: '重载', value: '', checked: true },
      { name: '水路', value: '(水)' }
    ],
    routeType: '',
    payload: {}
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
    this.getWaybillList();
    this._getTime();
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
    // this.data.waySitindex--;
    var items = this.data.waySitItems;
    items.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      waySitItems: items
    });
  },
  creatbill(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      type: type
    })
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
    if (!this.data.liceniseid) {
      wx.showModal({
        confirmColor: '#666',
        content: '车牌号不可为空',
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
      if (item.name) {
          siteName += item.name + '-';
      }
    });
    request.getRequest(api.routeDetailApi,{
      data: {
        routeName: siteName.substring(0, siteName.length - 1) + this.data.routeType
      }
    }).then(res => {
      console.log(res)
      if (res.result) {
        let schedule=[];
        // 每个途径点的时间
        res.data.routeSites.forEach((item, index)=> {
          if (index === 0) {
            schedule[index] = moment().add(this.data.pzTime + item.driveTime, 'hour').format('YYYY-MM-DD HH:mm:ss');
          } else {
            schedule[index] = this.DateFormat((new Date((new Date(schedule[index - 1].replace(/\-/g, '/')).getTime() + (item.driveTime * 60 * 60 * 1000) + (item.restTime * 60 * 60 * 1000)))), 'yyyy-MM-dd hh:mm:ss');
          }
        })
        params = {
          baseId: this.data.baseId, // 基地ID 必填
          dispatchType: 0, // 调度类型 必填
          issueType: this.data.type, // 下发类型 必填
          routeId: res.data.id, // 线路ID 必填
          schedule: schedule, // 每个站点计划时间
          truckId: this.data.liceniseid, // 车辆ID
          remark: ''
        };
        console.log(params)
        wx.showModal({
          title: this.data.type==='1'?'是否创建调度单':'是否创建并下发调度单',
          content: '线路名称：' + res.data.name + '\r\n\r\n发车时间：' + schedule[0] + '\r\n\r\n到达时间：' + schedule[schedule.length-1],
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#000000',
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: res => {
            if(res.confirm){
              this.todocreateDispatch(params)
            }
          }
        });
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
        wx.navigateTo({ url: '../dispatch_success/dispatch_success?wayNum='+res.data.num+'&license='+res.data.truckLicense+'&driverName='+res.data.driverName+'&planDepartureTime='+res.data.planDepartureTime+'&driverPhone='+res.data.driverPhone })
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
    })
  },
  // 获取配置时间得到发车时间和到达时间
  _getTime() {
    request.getRequest(api.pzTime,{data:{sysGroup: 'interval_task', sysKey: 'intervalTime'}}).then(res=> {
      console.log(res);
      const sysInfo = res.data;
      this.setData({
        pzTime: sysInfo.intervalTime
      })
    })
  },
  getWaybillList(){
    request.getRequest(api.waybillList,{data:{pageNo:this.data.pageNo,pageSize:this.data.pageSize}}).then(res => {
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
        } else if (item.status === 6) {
          item.status = '已作废';
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
  },
  // 选择重载还是水路
  radioChange: function (e) {
    console.log(e);
    var radioItems = this.data.radioItems;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].value == e.detail.value;
    }
    this.setData({
      radioItems: radioItems,
      routeType: e.detail.value
    });
  },
  // 下拉刷新
  async onPullDownRefresh(e) {
    this.data.payload = {};
    this.data.pageNo = 1;
    this.data.pageSize = 10;
    wx.showLoading({
      title: '加载中...',
    })
    await this.getWaybillList();
    setTimeout(()=> {
      wx.stopPullDownRefresh();
      wx.hideLoading();
    },500)
  },
  // 上拉加载更多
  async onReachBottom() {
    wx.showLoading({
      title: '加载更多中...',
    })
    this.data.pageSize = this.data.pageSize + 10;
    this.data.payload.pageNo = 1;
    this.data.payload.pageSize = this.data.pageSize;
    await this.getWaybillList(this.data.payload);
    setTimeout(()=> {
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'none'
      })
    },500)
  },
  // 下发任务
  async xfEvent (e) {
    console.log(e.currentTarget.dataset.id);
    const wayId = e.currentTarget.dataset.id;
    const res = await request.postRequest(api.xfWaybill,{data: {id: wayId}});
    if (res.result) {
      wx.showToast({
        title: '下发任务成功',
        icon: 'success'
      })
      this.getWaybillList();
    }
  },
  // 确认完成
  async beFinish (e) {
    const wayId = e.currentTarget.dataset.id;
    const res = await request.postRequest(api.finishWay, { data: { id: wayId } });
    if (res.result) {
      wx.showToast({
        title: '已确认完成',
        icon: 'success'
      })
      this.getWaybillList();
    }
  },
  DateFormat (str, fmt) {
    let o = {
      'M+': str.getMonth() + 1,
      'd+': str.getDate(),
      'h+': str.getHours(),
      'm+': str.getMinutes(),
      's+': str.getSeconds(),
      'q+': Math.floor((str.getMonth() + 3) / 3),
      'S': str.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (str.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (let k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
      }
    }
    return fmt;
  }
});
