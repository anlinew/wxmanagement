import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    waybillId:'',
    detail:{}
  },
  onLoad: function (options) {
    console.log(options)
    this.setData({
      waybillId: options.waybillId
    })
    this.getdetails()
  },
  getdetails(){
    let params = {
      waybillId: this.data.waybillId
    }
    request.getRequest(api.docreviewList,{
      data: params,
      header: {
        'Accept': 'application/json, text/plain, */*'
      }
    }).then(res => {
      console.log(res)
      this.setData({
        detail: res.data[0]
      });
    })
  }
})