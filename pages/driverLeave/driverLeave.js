import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    showModal: false,
    disagreeArr: ['没有人代办您的业务', '公司有大会议展开', '无法同意，请配合工作'],
    agreeArr: ['同意请假', '好好休息', '祝您假期愉快'],
    list: [],
    id:'',
    examineStatus: '',
    examineRemark: '',
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      examineRemark: {
        required: true,
        maxlength: 30
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      examineRemark: {
        required: '审批备注不能为空',
        maxlength: '审批备注最多可以输入30位'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this.getList();
    this.initValidate()
  },
  getList() {
    request.getRequest(api.leavenoteListApi).then(res => {
      console.log(res)
      res.data.forEach(function (item, i) {
        if (item.waybillStatus === 0) {
          item.waybillStatus = '待审核';
        } else if (item.waybillStatus === 1) {
          item.waybillStatus = '审核完成';
        } else if (item.waybillStatus === 2) {
          item.waybillStatus = '预结算';
        } else if (item.waybillStatus === 3) {
          item.waybillStatus = '已结算';
        } else if (item.waybillStatus === 4) {
          item.waybillStatus = '已关账';
        } 
      });
      this.setData({
        list: res.data
      })
    })
  },
  showM: function (e) {
    this.setData({
      examineStatus: e.target.dataset.examinestatus,
      id: e.target.dataset.id,
      showModal: true
    })
  },
  preventTouchMove: function () {

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
      examineRemark: e.detail.value.examineRemark,
      examineStatus: Number(this.data.examineStatus),
      id: this.data.id
    }
    request.postRequest(api.examineLeave, {
      data: params,
      header: {
        'Accept': 'application/json, text/plain, */*'
      },
    }).then(res => {
      if (res.result) {
        wx.showModal({
          confirmColor: '#666',
          content: '审批成功',
          showCancel: false,
        })
        this.getList();
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
      examineRemark: ''
    })
  },
  getLicense(e) {
    this.setData({
      examineRemark: e.currentTarget.dataset.remark
    })
  },
})