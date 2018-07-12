import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    loanList: []
  },
  onLoad: function (options) {
    this.getLoanList()
  },
  getLoanList() {
    request.getRequest(api.docreviewList).then(res => {
      res.data.forEach(function (item, i) {
        item.routesite = item.routeName.split('-');
        switch (item.waybillStatus) {
          case 0:
            item.waybillStatus = '待审核';
            break;
          case 1:
            item.waybillStatus = '审核完成';
            break;
          case 2:
            item.waybillStatus = '预结算';
            break;
          case 3:
            item.waybillStatus = '已结算';
            break;
          case 4:
            item.waybillStatus = '已关账';
            break;
          default:
            item.waybillStatus = null;
            break;
        };
      });
      this.setData({
        loanList: res.data
      });
    })
  }
})