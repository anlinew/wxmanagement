import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

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
    examineMoney: '',
    pageNo: 1,
    pageSize: 10,
    unit: ''
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
      pageNo: this.data.pageNo,
      pageSzie: this.data.pageSize
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
            item.color = '#f49f13'
            break;
          case 1:
            item.examineStatus = '待审核';
            item.color = '#4a9cf2'
            break;
          case 2:
            item.examineStatus = '已通过';
            item.color = '#39c782'
            break;
          case 3:
            item.examineStatus = '已驳回';
            item.color = '#ed5b38'
            break;
          default:
            item.examineStatus = null;
            break;
        }
        item.createTime = item.createTime.slice(5,16)
      })
      this.setData({
        list: res.data
      });
    })
  },
  showM: function (e) {
    console.log(e)
    if (e.target.dataset.examinestatus === '2') {
      this.setData({
        examineMoney: ''
      })
    } else if (e.target.dataset.examinestatus === '3') {
      this.setData({
        examineMoney: 0
      })
    }
    this.setData({
      examineStatus: e.target.dataset.examinestatus,
      id: e.target.dataset.id,
      showModal: true,
      unit: e.target.dataset.unit
    })
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
    const params = {
      examineMoney: this.data.unit === '元'?e.detail.value.examineMoney * 100:e.detail.value.examineMoney,
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
        wx.showToast({
          title: '审核成功',
          icon: 'success'
        })
        this.getdetails();
        // setTimeout(function () {
        //   wx.navigateTo({ url: '../documentReview/documentReview' })
        // }, 1000)
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
  // 显示模态框
  handleOpen(e) {
    console.log(e);
    const imgids = e.currentTarget.dataset.imgids.split(',');
    const urls = imgids.map((item) => item = 'http://boyu.cmal.com.cn/api/pub/objurl/name?id=' + item + '&compress=true')
    console.log(urls);
    this.setData({
      visible: true,
      imgList: urls
    });
  },
  // 点击叉叉关闭模态框
  closeMadol() {
    this.setData({
      visible: false,
      imgList: []
    })
  },
  // 点击图片放大预览
  imgTap(e) {
    console.log(e);
    // 为压缩的图片列表
    const imgList = this.data.imgList.map(item => item = item.replace('true', 'false'))
    const current = e.currentTarget.dataset.current.replace('true', 'false')
    wx.previewImage({
      current: current,
      urls: imgList
    })
  },
  // 下拉刷新
  async onPullDownRefresh(e) {
    this.data.pageNo = 1;
    this.data.pageSize = 10;
    wx.showLoading({
      title: '加载中...',
    })
    await this.getdetails();
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
    await this.getdetails();
    setTimeout(()=> {
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'success'
      })
    },500)
  },
})