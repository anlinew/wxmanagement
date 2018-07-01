import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    driver:'',
    phone:'',
    license:'',
    liceniseid:'',
    availableStatus :'0',
    radioItems: [
      { name: '可用', value: '0', checked: true },
      { name: '不可用', value: '3' }
    ],
    liceniseArr: [
    { name: '维修', value: '0'},
    { name: '保养', value: '1' }
    ],
    driverList:[]
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      license: {
        required: true
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      license: {
        required: '检测车辆不能为空'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this.getDriverList()
    this.initValidate()
  },
  /**
   *  监听页面显示，
   *    当从当前页面调转到另一个页面
   *    另一个页面销毁时会再次执行
   */
  onShow: function () {
    let pac = this.data.driverList.find((item) => item.truckLicense === this.data.license)
    if(pac){
      this.setData({
        driver: pac.realName,
        phone: pac.phone,
      });
    }
  },
  checkboxChange: function (e) {
    var liceniseArr = this.data.liceniseArr, values = e.detail.value;
    for (var i = 0, lenI = liceniseArr.length; i < lenI; ++i) {
      liceniseArr[i].checked = false;
      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (liceniseArr[i].value == values[j]) {
          liceniseArr[i].checked = true;
          break;
        }
      }
    }
    this.setData({
      liceniseArr: liceniseArr
    });
  },
  getDriverList(){
    request.getRequest(api.driverList,{
      data:{
        bind:false
      }
    }).then(res => {
      this.setData({
        driverList: res.data
      });
    })
  },
  getPacd(){
    
  },
  openAlert: function() {
    wx.showModal({
      content: '设置车辆状态成功',
      showCancel: false,
      confirmColor:'#666',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    });
  },
  radioChange: function (e) {
    var radioItems = this.data.radioItems;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].value == e.detail.value;
    }
    this.setData({
      radioItems: radioItems,
      availableStatus : e.detail.value
    });
  },
  torepair(e){
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0]
      wx.showModal({
        confirmColor: '#666',
        content: error.msg,
        showCancel: false,
      })
      return false
    }
    const params = { truckId: this.data.liceniseid, availableStatus: this.data.availableStatus };
    request.putRequest(api.acrRepair, {
      data: params,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(res => {
      if (res.result) {
        wx.showModal({
          confirmColor: '#666',
          content: '设置车辆运力状态成功',
          showCancel: false,
        })
        if (this.data.availableStatus==='0'){
          wx.navigateTo({ url: '../carRepair_success/carRepair_success?issuccess=可用' })
        } else if (this.data.availableStatus === '3'){
          wx.navigateTo({ url: '../carRepair_success/carRepair_success?issuccess=不可用' })
        }
      } else {
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
    })
   
  }
})