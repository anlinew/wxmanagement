import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    loanList:[],
    pageNo: 1,
    pageSize: 10
  },
  onLoad: function (options) {
    this.getLoanList()
  },
  getLoanList() {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    setTimeout(function(){
      wx.hideLoading()
    },600)
    request.getRequest(api.loanListApi,{data:{pageNo:this.data.pageNo,pageSize:this.data.pageSize}}).then(res => {
      res.data.forEach(function (item, i) {
        item.routesite = item.routeName.split('-');
        if (item.examineStatus === 0) {
          item.examineStatus = '待审核';
          item.color = '#FF9900 '
        } else if (item.examineStatus === 2) {
          item.examineStatus = '已审批';
          item.color = '#19be6b'
        } else if (item.examineStatus === 3) {
          item.examineStatus = '已驳回';
          item.color = '#FF6600'
        } else if (item.examineStatus === 4) {
          item.examineStatus = '已打款';
          item.color = '#09BB07'
        } else if (item.examineStatus === 5) {
          item.examineStatus = '已还款';
          item.color = '#2F9833'
        } else if (item.examineStatus === 6) {
          item.examineStatus = '已作废';
          item.color = '#B4B4B4'
        }
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