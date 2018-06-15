// pages/carRepair/carRepair.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    waySite: ["武汉市", "长沙市", "南昌市"],
    waySiteIndex: 0,
    driver:'',
    phone:'',
    isway:'0',
    radioItems: [
      { name: '可用', value: '0', checked: true },
      { name: '不可用', value: '1' }
    ],
    liceniseArr: [
    { name: '维修', value: '0'},
    // { name: '维修', value: '0', checked: true },
    { name: '保养', value: '1' }],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
      isway: e.detail.value
    });
  }
})