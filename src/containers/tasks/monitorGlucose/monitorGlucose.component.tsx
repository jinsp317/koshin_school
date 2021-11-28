/**
 * created by @rihyokju 2019
 * 혈당측정 컴포넌트
 * Update by KimYongIL 2020
 */
import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableOpacityProps,
  Image,
  ToastAndroid,
  Dimensions,
  Alert,
  EmitterSubscription,
  DeviceEventEmitter,
  NativeModules,
  PermissionsAndroid,
  ActivityIndicator,
  ImageProps,
  BackHandler,
  Picker
} from "react-native";
import {
  ThemeType,
  withStyles,
  ThemedComponentProps,
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Input, Text } from "@src/core/react-native-ui-kitten/ui";
import { ContainerView, textStyle, SlideMenu, EditInput } from "@src/components/common";
import { BloodDropIconFill, MyPatientIcon, DefAvataIconFill } from "@src/assets/icons";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "../../styles/common";
import { careSensHelper } from "@src/core/utils/caresensHelper";
import { ProfileSetting } from "@src/components/social";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faUtensils, faClock, faTrash } from '@fortawesome/free-solid-svg-icons'
import {
  PatientModel,
  GlucoseMonitorModel,
  MonitorModel,
  MANAGE_KIND,
  TaskDataModel,
  RequestGlucoseMonitorModel,
} from "@src/core/model";
import Spinner from "react-native-spinkit";
import DateTimePicker from "react-native-modal-datetime-picker";
import wifi from "react-native-android-wifi";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import { NoticeModel } from "@src/core/model/notice.model";
import AlertPro from "@src/components/common/alertPro";
import { NavigationParams } from "react-navigation";
import moment from "moment";
import { monitorMyTask } from "@src/core/syncHelper";
import ScrollPicker from '@src/components/react-native-picker-scrollview-master';
import { database } from '../../../core/utils/database';
const CareSens = NativeModules.CareSens;
interface ComponentProps {
  navigation: NavigationParams;
  taskPatient: TaskDataModel;
  onSavePress: (monitor: GlucoseMonitorModel, wifiOK: boolean) => void;
  pauseMeasure: boolean;
  myKind: number;
  needInit: boolean;
  isLoading: boolean;
  errorDevice: boolean;
  _notice: NoticeModel;
  onNeedInit: (needInit: boolean) => void;
  onSaveNotice: (notice: NoticeModel, kind: MANAGE_KIND) => void;
  onManualInput: () => void;
  onPostTimeSelect: (kind: number, point: number) => void;
  tempMonitor?: MonitorModel;
  removeTicket: (monitor: GlucoseMonitorModel) => void;
  goBack: () => void;
}
interface State {
  noticeDelMsg: string;
  measureBtnCaption: string;
  saveBtnEnabled: boolean;
  maxGlucose: number;
  timer: any;
  bluetoothEnabled: boolean;
  tempMonitor: MonitorModel;
  measureTime: Date;
  measurePoint: number;
  pulsePause: boolean;
  remainUploadTime: number;

  saveBtnCaption: string;
  errorDevice: boolean;
  isLoading: boolean;

  isMonitorTimeVisible: boolean;

  noticeMealTime: Date;
  noticeRetryTime: Date;
  hasTask: boolean;
  isRetry: boolean;
  memo: string;
  buttonDisabled: boolean;
  isEnableTime: boolean;
}

