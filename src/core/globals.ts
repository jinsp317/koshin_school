import {
  MenuDataModel,
  PatientModel,
  ObjectModel,
  UserModel,
  DepartmentModel,
  SaveUserModel,
  TaskDataModel,
  ButtonItemModel,
  DailyTestModel,
  GlucoseMonitorModel,
  DeviceModel,
  TestDataModel,
  PointModel,
  TestRangeModel,
  HelpModel,
  HospitalModel,
  FreePatientMeasureModel,
  FreePatientModel
} from "./model";
import Strings from "@src/assets/strings";
import { VersionInfoModel } from "./model/versionInfo.model";
import { NetInfoStateType } from "@react-native-community/netinfo";
import {
  PatientBedIcon,
  StarIconFill,
  LogIconOutline,
  GlucoseMeterIconOutline,
  SettingsIconFill
} from "@src/assets/icons";
import { FreePatientMeasureData } from "./model/monitor.model";
import { FreePatient } from "./model/freePatient.model";
// import { useNetInfo } from "@react-native-community/netinfo";
import BackgroundJob from "react-native-background-job";
import { Dimensions, Platform, PixelRatio } from 'react-native';
const {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
function normalize(size) {
  const newSize = size * scale
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
  }
}
/**
 * Global class for global valuable, constant, function
 * created by @rihyokju 2019-07-29
 */

export default class GLOBAL {
  // static netInfo = useNetInfo();
  static DEBUG = false;
  static token = undefined; // token for http connect
  static versionInfo: VersionInfoModel = {
    id: 0,
    name: "1.0.0",
    number: 1,
    file_name: "app0.apk",
    date: "2019-09-06"
  };
  static versionUp: boolean = false;

  static server_mode = 0; // 0 cloud, 1 local
  // static server_ip: string = "192.168.1.117";
  // static lan_server_ip = "192.168.1.117"; //local server address
  // static readonly cloud_server_ip = "192.168.1.117"; //cloud server address
  static sync_success = 'synchEvent';
  static sync_data_error = 'synchEvent_Data_Err';
  static sync_connect_error = 'synchEvent_Connect_Error';

  static server_ip: string = "47.111.144.204";
  static lan_server_ip = "192.168.1.1"; // local server address
  static readonly cloud_server_ip = "47.111.144.204"; // cloud server address

  static hospital_num: number = 1;

  static readonly wifiStopDbm = -80; // - 30 ~ -85 ok,  dBm 85 ~ - 90 dBm  not so bad - 90 stop work
  static isOffline = false;
  static isSaveInfo = true;
  static connectType: NetInfoStateType = NetInfoStateType.none;

  static readonly MMOL_RATIO = 18.016; // 혈당값계산비률 mmol/L or mg/L
  static readonly SHOW_LOADING = false; // 자료로딩시 화면에 로딩바를 현시시키는가? 현재 측정임무관련화면들에만 적용함

  static readonly foregroundJobKey = "foregroundJobKey"; // 백그라운드서비스 식별자
  static readonly everRunningJobKey = "everRunningJobKey";

  // static lastSyncTime: string = "0000-00-00 00:00:00";
  // static hasFullSynchronized = false;
  static curUser: UserModel = { id: -1, nick: undefined, name: undefined, is_admin: 0 }; // 현재 로그인한 사용자정보
  static curHospitalId: number = -1; // 현재 병원의 식별자
  static switchUser: SaveUserModel = undefined; // 사용자절환때 리용

  static baiduOcrKey1 = "ueIcXkovaK03fkEnRehxqtyL"; // 신분증인식을 위하여 바이두에 우리앱이름으로 등록한 키
  static baiduOcrKey2 = "Mj9UxEuzaFLsufSotThuGvxzmdCfv5Gk";

  static GLUCOSE_MAX_VAL = 40; // 30
  static GLUCOSE_MIN_VAL = 1; // 1
  static newVersion = '20';
  // 20191229 rhj for 3.9~14.8 change to 4.4~10
  static GLUCOSE_LOW_VAL = 4.4; // 3.9;
  static GLUCOSE_HIGH_VAL = 10; // 14.8;


  // target_before_min?: number; //4.4
  // target_before_max?: number; //7, 10 before, after

