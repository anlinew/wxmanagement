module.exports = {
  login: '/api/pub/tms/login', //租户登录 method 'post'
  siteapi: "/api/tms/site",   //站点列表 method 'get'
  frontList: "/api/tms/truck",   //站点列表 method 'get'
  waybillList: "/api/tms/waybill",   //调度单列表 method 'get'
  addEmptyFunWaybill: "/api/tms/waybill/createDryRun",   //新增空载 method 'post'
  examineApi: "/api/tms/loan/examine",   //借款审批 method 'post'
  routeListApi : '/api/tms/route', // 查询线路列表 method 'get'
  loanListApi : '/api/tms/loan', //借款列表 method 'get'
  leavenoteListApi : '/api/tms/leavenote/list', //请假列表 method 'get'
  examineLeave : '/api/tms/leavenote/examine', //请假审批 method 'post'
}