export type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props, State> {
  private focusListener: any;
  private _alertPro: any;
  private _alertPro2: any;
  private _alertPro3: any;
  private _curGlucoseVal: number;

  private _measureSeqNum: number = 0;
  private _taskPatient: TaskDataModel;
  readonly _delayCount = GLOBAL.curMonitorAutoSaveDelayIdx === 0 ? 6 : 4;
  private _prevDevId = undefined;
  private _prevValidState = undefined;
  private _canShowAlert = true;

  private bluetoothEnabledListener: EmitterSubscription;
  private bluetoothDisabledListener: EmitterSubscription;
  private errorListener: EmitterSubscription;
  private deviceConnectedListener: EmitterSubscription;
  private foundedDeviceListener: EmitterSubscription;
  private totalCountListener: EmitterSubscription;
  private dataDownloadedListener: EmitterSubscription;
  private dataListener: EmitterSubscription;
  private failedConnectDeviceListener: EmitterSubscription;
  private connectionFailedListener: EmitterSubscription;
  private deviceDisconnectedListener: EmitterSubscription;
  private getLatestDataOtgListener: EmitterSubscription;
  private getOtgDeviceSNListener: EmitterSubscription;

  private _intervalSaveProc = undefined;
  private _points: string[];
  private _isInSaveProc: boolean;
  private _isGetLatestValue = false;
  private _kind: number;
  private _isConnecting = false;
  private _isInSaving: boolean = false;
  private _measureSid: number = 0;
  private _timeKind: number;
  private _curTime: Date;

  constructor(props: Props) {
    super(props);
    GLOBAL.isChineseDevice = false;
    this._isConnecting = false;
    this._taskPatient = this.props.taskPatient;
    this._isInSaveProc = false;
    this._isGetLatestValue = false;
    this._isInSaving = false;
    this._kind = this.props.myKind;
    this._timeKind = 1;
    this._curTime = new Date();
    // UTILS.alert("" + UTILS.createDate(this._taskPatient.record.time));
    const anytime = this._taskPatient.task_type === 2 ? this._taskPatient.task_detail.time : "";
    // UTILS.getMinuteString(undefined); //anytime
    this._points = GLOBAL.COMMON_POINTS.map((e, index) => {
      return index === UTILS.getAnytimePoint() ? `${e} ${anytime}` : e;
    });
    const fTime = moment().format('YYYY-MM-DD') + ' 02:00:00';
    const sTime = moment(fTime).toDate();
    let point = UTILS.getPointFromNow();
    if (this._taskPatient.task_type > 0) {
      point = UTILS.getPointId(this._taskPatient);
    } else {
      if (this._taskPatient.record && this._taskPatient.record.point !== undefined) {
        point = this._taskPatient.record.point;
      }
    }

    if (!this._taskPatient.record) {
      // console.log("_monitor is undefined-----------");
      this._taskPatient.record = {
        id: undefined,
        patient_id: this._taskPatient.id,
        point: point,
        value: undefined,
        time: moment().format("YYYY-MM-DD HH:mm:ss"),
      };
    }

    this.state = {
      noticeDelMsg: undefined,
      tempMonitor: this.props.tempMonitor,
      measureBtnCaption: Strings.menu.task_measureData,
      saveBtnEnabled: false,
      maxGlucose: 0,
      timer: undefined,
      bluetoothEnabled: undefined,
      measureTime: new Date(), // this._monitor.time),
      measurePoint: point,
      pulsePause: undefined,
      isEnableTime: false,
      remainUploadTime: this._delayCount, // second
      isRetry: false,
      saveBtnCaption: Strings.common.str_uploadRecord,
      errorDevice: this.props.errorDevice,
      isLoading: this.props.isLoading,
      isMonitorTimeVisible: false,
      noticeMealTime: sTime,
      noticeRetryTime: sTime,
      memo: this._taskPatient.record.memo,
      hasTask: this.props.taskPatient.task_type > 0 ? true : false,
      buttonDisabled: false
    };
  }

  componentDidMount() {
    this._isConnecting = false;
    this._isInSaveProc = false;
    this._isInSaving = false;
    this.postPointCheck(this.state.measurePoint);
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      // The screen is focused
      // Call any action
      let measureTime: Date;
      if (!this._taskPatient.record.time) measureTime = new Date();
      else if (this._kind === 1) {
        measureTime = new Date(Date.parse(this._taskPatient.record.time));
      } else {
        measureTime = moment(this._taskPatient.record.time, "YYYY-MM-DD HH:mm:ss").toDate();
      }
      measureTime.setHours(new Date().getHours());
      measureTime.setMinutes(new Date().getMinutes());
      measureTime.setSeconds(0);
      // Alert.alert("!!!!" + measureTime);
      this.setState({ measureTime: measureTime });
    });
    this.bluetoothEnabledListener = DeviceEventEmitter.addListener("bluetoothEnabled", (e) =>
      this.bluetoothEnabled(e)
    );
    this.bluetoothDisabledListener = DeviceEventEmitter.addListener("bluetoothDisabled", (e) =>
      this.bluetoothDisabled(e)
    );
    this.errorListener = DeviceEventEmitter.addListener("error", (e) => this.error(e));
    this.foundedDeviceListener = DeviceEventEmitter.addListener("foundedDevice", (e) =>
      this.foundedDevice(e)
    );
    this.deviceConnectedListener = DeviceEventEmitter.addListener("foundedDevice", (e) =>
      this._isConnecting = true
    );
    this.totalCountListener = DeviceEventEmitter.addListener("totalCount", (e) =>
      this.totalCount(e)
    );
    this.dataDownloadedListener = DeviceEventEmitter.addListener("lastDataDownloaded", (e) =>
      this.dataDownloaded(e)
    );
    this.dataListener = DeviceEventEmitter.addListener("data", (e) => this.data(e));
    this.failedConnectDeviceListener = DeviceEventEmitter.addListener(
      "connectionToDeviceFailed",
      (e) => this.errorConnectDevice(e)
    );
    this.connectionFailedListener = DeviceEventEmitter.addListener("connectionFailed", (e) =>
      this.connectionFailed(e)
    );
    this.deviceDisconnectedListener = DeviceEventEmitter.addListener("deviceDisconnected", (e) =>
      this.deviceDisconnected(e)
    );

    this.getLatestDataOtgListener = DeviceEventEmitter.addListener("getLatestDataOTG", e =>
      this.latestDataOtgDownloaded(e)
    );
    this.getOtgDeviceSNListener = DeviceEventEmitter.addListener("getSnOTG", e =>
      this.otgDeviceSnDownloaded(e)
    );
    // this.requestBluetoothPermissions();
    this._measureSid = -1;
    if (GLOBAL.curDevice.type === 0) {
      careSensHelper
        .initialize()
        .then(() => {
          const isPause = this.state.errorDevice ? true : this.props.pauseMeasure;
          if (__DEV__) console.info("call onPausePulse in initialize");
          this.onPausePulse(isPause, false, true);
        })
        .catch((reason) => {
          this.setState({ errorDevice: true });
          UTILS.showToast("初始化失败" + reason);
        });
    } else {
      this.onPausePulse(this.props.pauseMeasure, false, true);
    }
  }
  componentWillMount() {
    this.setNavigationParams();
  }
  private setNavigationParams() {
    this.props.navigation.setParams({
      caption: this._taskPatient.name,
      onLeftPress: this.onLeftPress,
    });
  }
  private postPointCheck = (point: number) => {
    const params: RequestGlucoseMonitorModel = {
      patient_id: this._taskPatient.id,
      points: [point],
      begin_time: UTILS.getFormattedDate(this.state.noticeMealTime, 0),
      is_group: -1,
    };
    database.recordsHelper.getGlucoseMonitorsRecordCount(params).then(res => {
      if (__DEV__) console.info(res);
      const flag = res.count > 0;
      if (__DEV__) console.info(flag);
      this.setState({ isEnableTime: flag, measurePoint: point });
      // if(res.count == 0){}
      /// console.log(res);
    });
  }
  private onLeftPress = () => {
    if (this._intervalSaveProc) {
      this.cancelSaveProc();
      this._alertPro3.open();
    } else this.props.navigation.goBack();
  }

  componentWillUnmount() {
    // BackHandler.removeEventListener("hardwareBackPress", () => { });
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);

    this.bluetoothEnabledListener.remove();
    this.bluetoothDisabledListener.remove();
    this.errorListener.remove();
    this.deviceConnectedListener.remove();
    this.foundedDeviceListener.remove();
    this.totalCountListener.remove();
    this.dataDownloadedListener && this.dataDownloadedListener.remove();
    this.dataListener.remove();
    this.failedConnectDeviceListener.remove();
    this.connectionFailedListener.remove();
    this.deviceDisconnectedListener.remove();
    this.getLatestDataOtgListener.remove();
    this.getOtgDeviceSNListener.remove();
    this.focusListener && this.focusListener.remove();
    // this.focusListener && this.focusListener.remove();
    this._measureSid = -1;
    if (GLOBAL.curDevice.type === 0) careSensHelper.disconnect();
    CareSens.stopScan();
  }
  componentWillReceiveProps(nextProps: Props) {
    const monitor = nextProps.tempMonitor;
    this.setState({
      errorDevice: nextProps.errorDevice,
      isLoading: nextProps.isLoading,
    });
    if (monitor && !this._isInSaving) {
      if (this.state.tempMonitor !== monitor && monitor) {
        this.setState({ tempMonitor: monitor }, () => {
          this.onPausePulse(true, false);
          this.beginSaveProc();
          this._canShowAlert = true;
        });
      }
    } else {
      if (nextProps.pauseMeasure === false) {
        this.onPausePulse(false, false);
      }
    }
    if (nextProps.needInit) {
      this.initInputsState();
    }
  }
  private removeTicket = () => {
    this._taskPatient.record.point = this.state.measurePoint;
    this._taskPatient.record.time = UTILS.getFormattedDate(this.state.measureTime, 1);

    const record = this._taskPatient.record;
    this.props.removeTicket(record);

  }
  handleBackButton = () => {
    if (this._intervalSaveProc) {
      this.cancelSaveProc();
      this._alertPro3.open();
      return true;
    } else return false;
  };
  _renderAlertBack = () => {
    return (
      <AlertPro
        ref={(ref) => {
          this._alertPro3 = ref;
        }}
        onConfirm={() => this.props.goBack()}
        onCancel={() => this._alertPro2.close()}
        message={Strings.message.confirm_back}
      />
    );
  };

  private initInputsState = (initGlucose = true) => {
    if (initGlucose) {
      this.setState(
        {
          tempMonitor: undefined,
        },
        () => this.props.onNeedInit(false)
      );
    } else {
      this.props.onNeedInit(false);
    }
  };

  async requestBluetoothPermissions() {
    try {
      let granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        if (__DEV__) console.info("You can use the ACCESS_COARSE_LOCATION permission");
      } else {
        if (__DEV__) console.info("ACCESS_COARSE_LOCATION permission access denied");
      }

      granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        if (__DEV__) console.info("You can use the ACCESS_FINE_LOCATION permission");
      } else {
        if (__DEV__) console.info("ACCESS_FINE_LOCATION permission  access denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }
  /** message reciever */
  bluetoothEnabled(e) {
    if (__DEV__) console.info(Strings.message.bluetooth_enabled);
    UTILS.showToast(Strings.message.bluetooth_enabled);
    this.setState({ bluetoothEnabled: true });
  }

  bluetoothDisabled(e) {
    if (__DEV__) console.info(Strings.message.bluetooth_disabled);
    UTILS.showToast(Strings.message.bluetooth_disabled);
    this.setState({ bluetoothEnabled: false });
  }

  error(e) {
    if (e.e) {
      if (__DEV__) console.error(`Error: ${e.message}`);
      /// UTILS.showToast(e.e.message);
    }
  }

  errorConnectDevice(e) {
    if (__DEV__) console.warn(`Error Connect to Device`, e);
    // UTILS.showToast("Error Connect to Device");
  }
  connectionFailed(e) {
    if (__DEV__) console.info(`connectionFailed` + e.message + e.device.id);
    // UTILS.showToast("connectionFailed");
  }
  deviceDisconnected(e) {
    if (__DEV__) console.info("device disconnected -----------------", e.device.id);
    /*
    if (!this.state.pulsePause) {
      console.log("call start connnectToDevice");
      careSensHelper.connnectToDevice();
    }
    */
  }
  foundedDevice = async (e) => {
    if (GLOBAL.curDevice.type > 0) return;
    if (e) {
      GLOBAL.sn = e.serialNumber;
      if (__DEV__) {
        console.info("-------------------------name:", e.device.name);
        console.info("founded device:", e.device.id);
      }

      /// UTILS.showToast("" + e.timeFound);
      if (e.device.name === GLOBAL.curDevice.name) {
        if (this.foundedDeviceListener) this.foundedDeviceListener.remove();
        await CareSens.stopScan();

        careSensHelper
          .connnectToDevice(true, GLOBAL.curDevice.useLast)
          .then((result) => {
            // this._isConnecting = true;
          })
          .catch((error) => {
            this.setState({ pulsePause: true });
            UTILS.showToast("失败（connnectToDevice）", ToastAndroid.LONG);
            this._isConnecting = false;
          });

      }
      this._measureSeqNum = Number(e.sequenceNumber);
    }
  };
  // 불루투스설비내의 레코드총개수
  totalCount(e) {
    if (GLOBAL.curDevice.type > 0) return;
    if (e) {
      if (e.device.id && e.device.id == GLOBAL.curDevice.id) {
        if (!GLOBAL.curDevice.record_count) GLOBAL.curDevice.record_count = e.totalCount;
        else if (GLOBAL.curDevice.record_count !== e.totalCount) {
          // for new value
          GLOBAL.curDevice.record_count = e.totalCount;
          this._measureSeqNum++;
        }

        // careSensHelper.downloadLast(GLOBAL.curDevice.useLast);
        if (__DEV__) console.info(`总记录<${e.device.id}> ${e.totalCount} after seq:${this._measureSeqNum}`);
      } else {
        UTILS.showToast(
          `总记录<${e.device.id}> ${e.totalCount} 绑定验证失败(绑定ID=${GLOBAL.curDevice.id})`,
          ToastAndroid.SHORT
        );
        this.onPausePulse(true, false);
      }
    }
  }
  // 설비에서 측정값받은 이후 처리부
  procRecieveData = () => {
    if (this._curGlucoseVal == 0 || this._curGlucoseVal == undefined) return;
    this.setState({ tempMonitor: { value: this._curGlucoseVal, state: 0 } });
    // this.onPausePulse(true, false);

    this.beginSaveProc();
    this._canShowAlert = true;
    this._isInSaveProc = false;
  };
  procUnrecieveData = () => {
    this.onPausePulse(true, false);
    this.onPausePulse(false, false);
    this._canShowAlert = true;
    this._isInSaveProc = false;
  };
  // 유선설비에서 SN과 최신기록얻기
  otgDeviceSnDownloaded(e) {
    // FIXME:
    if (__DEV__) {
      console.info("-------------------otgDeviceSnDownloaded sn ", e.sn);
      console.info("-------------------otgDeviceSnDownloaded val ", e.glucoseData);
    }

    if (GLOBAL.curDevice.type === 0) return;

    if (!this._isGetLatestValue && (!this._isInSaveProc || this.state.pulsePause)) return;
    this._isGetLatestValue = false;
    if (e.sn) {
      GLOBAL.curDevice.otg_sn = e.sn;
      if (e.glucoseData) {
        if (GLOBAL.curDevice.type === 1) {
          GLOBAL.isChineseDevice = true;
        } else {
          GLOBAL.isChineseDevice = false;
        }
        this._curGlucoseVal = UTILS.getGlucoseByMMol(e.glucoseData);
      }
      this.procRecieveData();
    }
  }

  // 최신기록얻기
  latestDataOtgDownloaded(e) {
    if (__DEV__) console.info("-------------------get latest data from otg ");
    if (GLOBAL.curDevice.type === 0) {
      this.setState({ buttonDisabled: false });
      return;
    }

    if (this._isInSaveProc || this.state.pulsePause) {
      this.setState({ buttonDisabled: false });
      return;
    }
    this._isInSaveProc = true;

    if (e.glucoseData) {
      if (GLOBAL.curDevice.type === 1) {
        GLOBAL.isChineseDevice = true;
      } else {
        GLOBAL.isChineseDevice = false;
      }
      this._curGlucoseVal = UTILS.getGlucoseByMMol(e.glucoseData);
      // FIXME:
      e.sn = "test otg device";
      // sn을 꼭 알고싶어?
      if (!e.sn) {
        careSensHelper.getOtgDeviceInfo();
      } else {
        this.procRecieveData();
      }
    }
  }

  // 불루트수설비 자료내리적재
  dataDownloaded(e) {
    if (GLOBAL.curDevice.type > 0) return;

    // if (this._measureSid > -1 && GLOBAL.curDevice.last_seqnum === e.sequenceNumber) return;
    // this._measureSid = e.sequenceNumber;
    // if (GLOBAL.curMonitorAutoSaveDelayIdx < 3) this.dataDownloadedListener.remove();
    // if (GLOBAL.curDevice.type == 0 && e.serialNumber && (e.serialNumber.startsWith("F040") || e.serialNumber.startsWith("F042") || e.serialNumber.startsWith("F038"))) {
    if (GLOBAL.curDevice.type == 0 && GLOBAL.isChineseDeviceCheck(e.serialNumber)) {
      GLOBAL.isChineseDevice = true;
    } else {
      GLOBAL.isChineseDevice = false;
    }
    if (__DEV__) console.info("-------------------------downloaded", e.sequenceNumber);
    this._curGlucoseVal = UTILS.getGlucoseByMMol(e.glucoseData);
    e.time = UTILS.getFormattedDate(null, 1);
    if (this._isInSaveProc) return;
    this._isInSaveProc = true;
    UTILS.showToast("测定时间：" + e.measureTime + "秒");

    this.verifySeqNum(e.sequenceNumber)
      .then(() => {
        GLOBAL.curDevice.last_seqnum = e.sequenceNumber;
        asyncStorageHelper.setDeviceInfos();
        this.procRecieveData();
      })
      .catch(() => {
        if (this._canShowAlert) {
          this._canShowAlert = false;
          this._alertPro.open();
        }
      });
  }
  _renderAlert = () => {
    return (
      <AlertPro
        ref={(ref) => {
          this._alertPro = ref;
        }}
        onConfirm={() => this.procRecieveData()}
        onCancel={() => this.procUnrecieveData()}
        message={Strings.message.confirm_reuseMonitorValue}
      />
    );
  };
  data(e) {
    if (e.result) {
      const { id, data } = e.result;
      if (__DEV__) console.info(`Data from device ${id} : ${data}`);
    }
  }
  // 측정결과의 sequenceNumber 장치아이디 검증
  private verifySeqNum = (seq: number): Promise<void> => {
    return new Promise(function (resolve, reject) {
      if (GLOBAL.curDevice.last_seqnum != seq) {
        GLOBAL.curDevice.last_seqnum = seq;
        if (__DEV__) console.info("verify seq OK!!! ", seq);
        resolve();
      } else {
        if (__DEV__) console.error("verify seq Failed!!! ", seq);
        reject();
      }
    });
  };
  private verifyDevId = (id: string): Promise<void> => {
    return new Promise(function (resolve, reject) {
      if (this._prevDevId != id) {
        this._prevDevId = id;
        if (__DEV__) console.info("verify dev id OK!!!");
        resolve();
      } else {
        if (__DEV__) console.error("verify dev id Failed!!!");
        reject();
      }
    });
  };
  // 측량동작중지계속
  private onPausePulse = async (pulsePause: boolean, showToast: boolean, isFirst = false) => {
    if (!pulsePause) this._isInSaveProc = false;

    if (this.state.pulsePause === pulsePause && !isFirst) return;
    // if (this._isConnecting) return;
    // console.log("call onPausePulse");
    this.setState({ pulsePause });

    if (GLOBAL.curDevice.type > 0) {
      this._isConnecting = false;
    } else {
      // bluetooth
      if (pulsePause) {
        // careSensHelper.disconnect();
        this._isConnecting = false;
      } else {
        if (__DEV__) console.info("call list");
        CareSens.list();
      }
    }

    const msg = pulsePause
      ? Strings.message.alert_monitorPause
      : Strings.message.alert_monitorStart;

    if (showToast) UTILS.showToast(msg);
  };

  private cancelSaveProc = () => {
    if (this._intervalSaveProc) {
      clearInterval(this._intervalSaveProc);
      this._intervalSaveProc = undefined;

      this.setState({ saveBtnCaption: Strings.common.str_uploadRecord });
    }

    this._isInSaveProc = false;
  };
  private beginSaveProc = () => {
    this._isInSaveProc = false;
    // if (GLOBAL.curMonitorAutoSaveDelayIdx > 2) return;
    if (GLOBAL.curMonitorAutoSaveDelayIdx === 2) {
      this.onSavePress();
      return;
    }

    let count = GLOBAL.curMonitorAutoSaveDelayIdx === 0 ? 6 : 4;
    count--;
    this.setState({ saveBtnCaption: `${count}秒后自动上传` });
    this._intervalSaveProc = setInterval(() => {
      count--;
      if (count > 0) {
        this.setState({ saveBtnCaption: `${count}秒后自动上传` });
      } else {
        this.setState({ saveBtnCaption: Strings.common.str_uploadRecord });
        if (this._intervalSaveProc != undefined) this.onSavePress();

        clearInterval(this._intervalSaveProc);
        this._intervalSaveProc = undefined;
      }
    }, 1000);
  };
  private onMemoChange = (memo: string) => {
    this.setState({ memo });
    this._taskPatient.record.memo = memo;
  };

  private onMealTimeSelect = () => {
    this.props.onPostTimeSelect(0, this.state.measurePoint);
  }
  private onRetryTimeSelect = () => {
    this.props.onPostTimeSelect(1, this.state.measurePoint);
  }
  private onPressProc = (kind: string, param: number = 0) => {
    this.cancelSaveProc();
    switch (kind) {
      case "manual input":
        this.props.onManualInput();
        break;
      case "point input":
        break;
      case "pause monitor":
        this.foundedDeviceListener = DeviceEventEmitter.addListener("foundedDevice", (e) =>
          this.foundedDevice(e)
        );
        this.onPausePulse(!this.state.pulsePause, true, false);
        break;
      // case "time input":
      //   param === 0 ? this.showDateTimePicker(param, true) : this.procNotice(param);
      //   break;

    }
  };
  private onGetLastRecordFromOTG = () => {
    this._isGetLatestValue = true;
    this.setState({ buttonDisabled: true });
    careSensHelper.getOtgDeviceInfo();

  };
  private onSavePress = () => {
    if (__DEV__) console.info("----onSavePress------");

    this.cancelSaveProc();

    this._taskPatient.record.point = this.state.measurePoint;
    this._taskPatient.record.time = UTILS.getFormattedDate(this.state.measureTime, 1);
    const moniter = this.state.tempMonitor;
    const record = this._taskPatient.record;
    if (moniter) {
      record.value = moniter.value;
      record.state = moniter.state;
      if (this.state.isRetry) {
        record.state = GLOBAL.retryState;
        record.eat_time = UTILS.getFormattedDate(this.state.noticeMealTime, 1);
      }
      // record.eat_time = moniter.eat_time;

      if (!this._isInSaving) {
        this._isInSaving = true;
        this.props.onSavePress(record, false);
      }

    }
  };

  private renderAlertbar = () => {
    const { themedStyle, ...restProps } = this.props;
    return (
      <View style={themedStyle.alertbarContainer}>
        <Text>{Strings.message.warning_errorDevice}</Text>
      </View>
    );
  };
  private procNotice = (kind: number) => {
    const type = kind - 1;
    let notice: NoticeModel;
    if (this.props._notice) {
      notice = this.props._notice;
    }

    if (notice) {
      const msg = `${Strings.common.str_noticeEat} ${UTILS.getMinuteString(notice.notice)}`;
      this.setState({ noticeDelMsg: msg }, () => this._alertPro2.open());
    } else {
      // this.showDateTimePicker(kind, true);
    }
  };
  _renderAlertNotice = () => {
    return (
      <AlertPro
        ref={(ref) => {
          this._alertPro2 = ref;
        }}
        title={this.state.noticeDelMsg}
        onConfirm={() => this.procNoticeDelete()}
        onCancel={() => this._alertPro2.close()}
        message={Strings.message.confirm_delete}
        textConfirm={Strings.common.str_delete}
      />
    );
  };

  private procNoticeDelete = () => {
    const notice: NoticeModel = this.props._notice;
    if (notice) {
      this.props.onSaveNotice(notice, MANAGE_KIND.DEL);
    }
  };
  private showDateTimePicker = (kind: number) => {
    this._timeKind = kind;
    this.setState({ isMonitorTimeVisible: true });

  };
  private hideDateTimePicker = () => {
    this.setState({ isMonitorTimeVisible: false });
  }
  private onChangePoint = (point: number) => {
    this.postPointCheck(point);
  }
  handleDatePicked = (date) => {
    if (this._timeKind === 1) {
      this.setState({ measureTime: date, isMonitorTimeVisible: false });
    } else {
      this.setState({ noticeMealTime: date, isRetry: true, isMonitorTimeVisible: false });
      this.onSavePress();
    }
    /// console.log("A date has been picked: ", date);
    // switch (kind) {
    //   case 0:
    //     this.setState({ measureTime: date });
    //     break;
    //   case 1:
    //     // this.setState({ noticeMealTime: date, isEating: true });
    //     this.onSetEating(date);
    //     break;
    // }

    //// this.showDateTimePicker(kind, false);
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const { tempMonitor } = this.state;
    let glucoseValue: string;
    if (tempMonitor) {
      glucoseValue = tempMonitor.state > 0
        ? GLOBAL.MONITOR_STATES[tempMonitor.state]
        : tempMonitor.value && UTILS.glucoseConvMMol(tempMonitor.value);
    }
    const btnColor = this.state.isEnableTime ? 'gray' : 'seagreen';
    const btn1Color = this.state.isEnableTime ? 'gray' : 'slateblue';
    let showNoticeButton = this.state.hasTask && this._taskPatient.task_type !== 3 && !GLOBAL.isOffline;
    // retest인 경우는 하이드
    if (this._taskPatient.notice && this._taskPatient.notice.type === 1) showNoticeButton = false;

    if (this.state.isLoading && GLOBAL.SHOW_LOADING) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1CAFF6" />
        </View>
      );
    }
    const state = 0;
    return (
      <View style={{ flex: 1 }}
        onResponderGrant={() => {
          if (__DEV__) console.info("grant---");
        }}
        onResponderRelease={() => {
          if (__DEV__) console.info("release---");
          this.cancelSaveProc();
        }}
        onStartShouldSetResponder={(e) => {
          if (__DEV__) console.info("responder---");
          return true;
        }}
      >
        {GLOBAL.curDevice.type === 0 && this.state.errorDevice && this.renderAlertbar()}
        {this._renderAlert()}
        {this._renderAlertNotice()}
        {this._renderAlertBack()}
        <ContainerView style={themedStyle.container}>
          {GLOBAL.curDevice.type > 0 && (
            <Button style={[themedStyle.buttonWrapper, { marginBottom: 10 }]}
              onPress={() => this.onGetLastRecordFromOTG()}
              disabled={this.state.buttonDisabled}
            >
              获取最后一条数据
            </Button>
          )}
          <View>
            <View style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
            >
              <View style={{ flex: 0, width: 0 }} />
              <Section style={{ width: "100%" }} onPress={() => this.onPressProc("manual input")}>
                <Input disabled={true} textStyle={themedStyle.glucoseInputText}
                  label={Strings.message.input_measureValue}
                  labelStyle={themedStyle.glucoseInputLabel}
                  icon={BloodDropIconFill}
                  value={glucoseValue}
                />
              </Section>
            </View>
            <View style={{ width: 150, padding: 10, alignSelf: "center" }}>
              <SlideMenu name={"POINT_LABELS"} cols={2} data={this._points}
                curItemIndex={this.state.measurePoint}
                onMenuItemSelect={(val) => this.onChangePoint(val)}
                textStyle={commonStyles.slideMenuText}
                triggerStyle={commonStyles.slideMenuTrigger}
              />
            </View>
            <View style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 10,
              marginTop: 10,
            }}
            >
              {this.state.isEnableTime ?
                (
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity style={[themedStyle.buttonCls, { backgroundColor: 'gray', borderColor: 'gray' }]} onPress={() => this.removeTicket()}>
                      <FontAwesomeIcon icon={faTrash} style={{
                        color: '#fff'
                      }} />
                      <Text style={{ marginLeft: 3, color: '#fff' }}>
                        {`删除标记`}</Text>
                    </TouchableOpacity>
                  </View>
                ) :
                (
                  <>
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity disabled={this.state.isEnableTime} style={[themedStyle.buttonCls, { backgroundColor: btnColor, borderColor: btnColor }]} onPress={() => this.onMealTimeSelect()}>
                        <FontAwesomeIcon icon={faUtensils} style={{
                          color: '#fff'
                        }} />
                        <Text style={{ marginLeft: 3, color: '#fff' }}>
                          {Strings.common.str_noticeEat}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity disabled={this.state.isEnableTime}
                        style={[themedStyle.buttonCls, { backgroundColor: btn1Color, borderColor: btn1Color }]}
                        onPress={() => this.showDateTimePicker(2)}>
                        <FontAwesomeIcon icon={faClock} style={{
                          color: '#fff'
                        }} />
                        <Text style={{ marginLeft: 3, color: '#fff' }}>
                          {Strings.common.str_noticeReserve}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}


              <View style={{ flex: 1 }}>
                <Button style={themedStyle.buttonWrapper}
                  onPress={() => { this.onSavePress() }}
                  disabled={this.state.tempMonitor === undefined ||
                    GLOBAL.curMonitorAutoSaveDelayIdx === 2 || this.state.isLoading}
                >
                  {this.state.saveBtnCaption}
                </Button>
              </View>
            </View>
            <View style={{ flex: 1 }}>
            </View>

            {this.state.errorDevice ? (
              <View />
            ) : (
              <View style={{ flex: 1, alignItems: "center" }}>
                <TouchableOpacity style={{
                  backgroundColor: "white",
                  minHeight: 100,
                  justifyContent: "center",
                }}
                  onPress={() => this.onPressProc("pause monitor")}
                >
                  <View style={{ alignItems: "center" }}>
                    <Spinner isVisible={!this.state.pulsePause}
                      style={{ marginTop: 0 }}
                      size={50}
                      type="ThreeBounce"
                      color="#FF5544"
                    />
                  </View>
                  <View style={{
                    marginBottom: 10,
                    alignItems: "center",
                    borderColor: "red",
                    borderRadius: 3,
                    borderWidth: this.state.pulsePause ? 1 : 0,
                    padding: this.state.pulsePause ? 10 : 0,
                  }}
                  >
                    <Text status="danger" category="h6">
                      {this.state.pulsePause ? "测量开始" : "血糖测量中"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View>
            <View style={themedStyle.section}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {UTILS.renderIconElement(DefAvataIconFill, commonStyles.iconAvata)}
                <Text style={themedStyle.sectionTextMain}>{this._taskPatient.name}</Text>
                {UTILS.isMyPatient(this._taskPatient) &&
                  UTILS.renderIconElement(MyPatientIcon, commonStyles.iconMark)}
              </View>
              <View>
                <Text style={themedStyle.sectionTextSub}>
                  {this._taskPatient.age
                    ? `${GLOBAL.SEXS[this._taskPatient.gender]} ${this._taskPatient.age}岁`
                    : GLOBAL.SEXS[this._taskPatient.gender]}
                </Text>
              </View>
            </View>
            <View style={themedStyle.sectionA}>
              <ProfileSetting hideRightIcon={true}
                hint={Strings.patient.list_zhuyuanhao}
                value={
                  this._taskPatient.patient_number && this._taskPatient.patient_number.toString()
                }
              />
            </View>
            <Section style={themedStyle.sectionA} onPress={() => this.showDateTimePicker(1)}>
              <ProfileSetting hint={Strings.menu.task_measureTime}
                value={UTILS.getFormattedDate(this.state.measureTime, 3)}
              />
              <DateTimePicker
                isVisible={this.state.isMonitorTimeVisible}
                is24Hour={true}
                mode={this._timeKind === 1 ? "datetime" : 'time'}
                date={this._curTime}
                minimumDate={this.state.measureTime}
                maximumDate={this.state.measureTime}
                timePickerModeAndroid={"spinner"}
                onConfirm={(date) => this.handleDatePicked(date)}
                onCancel={() => this.hideDateTimePicker()}
              />
            </Section>
            <View style={themedStyle.section}>
              <EditInput style={{ marginLeft: 6 }}
                hint={Strings.common.str_memo}
                onChangeText={this.onMemoChange}
                value={this.state.memo}
                placeholder={Strings.message.input_memo}
              />
            </View>
          </View>
        </ContainerView>
      </View>
    );
  }
}
interface SectionProps extends TouchableOpacityProps {
  children?: React.ReactNode;
}

const Section = (props?: SectionProps): React.ReactElement<TouchableOpacityProps> => {
  return <TouchableOpacity activeOpacity={0.65} {...props} />;
};

export const MonitorGlucose = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"],
    padding: 10,
  },
  alertbarContainer: {
    flexDirection: "row",
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 3,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme["color-warning-500"],
    height: 46,
  },

  sectionTextMain: {
    ...textStyle.subtitle,
    color: theme["text-basic-color"],
    fontSize: 18,
    marginHorizontal: 10,
  },
  sectionTextSub: {
    ...textStyle.subtitle,
    color: theme["#ccc"],
    fontSize: 18,
    marginRight: 10,
  },
  headerText: {
    padding: 8,
    fontSize: 14,
    color: theme["color-primary-default"],
    textAlign: "center",
  },
  saveBtn: {
    marginTop: 20,
  },
  slideInOption: {
    padding: 5,
  },
  menuText: {
    fontSize: 20,
  },
  buttonCls: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row"
  },
  glucoseInputText: { fontSize: 52, fontWeight: 'bold', color: "red", textAlign: "center", paddingVertical: 1 },
  glucoseInputLabel: { fontSize: 16 },
  buttonWrapper: { marginVertical: 3, marginHorizontal: 6 },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 0,
    borderTopWidth: 1,
    borderColor: theme["border-basic-color-2"],
  },
  sectionA: {
    borderTopWidth: 1,
    borderColor: theme["border-basic-color-2"],
  },
  pointMenuText: { fontSize: 18, color: theme["#ccc"], fontWeight: "normal" },
}));