  // 혈당값 색표시
  static GLUCOSE_NORMAL_COLOR = "#87CD3D";
  static GLUCOSE_HIGH_COLOR = "#BC79F7";
  static GLUCOSE_LOW_COLOR = "#FB6A52";
  static GLUCOSE_NORMAL_COLOR_1 = "#87CD3D";
  static GLUCOSE_HIGH_COLOR_1 = "#BC79F7";
  static GLUCOSE_LOW_COLOR_1 = "#FB6A52";
  // static GLUCOSE_HIGH_COLOR_2 = "#7f007f";
  // static GLUCOSE_LOW_COLOR_2 = "#0000ff";

  // 혈당경고범위
  static GLUCOSE_WARNING_MAX_VAL = 27.5; // 27.5
  static GLUCOSE_WARNING_MIN_VAL = 2.5; // 2.5

  // HIGH~LOW
  static GLUCOSE_INVALID_MAX_VAL = 33.5; // 27.5
  static GLUCOSE_INVALID_MIN_VAL = 1.1; // 2.5

  // 측정시간대
  static serverPoints: PointModel[] = [
    { id: 0, name: "凌晨", from_time: "01:00", to_time: "02:00" },
    { id: 1, name: "早三点", from_time: "03:00", to_time: "04:00" },
    { id: 2, name: "早餐前", from_time: "05:00", to_time: "07:00" },
    { id: 3, name: "早餐后", from_time: "08:00", to_time: "10:00" },
    { id: 4, name: "午餐前", from_time: "11:00", to_time: "12:00" },
    { id: 5, name: "午餐后", from_time: "13:00", to_time: "15:00" },
    { id: 6, name: "晚餐前", from_time: "16:00", to_time: "18:00" },
    { id: 7, name: "晚餐后", from_time: "19:00", to_time: "20:00" },
    { id: 8, name: "睡前", from_time: "21:00", to_time: "23:00" },
    { id: 9, name: "随机", from_time: "00:00", to_time: "00:00" }
  ];
  // 오늘의 측정과제를 위한 시간대
  static todayTaskPoints = [
    { id: 8, name: "昨日睡前", from_time: "21:00", to_time: "23:00" },
    ...GLOBAL.serverPoints,
    { id: 0, name: "明日凌晨", from_time: "01:00", to_time: "02:00" }
  ];

  // 현재 리용않함
  static cashData = {
    // today task as common point + 2
    todayTask: [
      GLOBAL.todayTaskPoints.map((data, index) => {
        return { tasks: undefined };
      }),
      GLOBAL.todayTaskPoints.map((data, index) => {
        return { tasks: undefined };
      })
    ]
  };


  // 혈당값측정기록 례외
  static readonly MONITOR_STATES = [
    "NONE",
    "外出",
    "拒绝",
    "请假",
    "检查",
    "HIGH",
    "LOW",
    "OGTT",
    "自测",
    "其他"
  ];
  static readonly INSULIN_CURE = { '1': '手动胰岛素', '2': '胰岛素泵' };
  static readonly INSULIN_TIME = { 1: '早', 2: '中', 3: '晚', 4: '睡前', 5: '临时', 6: '连续时间点' };
  static readonly INSULIN_TNAME = ['早', '中', '晚', '睡前', '临时', '连续时间点'];
  static readonly COMMON_POINTS = [
    "凌晨",
    "早三点",
    "早餐前",
    "早餐后",
    "午餐前",
    "午餐后",
    "晚餐前",
    "晚餐后",
    "睡前",
    "随机"
  ];
  static readonly HOURS = ['0', '1', '2', '3', '4', ''];
  static readonly MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', ''];
  static readonly WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  static readonly BEGINTIMES = [
    "所有日期",
    "最近一周",
    "最近两周",
    "最近一个月",
    "最近三个月",
    "最近六个月"
  ];
  static readonly FINDTIMES = ["本次住院", "今天", "昨天", "近三天"];
  static readonly FINDPOINTS = ["所有餐段", "三餐前", "三餐后"];

