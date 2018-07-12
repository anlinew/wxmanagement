import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    waybillId:'',
    list:[]
  },
  onLoad: function (options) {
    this.setData({
      waybillId: options.waybillId
    })
    this.getdetails()
  },
  getdetails(){
    let params = {
      waybillId: this.data.waybillId,
      examineStatus: '1,2,3',
      cancel: false
    }
    request.getRequest(api.docreExamineList,{
      data: params,
      header: {
        'Accept': 'application/json, text/plain, */*'
      }
    }).then(res => {
      console.log(res)
      res.data.forEach(item => {
        switch (item.examineStatus) {
          case 0:
            item.examineStatus = '待提交';
            break;
          case 1:
            item.examineStatus = '待审核';
            break;
          case 2:
            item.examineStatus = '审核通过';
            break;
          case 3:
            item.examineStatus = '已驳回';
            break;
          default:
            item.examineStatus = null;
            break;
        }
      })
      this.setData({
        list: res.data
      });
    })
  }
})