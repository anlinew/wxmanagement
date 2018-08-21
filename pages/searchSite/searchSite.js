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
    console.log(option)
    this.setData({
      siteflag: option.siteflag,
      licenise: option.license
    });
    this.getLicenseList()
  },
  // 清除输入框
  clearInput: function (e) {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    if (this.data.siteflag === 'startSiteId'){
      prevPage.setData({
        startSite: '',
        startSiteId: '',
      })
    } else if (this.data.siteflag === 'endSiteId'){
      prevPage.setData({
        endSite: '',
        endSiteId: '',
      })
    }else {
      let tag = Number(this.data.siteflag)
      let name = "waySitItems[" + tag + "].name"
      let id = "waySitItems[" + tag + "].id"
      prevPage.setData({
        [name] : '',
        [id] : '',
      })
    }
    this.setData({
      licenise: '',
      liceniseid: '',
    })
  },
  inputTyping: function (e) {
    let nowlicense = e.detail.value
    console.log(nowlicense)
    let mowarr = this.data.sheacchLiceniseArr.filter(item => {
      return item.name.includes(nowlicense)
    })
    if (!nowlicense){
      mowarr = mowarr.filter((item,index) => index < 18)
    } else {
      mowarr =mowarr
    }
    this.setData({
      liceniseArr: mowarr ? mowarr : ''
    });
  },
  getLicense(e) {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    if (this.data.siteflag === 'startSiteId'){
      prevPage.setData({
        startSite: e.currentTarget.dataset.license,
        startSiteId: e.currentTarget.dataset.licenseid,
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
    request.getRequest(api.siteapi,{data:{pageNo:1,pageSize:500}}).then(res => {
      console.log(res)
      this.setData({
        liceniseArr: res.data.filter((item,index) => index < 18),
        sheacchLiceniseArr: res.data,
      });
    })
  }
});