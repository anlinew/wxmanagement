import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    loanList: [],
    pageNo: 1,
    pageSize: 10,
  },
  onLoad: function (options) {
    this.getLoanList()
  },
  getLoanList() {
    request.getRequest(api.docreviewList,{data:{pageNo:this.data.pageNo,pageSize:this.data.pageSize}}).then(res => {
      res.data.forEach(function (item, i) {
        item.routesite = item.routeName.split('-');
        switch (item.waybillStatus) {
          case 0:
            item.waybillStatus = '待审核';
            item.color = '#f49f13'
            break;
          case 1:
            item.waybillStatus = '已审核';
            item.color = '#40ab00'
            break;
          case 2:
            item.waybillStatus = '预结算';
            item.color = '#40ab00'
            break;
          case 3:
            item.waybillStatus = '已结算';
            item.color = '#25b4b0'
            break;
          case 4:
            item.waybillStatus = '已关账';
            item.color = '#59cac8'
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
  },
  // 下拉刷新
  async onPullDownRefresh(e) {
    this.data.pageNo = 1;
    this.data.pageSize = 10;
    wx.showLoading({
      title: '加载中...',
    })
    await this.getLoanList();
    setTimeout(()=> {
      wx.stopPullDownRefresh();
      wx.hideLoading();
    },500)
  },
  // 上拉加载更多
  async onReachBottom() {
    wx.showLoading({
      title: '加载更多中...',
    })
    this.data.pageSize = this.data.pageSize + 10;
    await this.getLoanList();
    setTimeout(()=> {
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'success'
      })
    },500)
  },
})