  static curFPMLogBeginTimeIndex = 1; // 1 week
  static curGlucoseLogABeginTimeIndex = 1;
  static mealState = 10;
  static retryState = 11;
  static curRouteName: string;
  static IS_FIRST_VISIT = true;

  static readonly REMONITOR_A = ["不复测", " 5分钟", "10分钟", "15分钟", "20分钟", "25分钟"];
  static readonly REMONITOR_B = ["不复测", "30分钟", "60分钟", "90分钟"];

  static savedUsers: SaveUserModel[] = []; // 로그인했던 리용자들... {id, password}

  static myUsers: UserModel[] = []; // 로그인한 어카운트에 소속된 어카운트들...(자신포함)
  static curSearchUserIndex = 0; // all

  static defDepartId = 1;
  static totalDepartments: DepartmentModel[] = []; // 병원의 전체 과, 의사, 간호사배렬 포함

  static totalAreas: ObjectModel[] = [];

  static filterPaitentIds: number[] = []; // 측정/ 환자 필터에 적용하는 아이디목록
  static isFilterMyCharge = false;
  static isFilterPatients = false;
  static keyWord = '';
  static alarmSounds: any[] = [];

  static bluetoothServer: any = undefined; /// bluetooth 써버주소객체보관
  static BluetoothConnState: boolean = false; /// bluetooth 써버에 접속하고 있는 상태
  static usingBluetoothServer: boolean = false; /// bluetooth를 리용한 동기화방식인가?

  static sn = "";
  static isChineseDevice = false;
  static curDevice: DeviceModel = { type: 1, id: undefined, name: undefined }; // bluetooth device : 0, otg: 1

  static curPatient: PatientModel = undefined;
  static detailPatientTab = 0;
  static isSignOut = false; // 登出
  static isSignin = false;
  static isOtherLogin = false; // 其他账户登录
  // static tobeUpdateUpload = false;
  static curHospitalMode = 0; // 0 in hospital, 1 out patient
  //  static beginUpload = false;
  static needInitFPMdata = false;

  static SEXS: string[] = ["男", "女", "中"];
  static WARNINGTYPES = ["正常", "HI", "LO"];

  static DOCTORSORDERS = ["全部", "有医嘱", "无医嘱"];
  static TASKTIMEFILTERS = ["全部", "最近一小时未测量", "最近两小时未测量"];

  static MENUDATA_TASK: MenuDataModel[] = [
    { caption: "血糖记录", route: "Task MonitorLog" },
    { caption: "血糖患者", route: "Task Patient" },
    { caption: "血糖任务", route: "Task Glucose" },
    { caption: "胰岛素执行", route: "Task Cure" },
    { caption: "统计", route: "Patients Statistic" },
    { caption: "随测", route: "Task FreeMeasure" }
  ];
  static MENUDATA_PATIENT: MenuDataModel[] = [
    { caption: "血糖数据", route: "Patient GlucoseLogA" },
    { caption: "患者信息", route: "Patient InfoLog" },
    { caption: "胰岛素方案", route: "Patient DoctorsOrderLog" },
    { caption: "医嘱记录", route: "Patient DoctorsOrderLog" },
    { caption: "住院记录", route: "Patient InHospitalLog" },
    { caption: "会诊记录", route: "Patient ConsultLog" },
    { caption: "随访记录", route: "Patient VisitLog" },
    { caption: "血糖走势图", route: "Patient GlucoseChart" },
    { caption: "今天任务", route: "Patient TodayTask" }
    //    { caption: "每日走势图", route: "Patient GlucoseDayChart" },
  ];
  static MENUDATA_DIABETES: string[] = [
    "待诊断",
    "1型糖尿病",
    "2型糖尿病",
    "妊娠糖尿病",
    "其他",
    "非糖尿病"
  ];
  static MENUDATA_MARRIED = ["未婚", "已婚"];

