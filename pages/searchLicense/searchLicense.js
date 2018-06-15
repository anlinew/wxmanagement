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
    currentIndex:null
  },
  onLoad(){
    this.getLicenseList()
  },
  clearInput: function () {
    this.setData({
      licenise: ""
    });
  },
  inputTyping: function (e) {
    let nowlicense = e.detail.value
    let mowarr = this.data.sheacchLiceniseArr.filter(item => {
      return item.license === nowlicense
    })
    this.setData({
      liceniseArr: mowarr ? mowarr: ''
    });
  },
  getLicense(e){
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      license: e.currentTarget.dataset.license
    })
    this.setData({
      licenise: e.currentTarget.dataset.license,
      liceniseid: e.currentTarget.dataset.licenseid,
      currentIndex: e.currentTarget.dataset.index
    })
  },
  getLicenseList() {
    request.getRequest(api.frontList).then(res => {
      this.setData({
        liceniseArr: res.data.filter(item => Number(item.id) < 6),
        sheacchLiceniseArr: res.data,
      });
    })
  }
});