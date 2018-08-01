import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    loanList:[]
  },
  onLoad: function (options) {
    this.getLoanList()
  },
  getLoanList() {
    request.getRequest(api.loanListApi,{data:{pageNo:1,pageSize:500}}).then(res => {
      res.data.forEach(function (item, i) {
        item.routesite = item.routeName.split('-');
        if (item.examineStatus === 0) {
          item.examineStatus = '待审核';
        } else if (item.examineStatus === 2) {
          item.examineStatus = '已审批';
        } else if (item.examineStatus === 3) {
          item.examineStatus = '已驳回';
        } else if (item.examineStatus === 4) {
          item.examineStatus = '已打款';
        } else if (item.examineStatus === 5) {
          item.examineStatus = '已还款';
        } else if (item.examineStatus === 6) {
          item.examineStatus = '已作废';
        }
      });
      this.setData({
        loanList: res.data
      });
    })
  }
})