import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    waybillId:'',
    list:[],
    showModal: false,
    id: '',
    examineStatus: '',
    remark: '',
    examineMoney: ''
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      examineMoney: {
        required: true,
        digits: true,
        maxlength: 6
      },
      remark: {
        required: true,
        maxlength: 30
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      examineMoney: {
        required: '审批数量不能为空',
        digits: '审批数量只能输入数字',
        maxlength: '审批数量最多可以输入6位'
      },
      remark: {
        required: '审批备注不能为空',
        maxlength: '审批备注最多可以输入30位'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this.setData({
      waybillId: options.waybillId
    })
    this.getdetails()
    this.initValidate()
  },
  getdetails(){
    let params = {
      waybillId: this.data.waybillId,
      examineStatus: '1,2,3',
      cancel: false,
      pageNo: 1,
      pageSzie: 500
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
  },
  showM: function (e) {
    this.setData({
      examineStatus: e.target.dataset.examinestatus,
      id: e.target.dataset.id,
      showModal: true
    })
  },
  examine(e) {
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0]
      wx.showModal({
        confirmColor: '#666',
        content: error.msg,
        showCancel: false,
      })
      return false
    }
    const params = {
      examineMoney: e.detail.value.examineMoney * 100,
      remark: e.detail.value.remark,
      examineStatus: Number(this.data.examineStatus),
      id: this.data.id
    }
    request.postRequest(api.docreviewEXamine, {
      data: params,
      header: {
        'Accept': 'application/json, text/plain, */*'
      },
    }).then(res => {
      console.log(res)
      if (res.result) {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
        setTimeout(function () {
          wx.navigateTo({ url: '../documentReview/documentReview' })
        }, 1000)
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
    })
    this.setData({
      showModal: false
    })
  },
  close() {
    this.setData({
      showModal: false,
      remark: '',
      examineMoney: '',
    })
  },
})