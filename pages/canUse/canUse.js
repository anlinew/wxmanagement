import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
const app = getApp()
const request = app.WxRequest;
Page({
  data: {
    inputShowed: false,
    licenise: "",
    liceniseid: '',
    liceniseArr: [],
    sheacchLiceniseArr: [],
    currentIndex:null,
    baseId: ''
  },
  onLoad(option){
    this.getLicenseList()
    this.setData({
      licenise: option.license
    })
  },
  clearInput: function (e) {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      license: '',
      liceniseid: '',
      baseId: ''
    })
    this.setData({
      licenise: '',
      liceniseid: ''
    })
  },
  inputTyping: function (e) {
    let nowlicense = e.detail.value
    let mowarr = this.data.sheacchLiceniseArr.filter(item => {
      return item.license.includes(nowlicense)
    })
    if (!nowlicense){
      mowarr = mowarr.filter((item,index) => index < 18)
    } else {
      mowarr =mowarr
    }
    this.setData({
      liceniseArr: mowarr ? mowarr: ''
    });
    console.log(nowlicense);
  },
  getLicense(e){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      license: e.currentTarget.dataset.license,
      liceniseid: e.currentTarget.dataset.liceniseid,
      baseId: e.currentTarget.dataset.baseid
    })
    this.setData({
      licenise: e.currentTarget.dataset.license,
      liceniseid: e.currentTarget.dataset.liceniseid,
      currentIndex: e.currentTarget.dataset.index
    })
  },
  getLicenseList() {
    request.getRequest(api.frontList,{data:{pageNo:1,pageSize:500,availableStatus:0}}).then(res => {
      this.setData({
        liceniseArr: res.data.filter((item,index) => index < 18),
        sheacchLiceniseArr: res.data,
      });
    })
  }
});