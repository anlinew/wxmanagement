var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

Page({
  data: {
    driver:'',
    date: moment().format('YYYY-MM-DD HH:mm:ss'),
    license: '',
    phone:'',
    planArriveTime:'',
    startSite: ["成都市", "上海市", "北京市"],
    startSiteIndex: 0,
    endSite: ["成都市", "济南市", "铜陵市"],
    endSiteIndex: 0,
   
  },
  onLoad: function (option) {
    this.setData({
      driver: option.driverName,
      phone: option.driverPhone,
      license: option.truckLicense,
      planArriveTime: option.planArriveTime
    })
  },
  bindStartSiteChange: function (e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);
    this.setData({
      startSiteIndex: e.detail.value
    })
  },
  bindEndSiteChange: function (e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);
    this.setData({
      endSiteIndex: e.detail.value
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  
});