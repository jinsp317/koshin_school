const Strings = {
  common: {
    app_comingSoon: "马上就来!",
    app_name: "i-sens 达乐",
    app_subname: "i-sens 达乐血糖管理系统",
    app_isens: "i-sens",
    app_dale: "达乐",
    str_ok: "确定",
    str_cancel: "取消",
    str_close: "关闭",
    str_open: "打开",
    str_modify: "修改",
    str_save: "保存",
    str_commit: "提交",
    str_delete: "删除",
    str_record: "记录",
    str_name: "姓名",
    str_identity: "身份证",
    str_hospitalCard: "就诊卡",
    str_handphone: "手机",
    str_sex: "性别",
    str_male: "男",
    str_female: "女",
    str_birthday: "出生",
    str_address: "地址",
    str_identityNum: "身份号码",
    str_year: "年",
    str_month: "月",
    str_date: "日",
    str_hour: "时",
    str_minute: "分",
    str_second: "秒",
    str_week: "周",
    str_day: "测量日期",
    str_glucose: "血糖",
    str_glucoseVal: "血糖值",
    str_glucoseValWithUnit: "血糖值(mmol/L)",
    str_memo: "备注",

    str_resultNormal: "达标",
    str_resultHigh: "偏高",
    str_resultLow: "偏低",
    str_max: "最大",
    str_min: "最小",
    str_measurer: "测量员",
    str_signOut: "登出",
    str_switchAccount: "切换账户",
    str_otherLogin: "其他账户登录",
    str_logIn: "登录",
    str_age: "年龄",
    str_switchShow: "切换展示",
    str_switch: "切换",
    str_switch_day: "切换当天",
    str_allData: "所有数据",
    str_no: "序号",
    str_noData: "暂无数据",
    str_patient: "患者",
    str_state: "状态",
    str_uploadRecord: "上传记录",
    str_certKind: "证件",
    str_search: "搜索",
    str_selectAll: "全选",
    str_selectBedNum: "床号筛选",
    str_changePassword: "修改密码",
    str_opSuccess: "操作成功",
    str_opFailed: "操作失败",

    str_testLiquidKind: "质控液类型",
    str_testPaperNum: "试纸批号",
    str_testLiquidNum: "质控液批号",
    str_testSafeRange: "参考范围",
    str_testUsedPapers: "试纸消耗",
    str_testAddMemo: "添加备注",

    str_noticeEatDel: "取消标记吃饭",
    str_noticeEat: "标记吃饭",
    str_noticeDouble: "标记复测",
    str_noticeReserve: "标记预约",
    str_unknowen: "未知",
    str_anytime: "随机",
    str_remonitor: "复测",
    str_pressure: "血压",
    str_temperature: "体温",
    str_confirm: '提示',
    str_completed: '已执行',
    str_uncompleted: '执行',
    str_today_tasks: '今天任务数',
    str_today_records: '今天记录数',
    str_today_patients: '今天患者数',
    str_insulin_cure1: '手动胰岛素',
    str_insulin_cure2: '胰岛素泵',
    str_prev_sync: '上次刷新',
    str_cur_sync: '本次刷新',
  },
  menu: {
    main_patient: "患者",
    main_statistic: "统计",
    main_monitor: "测量",
    main_data: "菜单",
    main_upload: "传输",
    main_profile: "个人中心",
    upload_failed: "传输失败",
    upload_wait: "待传输",
    signin_input_user: "请输入账户",
    signin_input_password: "请输入密码",
    signin_input_userInfo: "请输入账户和密码",
    signin_config_version: "版本配置",
    signin_remember_password: "记住密码",
    using_bluetooth_server: "蓝牙连接",
    signin_set_wifi: "Wifi设置",
    signin_set_bluetooth: "蓝牙设置",
    signin_signin: "登录",
    config_cloudVersion: "云端版",
    config_lanVersion: "内网版",
    config_hospitalNum: "医院代码",
    config_landAddress: "内网地址",
    config_inputHospitalNum: "请输入医院代码",
    config_inputLanAddress: "请输入内网地址",
    task_patient: "血糖患者",
    task_bloodSugar: "血糖任务",
    task_freeMeasure: "随测",
    task_cureItem: "胰岛素执行",
    task_freeMeasureHistory: "随测记录",
    task_monitorLog: "血糖记录",
    task_todayTask: "今天任务",
    task_trendGraph: "走势图",
    task_glucoseMeasure: "血糖测量",
    task_result: "血糖结果",
    task_insulin: "胰岛素方案",
    task_scanBand: "腕带扫码",
    task_select: "筛选",
    task_getIdentityInfo: "身份证登录",
    task_photo: "拍照",
    task_cardNumber: "卡号",
    task_measureTime: "测量时间",
    task_measurePoint: "测量时段",
    task_measureData: "获取数据",
    task_photoIdentity: "身份拍照",
    setting_password: "修改密码",
    setting_checkVersion: "版本更新",
    setting_checkSyn: "重新加载",
    setting_shareApp: "分享APP",
    setting_quailityTest: "质控检测",
    setting_quailityTestResult: "质控结果",
    setting_pairDevice: "绑定设备",
    setting_help: "使用说明",
    setting_configEnv: "相关操作配置",
    setting_consultReport: "会诊上报",
    setting_switchModeOutPatient: "切换为门诊模式",
    setting_switchModeInHospital: "切换为住院模式",
    portal_warningManage: "预警",
    setting_customMenu: "菜单设置",
    setting_showGlobalHelp: "全局说明",
    setting_loginMode: "解锁方式",
    setting_shortcurtKey: "快捷键",
    task_mealShow: "标记吃饭时间",
    task_retryShow: "标记预约时间",
    setting_dailyTest: "每日质控"
  },
  hospital: {
    huanzheguanli: "患者管理",
    xuetangguanli: "血糖管理",
    huizhenguanli: "会诊管理",
    suifangguanli: "随访管理",
    xuetangyujing: "血糖预警",
    suiceguanli: "随测管理"
  },
  patient: {
    huanzeguanli: "患者管理",
    yuannei: "院内",
    yuanwai: "院外",
    banlizhuyuan: "办理住院",
    faqihuizhen: "发起会诊",
    banlichuyuan: "办理出院",
    xiugaizhuyuan: "修改住院",
    faqisuifang: "发起随访",
    banliruyuan: "办理入院",
    yichuhuanzhe: "移除患者",
    tianjiahuanzhe: "添加患者",
    list_chuanghao: "床号",
    list_zhuyuanhao: "住院号",
    list_xingming: "姓名",
    list_xingbie: "性别",
    list_nianling: "年龄",
    list_zhenduanshijian: "诊断时间",
    list_zhuyuanriqi: "住院日期",
    list_chuyuanriqi: "出院日期",
    list_faqishijian: "发起时间",
    list_huizhenshijian: "会诊时间",
    list_suifangshijian: "随访时间",
    list_keshi: "科室",
    list_zerenyisheng: "责任医生",
    list_zerenhushi: "责任护士",
    info_bingrenxinxi: "患者信息",
    info_yizhujilu: "医嘱记录",
    info_xuetangjilu: "血糖记录",
    info_zhuyuanjilu: "住院记录",
    info_huizhenjilu: "会诊记录",
    info_suifangjilu: "随访记录",
    info_zhuankejilu: "转科记录",
    str_hasInsurance: "有医嘱",
    str_noInsurance: "无医嘱",
    str_completed: "已完成",
    str_incompleted: "未完成",
    str_showChangeDepart: "查看转科记录",
    str_dataTable: "数据列表",
    str_glucoseData: "血糖数据",
    str_glucoseStatistic: "血糖统计",
    str_glucoseChart: "走势图",
    str_glucoseDayChart: "每日走势图",
    str_qualityControl: "血糖质控",
    str_filterDepart: "根据科室筛选",
    str_filterArea: "根据病区筛选",
    str_filterBed: "床号筛选",
    str_filterChargePatient: "责任患者",
    str_diabetesType: "糖尿病类型",
    str_isMarried: "婚姻状况",
    str_hasFamily: "家属史",
    str_smoking: "是否吸烟",
    str_drinking: "是否饮酒",
    str_idCard: "身份证",
    str_delete: "删除患者",
    str_timeName: "时间点",
    str_medName: "胰岛素名称",
    str_amount: "剂量",
    str_sta_patient: "住院患者",
    str_sta_user: "医护人员",
    str_time: "时间"
  },
  message: {
    config_inputIp: "请输入服务器IP域名",
    confirm_exit: "确定退出?",
    confrim_delete: "確定刪除",
    wait_nextVersion: "此功能无法使用，敬请期待下一个版本",
    wait_inWork: "此功能正在开发中，敬请期待",
    input_IdcardNumber: "请输入身份证号",
    input_HospitalcardNumber: "请输入就诊卡号",
    input_MobileNumber: "请输入手机号",
    input_pressure_high: "血压(高)",
    input_pressure_low: "血压(低)",
    input_temperature: "体温",
    input_name: "请输入姓名",
    input_address: "请输入地址",
    input_measureValue: "请手输或设备传值(mmol/L)",
    // input_measureValue: "请手输或设备传值",
    input_patientInfo: "请输入患者信息",
    error_userNamePassword: "你输入的账户名或密码不正确\n请重新输入",
    error_userNick: "你输入的账户名不正确\n请重新输入",
    error_userPassword: "你输入的密码不正确\n请重新输入",
    error_userHospital: "医院代码不正确\n请重新设置",
    error_invalidUser: "无效的账户",
    error_unkown: "未知错误",
    success_bluetooth_server: '蓝牙服务机连接成功。',
    error_refreshFaild: "更新失败",
    dataUpload_success: "数据上传成功",
    dataUpload_fail: "数据上传失败",
    warning_wifi_bad: "数据上传失败\n当前WIFI信号强度太差或网络已断开",
    warning_current_wifi_bad: "当前WIFI信号强度太差或网络已断开",

    connectServer_fail: "未连接网络\n请网路连接或服务器配置",
    download_completed: "已经到底了哦！",
    upload_noData: "暂无数据可上传",
    upload_success: "上传成功",
    confirm_delete: "该患者所有血糖数据即将清空, 确定删除?",
    confirm_back: "还没保存血糖\n您确定要返回吗",
    input_doctorName: "请输入医生姓名",
    input_patientName: "请输入患者姓名",
    input_patientMobile: "请输入患者手机号",
    input_validMobile: "请输入正确的手机号",
    input_bedNumber: "请输入床号",
    input_patientNumber: "请输入住院号",
    input_age: "请输入年龄",
    input_birthday: "请输入出生日期",
    input_inDate: "请输入入院日期",
    input_outDate: "请输入出院日期",
    input_startTime: "请输入发起时间",
    input_consultTime: "请输入会诊时间",
    input_visitTime: "请输入随访时间",
    input_bedSearch: '请输入病人姓名或床号',
    input_department: "请选择科室",
    input_doctor1: "请选择医生",
    input_otherDoctor: "请选择其他医生",
    input_doctor: "请选择责任医生",
    input_nurse: "请选择责任护士",
    op_success: "操作成功",
    op_fail: "操作失败",
    input_memo: "请输入备注",
    bluetooth_enabled: "蓝牙已启用",
    bluetooth_disabled: "蓝牙已禁用",

    input_oldPassword: "请输入旧密码",
    input_newPassword: "请输入新密码",
    input_confirmPassword: "确认密码",
    warning_invalidPassword: "密码长度限制为6~20位",
    warning_nomatchNewPassword: "两次输入密码不一致",
    warning_errorPassword: "当前密码输入错误，请重新输入",
    version_noUpdate: "已是最新版本",
    version_confirm_update: "有版本更新，是否下载",
    warning_plugTestPaper: "请插入试纸检测血糖",
    warning_errorDevice: "发现绑定设备异常",
    input_testPaperNum: "请输入试纸批号",
    input_testLiquidNum: "请输入质控液批号",
    tip_testQuality: "拨出试纸后请点击获取数据",
    input_usedPapers: "请输入试纸消耗数量",
    info_loginSuccess: "登陆成功",
    confirm_reuseTestMonitorValue: "该质控值重复,是否需要使用?",
    confirm_reuseMonitorValue: "该值重复,是否需要使用?",
    alert_monitorPause: "测量已暂停\n点击按钮继续测量",
    alert_monitorStart: "测量已开始\n点击按钮暂停测量",
    input_patientInfoUpload: "请输入患者信息后上传记录",
    alert_isOffline: "当前网络已断开\n\n请检查网络",
    tip_save: "点击头部操作栏的保存图标才生效设置",
    warning_noPrivillage: "当前模式无法使用此功能",
    info_syncIsCurrentlyInProgress: "正在进行数据同步， 需要一段时间，请稍等...",
    cure_complete: '执行后不可修改, 确认执行吗',
    cure_delete: '确认删除吗',
    info_syncSuccess: "加载数据完成。",
    login_network_error : '网络未连接，请重试',
    login_no_network : '无网络, 请检查网络状态.',
    login_server_expired : '服务器连接超时, 请检查网络状态.',
    login_account_error : '账号或密码错误，请重新输入',
    login_no_account : '请输入账号',
    login_no_password : '请输入密码',
    login_offline_signin : '无网络, 离线登录成功.',
    login_offline_expired_signin : '服务器连接超时, 离线登录成功',
  }
};

export default Strings;