  static portalItems: ButtonItemModel[] = [
    { id: 0, text: "患者管理", icon: PatientBedIcon, status: "info", disabled: false, valid: true },
    {
      id: 1,
      text: "血糖记录",
      icon: LogIconOutline,
      status: "danger",
      disabled: false,
      valid: true
    },
    {
      id: 2,
      text: "随测管理",
      icon: GlucoseMeterIconOutline,
      status: "success",
      disabled: false,
      valid: true
    },
    {
      id: 3,
      text: "个人中心",
      icon: SettingsIconFill,
      status: "primary",
      disabled: false,
      valid: true
    },
    {
      id: 4,
      text: "预警管理",
      icon: StarIconFill,
      status: "warning",
      disabled: false,
      valid: true
    },
    { id: 5, text: "会诊管理", icon: StarIconFill, status: "info", disabled: true, valid: false },
    { id: 6, text: "血糖预警", icon: StarIconFill, status: "info", disabled: true, valid: false },
    { id: 7, text: "转诊管理", icon: StarIconFill, status: "info", disabled: true, valid: false },
    { id: 8, text: "统计", icon: StarIconFill, status: "primary", disabled: false, valid: true }
  ];

  static HEADERITEMS_PATIENTS = [];
  static HEADERITEMS_INHOSPITALS = ["责任医生", "住院日期", "出院日期", "当前状态"]; // , "操作"];
  static HEADERITEMS_CHANGEDEPARTS = [
    "转出科室",
    "转出日期",
    "转出人",
    "转入科室",
    "转入日期",
    "转入人"
  ];
  static HEADERITEMS_CONSULTS = ["发起科室", "会诊医生", "发起时间", "会诊时间", "当前状态"];
  static HEADERITEMS_VISITS = ["随访医生", "随访时间", "发起者", "当前状态", "图片", "备注"];
  static HEADERITEMS_DOCTORSORDERS = ["开始时间", "截止时间", "医嘱内容", "下医嘱医生", "当前状态"];
  static readonly HEADERITEMS_GLUCOSELOGB = ["测量时间", "时段", "血糖值", "测量员"];
  static readonly HEADERITEMS_MONITORLOGB = [
    "床号",
    "姓名",
    "测量时间",
    "时段",
    "血糖值",
    "测量员"
  ];

  // config env
  static TASK_CHECK_INTERVAL_LABELS = ["关闭", "10分钟", "30分钟", "60分钟"];
  static TASK_CHECK_INTERVAL_VALUES = [-1, 600, 1800, 3600];
  static curTaskCheckIntervalIdx = 3;

  static DATA_SYNC_INTERVAL_LABELS = ["关闭", "30秒", "1分钟", "2分钟", "5分钟", "10分钟", "60分钟"];
  static DATA_SYNC_INTERVAL_VALUES = [-1, 30, 60, 120, 300, 600, 3600];
  static curDataSyncIntervalIdx = 1;

  static ALARM_REPEAT_COUNTS = ["一次", "反复"];
  static curAlarmRepeatCount = 0;
  static ONOFF_LABELS = ["打开", "关闭"];
  static curWarningCheckIdx = 0;
  static MONITOR_AUTOSAVE_DELAY_LABELS = ["5秒", "3秒", "0秒", "手动保存"];
  static curMonitorAutoSaveDelayIdx = 2;
  static curWarningPlaySoundEnabled = 1;
  static signInMode = 1; /// 0 - normal , 1 - quick
  static curGlobalHelpIdx = 0;
  static curDailyTest: DailyTestModel = {
    disabled: 1,
    time: "2000-01-01 12:01:01",
    target_kind: 1
  };
  static curTestRange: TestRangeModel = {
    low_min: 2.2,
    low_max: 3.9,
    middle_min: 6.4,
    middle_max: 8.4,
    high_min: 14.8,
    high_max: 20
  };

  static readonly TEST_TARGETS = ["检测即可", "检测通过"];
  static readonly CURE_TIME = ['早', '中', '晚', '睡前', '临时', '连续时间点'];
  // for free patient
  static curFreePatient: FreePatientModel = {
    name: undefined,
    cert_num: undefined,
    cert_kind: 0, // 0 identity, 1 hospitalCard, 2 phoneNumber
    gender: 0,
    birthday: "2000-01-01"
  };

  static p_measureTime = "2019-01-01 10:10:10";
  static p_timeMark = 9; // free time
  static p_temperatrue = 0;
  static p_pressure_low = 0;
  static p_pressure_high = 0;
  static recordMultiHeight = 25;
  static recordNormalHeight = 40;

