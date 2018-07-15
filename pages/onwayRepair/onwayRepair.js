import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    list: [],
    status:'',
    id:''
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
      this.setData({
        list: res.data
      });
    })
  },
  examine(e){
    this.setData({
      status: e.target.dataset.status,
      id: e.target.dataset.id,
    })
    wx.showModal({
      title: '提示',
      content: `确认${Number(this.data.status)===1?'驳回审批':'通过审批'}？`,
      success: (res) => {
        if (res.confirm) {
          this.confirmExamine()
        }
      }
    })
  },
  confirmExamine(e) {
    const params = {
      status: Number(this.data.status),
      id: this.data.id
    }
    request.postRequest(api.repairEXamine, {
      data: params,
    }).then(res => {
      if (res.result) {
        this.getRepairList() 
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
    })
  },
})