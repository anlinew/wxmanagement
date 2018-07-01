import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

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
    startSite: '',
    startSiteId:'',
    waySitindex: 1,
    waySitItems: [
      {
        value: '',
        index: 1
      }
    ],
    waySiteId: '',
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
    this.data.waySitindex++;
    var items = this.data.waySitItems;
    items.push({
      value: '',
      index: this.data.waySitindex
    });
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
  createDispatch(e){
    const that = this;
    if (!that.WxValidate.checkForm(e)) {
      const error = that.WxValidate.errorList[0]
      wx.showModal({
        confirmColor: '#666',
        content: error.msg,
        showCancel: false,
      })
      return false
    }
    const params = { startSiteId: that.data.startSiteId, waySiteId: that.data.waySiteId, endSiteId: that.data.endSiteId, date: that.data.date, license: that.data.license};
  },
  getWaybillList(){
    request.getRequest(api.waybillList).then(res => {
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
  }
  
});
