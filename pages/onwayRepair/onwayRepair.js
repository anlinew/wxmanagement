import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    list: []
  },
  onLoad: function (options) {
    this.getRepairList()
  },
  getRepairList() {
    request.getRequest(api.onthewayRepair,{
      data:{
        curStatus:0
      }
    }).then(res => {
      console.log(res)
      this.setData({
        list: res.data
      });
    })
  }
})