  // interface
  static readonly TOOL_BAR_HEIGHT = 46;
  static readonly HEAD_BAR_HEIGHT = 48; // 56;
  static readonly HEAD_BAR_2LINE_HEIGHT = 56;
  static readonly HEAD_BAR_3LINE_HEIGHT = 60;

  // for quailty test
  static readonly TEST_LIQUID_KINDS = ["高", "中", "低"];
  static curTestQuality: TestDataModel = {
    department_id: undefined,
    user_id: undefined,

    paper_number: undefined,
    liquid_number: undefined,
    liquid_type: 0,
    min: 3,
    max: 16,
    value: undefined,
    result_type: 0, // 0 unknown, 1 pass, 2 no pass
    use_number: 1
  };
  // for task
  static TASK_ALARM_INTERVAL = 60000 * 30;
  static readonly AlarmKey_ResetApp = "190710";
  static readonly AlarmKey_OpenBatterySetting = "190711";
  static readonly AlarmKey_CheckTask = "190712";
  static readonly AlarmKey_GlucoseAlert = "190713";

  static curHospital: HospitalModel = { id: 1, name: "", help: "使用指南", high_color: '', low_color: '', pass_color: '', normal_color: '', prepare_color: '' };

  static help = "使用指南";
  static alarmNotifDataDef = {
    id: "123456", // Required
    title: "i-SENS 达乐血糖管理系统", // Required
    message: "", // Required
    channel: "rhj_channel_id", // Required. Same id as specified in MainApplication's onCreate method
    ticker: "i-SENS达乐提示",
    auto_cancel: true, // default: true
    vibrate: true,
    vibration: 100, // default: 100, no vibration if vibrate: false
    small_icon: "ic_launcher", // Required
    large_icon: "ic_launcher",
    play_sound: true, // true,
    sound_name: "my_alarm.mp3", // Plays custom notification ringtone if sound_name: null
    color: "red",
    schedule_once: true, // Works with ReactNativeAN.scheduleAlarm so alarm fires once
    tag: "some_tag",
    fire_date: undefined, // Date for firing alarm, Required for ReactNativeAN.scheduleAlarm.
    // const fireDate = '01-01-1976 00:00:00';			  // set exact date time | Format: dd-MM-yyyy HH:mm:ss

    // You can add any additional data that is important for the notification
    // It will be added to the PendingIntent along with the rest of the bundle.
    // e.g.
    data: { foo: "bar" }
  };
  static readonly fontSize = {
    xs: normalize(14),
    sm: normalize(16),
    md: normalize(17)
  }
  static curFontSize: string = 'sm';
  static startBackgroundJobs() {
    // for first check current task and warning from server
    // SYNC_HELPER.monitorMyTask("first key");
    // 자료동기화 스레드
    BackgroundJob.cancelAll();
    if (GLOBAL.curDataSyncIntervalIdx > 0) {
      const interval = GLOBAL.DATA_SYNC_INTERVAL_VALUES[GLOBAL.curDataSyncIntervalIdx];
      if (__DEV__) console.info("background job interval = ", interval);
      BackgroundJob.schedule({
        jobKey: GLOBAL.foregroundJobKey,
        timeout: 4000,
        period: interval * 1000,
        exact: true,
        allowExecutionInForeground: true,
        allowWhileIdle: true,
      });
    }

    if (GLOBAL.curTaskCheckIntervalIdx > 0) {
      const interval = GLOBAL.TASK_CHECK_INTERVAL_VALUES[GLOBAL.curTaskCheckIntervalIdx];
      if (__DEV__) console.info("background job interval = ", interval);

      BackgroundJob.schedule({
        jobKey: GLOBAL.everRunningJobKey,

        notificationTitle: "iSens达乐",
        notificationText: "Notification text",

        period: interval * 1000, // 5m
        exact: true,
        allowExecutionInForeground: true,
        allowWhileIdle: false, // true
      });
    }
  }
  static isChineseDeviceCheck(sn: string) {
    if (sn &&
      (sn.startsWith("F040")
        || sn.startsWith("F042")
        || sn.startsWith("F038")
        || sn.startsWith("F036"))) {
      return true;
    } else {
      return false;
    }
  }
}
