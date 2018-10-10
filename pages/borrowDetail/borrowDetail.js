import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
     showModal: false,
     disagreeArr: ['借款次数已使用完毕','请提供相关照片','不同意'],
     agreeArr: ['请合理使用资金，谢谢','同意','辛苦了，谢谢'],
      id:'',
      status:'',
      details:{},
      examineStatus:'',
      examineRemark:'',
      examineMoney:'',
      disabled: false
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      examineMoney: {
        required: true,
        digits: true,
        maxlength: 6
      },
      examineRemark: {
        required: true,
        maxlength: 100
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      examineMoney: {
        required: '审批金额不能为空',
        digits:'审批金额只能输入数字',
        maxlength:'审批金额最多可以输入6位'
      },
      examineRemark: {
        required: '审批备注不能为空',
        maxlength: '审批备注最多可以输入100位'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this.setData({
      id: options.id,
      status: options.status
    });
    this.getDetails();
    this.initValidate()
  },
  getDetails(){
    request.getRequest(api.loanListApi, {
        data: {
          id: this.data.id,
        }
      }).then(res=>{
        const details = res.data[0]
        if (details.examineStatus === 0) {
          details.examineStatus = '待审核';
          details.color = '#FF9900 '
        } else if (details.examineStatus === 2) {
          details.examineStatus = '已审批';
          details.color = '#19be6b'
        } else if (details.examineStatus === 3) {
          details.examineStatus = '已驳回';
          details.color = '#FF6600'
        } else if (details.examineStatus === 4) {
          details.examineStatus = '已打款';
          details.color = '#09BB07'
        } else if (details.examineStatus === 5) {
          details.examineStatus = '已还款';
          details.color = '#2F9833'
        } else if (details.examineStatus === 6) {
          details.examineStatus = '已作废';
          details.color = '#B4B4B4'
        }
        this.setData({
          details:res.data[0],
          examineMoney: res.data[0].money * 0.01,
      })
    })
  },
  showM: function (e) {
    console.log(e)
    if (e.currentTarget.dataset.examinestatus === '3') {
      this.setData({
        examineStatus: e.target.dataset.examinestatus,
        showModal: true,
        disabled: false,
        examineMoney: '0'
      })
    } else {
      this.setData({
        examineStatus: e.target.dataset.examinestatus,
        showModal: true,
        disabled: false,
        examineMoney: this.data.details.money * 0.01
      })
    }
  },
  preventTouchMove: function () {

  },
  examine(e) {
    console.log(e)
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0]
      wx.showModal({
        confirmColor: '#666',
        content: error.msg,
        showCancel: false,
      })
      return false
    }
    this.setData({
      disabled: true
    })
    const params = {
      examineMoney: e.detail.value.examineMoney*100,
      examineRemark: e.detail.value.examineRemark,
      examineStatus: Number(this.data.examineStatus),
      id:this.data.id
    }
    if (params.examineStatus === 2 ){
      let oldmoney = this.data.details.money * 0.01;
      let newmoney = e.detail.value.examineMoney;
      if (Number(newmoney) !== Number(oldmoney)) {
        wx.showModal({
          title: '提示',
          content: `审批金额${newmoney}与申请金额${oldmoney}不一致，请确认是否继续审批通过？`,
          success: (res) => {
            if (res.confirm) {
              this.confirmExamine(params)
            } else if (res.cancel) {
            }
          }
        })
      }else {
        this.confirmExamine(params)
      }
    } else if (params.examineStatus === 3) {
      params.examineMoney = 0;
      this.confirmExamine(params)
    }
  },
  confirmExamine(params){
    request.postRequest(api.examineApi, {
      data: params,
      header: {
        'Accept': 'application/json, text/plain, */*'
      },
    }).then(res => {
      if (res.result) {
        wx.showToast({
          title: '审核成功',
          icon: 'success',
          success: (e)=> {
            var pages = getCurrentPages();
            var backPage = pages[pages.length-2]  // 上个页面
            setTimeout(function () {
              wx.navigateBack({
                delta: 1, // 回退前 delta(默认为1) 页面
              })
              backPage.getLoanList();
            }, 1000)
          }
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
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
      examineRemark: '',
      examineMoney: ''
    })
  },
  getLicense(e) {
    this.setData({
      examineRemark: e.currentTarget.dataset.remark
    })
  },
})