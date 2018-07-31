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
    currentIndex: null,
    siteflag:null
  },
  onLoad(option) {
    this.setData({
      siteflag: option.siteflag
    });
    this.getLicenseList()
  },
  clearInput: function () {
    console.log(1);
    this.setData({
      licenise: ""
    });
  },
  inputTyping: function (e) {
    let nowlicense = e.detail.value
    console.log(nowlicense)
    let mowarr = this.data.sheacchLiceniseArr.filter(item => {
      return item.name.includes(nowlicense)
    })
    this.setData({
      liceniseArr: mowarr ? mowarr : ''
    });
  },
  getLicense(e) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    if (this.data.siteflag === 'startSiteId'){
      prevPage.setData({
        startSite: e.currentTarget.dataset.license,
        startSiteId: e.currentTarget.dataset.licenseid,
        baseId: e.currentTarget.dataset.baseid,
      })
    } else if (this.data.siteflag === 'endSiteId'){
      prevPage.setData({
        endSite: e.currentTarget.dataset.license,
        endSiteId: e.currentTarget.dataset.licenseid,
      })
    }else {
      let tag = Number(this.data.siteflag)
      let name = "waySitItems[" + tag + "].name"
      let id = "waySitItems[" + tag + "].id"
      prevPage.setData({
        [name] : e.currentTarget.dataset.license,
        [id] : e.currentTarget.dataset.licenseid,
      })
    }
    this.setData({
      licenise: e.currentTarget.dataset.license,
      liceniseid: e.currentTarget.dataset.licenseid,
      currentIndex: e.currentTarget.dataset.index
    })
  },
  getLicenseList() {
    request.getRequest(api.siteapi).then(res => {
      console.log(res)
      this.setData({
        liceniseArr: res.data.filter((item,index) => index < 6),
        sheacchLiceniseArr: res.data,
      });
    })
  }
});