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
  BackHandler
} from "react-native";
import {
  ThemeType,
  withStyles,
  ThemedComponentProps,
  ModalService
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Radio, RadioGroup, Input, Text } from "@src/core/react-native-ui-kitten/ui";
import { ContainerView, textStyle, MyDatePicker, TimePointMenu } from "@src/components/common";
import {
  CreditCardIconFill,
  PersonIconFill,
  PinIconFill,
  StarIconOutline,
  CameraIconOutline,
  PhoneIconFill,
  BloodDropIconFill,
  UploadIconFill,
  TemperatureIcon,
  PressureIcon
} from "@src/assets/icons";
import { imageCamera } from "@src/assets/images";

import SegmentedControlTab from "react-native-segmented-control-tab";
import { ValidationInput } from "@src/components/common";
import { StringValidator } from "@src/core/validators";
import { GlucoseDeviceIconFill, SearchIconFill } from "@src/assets/icons";
import { FreePatientModel, MonitorModel } from "@src/core/model";
import ImageButton from "@src/components/common/imageButton";
import { Pulse } from "@src/components/common";
const unique = 0;
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import Draggable from "@src/components/common/Draggable";
import commonStyles from "../../styles/common";
import { GlucoseManualInputModal } from "./glucoseManualInput.modal";
import { careSensHelper } from "@src/core/utils/caresensHelper";
import wifi from "react-native-android-wifi";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import Spinner from "react-native-spinkit";
import AlertPro from "@src/components/common/alertPro";
const CareSens = NativeModules.CareSens;

interface ComponentProps {
  onCameraPress: () => void;
  dataReady: boolean;
  onSavePress: (monitor: MonitorModel, wifiOK: boolean) => void;
  onFreePatientLog: (fpInfo: FreePatientModel) => void;
  pauseMeasure: boolean;
  needInit: boolean;
  isLoading: boolean;
  errorDevice: boolean;
  onNeedInit: (needInit: boolean) => void;
  onManualInput: () => void;
  tempMonitor?: MonitorModel;
  goBack?: () => void;
}
interface State {
  curCertKind: number | undefined;
  cardNumber: string | undefined;
  patientName: string | undefined;
  address: string | undefined;

  temperature: string | undefined;
  pressure_low: string | undefined;
  pressure_high: string | undefined;

  dataReady: boolean | undefined;
  measureTotalCount: number | undefined;
  measureBtnCaption: string;
  saveBtnEnabled: boolean;
  curTimeMark: number;

  maxGlucose: number;
  timer: any;
  bluetoothEnabled: boolean;
  measureTime: any;
  pulsePause: boolean;
  remainUploadTime: number;

  enableCameraIcon: boolean;
  saveBtnCaption: string;
  errorDevice: boolean;
  isLoading: boolean;
  tempMonitor: MonitorModel;
}

export type TaskResultProps = ThemedComponentProps & ComponentProps;

class TaskFreeMeasureComponent extends React.Component<TaskResultProps> {
  private _isOTGDevice: boolean;

  private _alertPro: any;
  private _alertPro2: any;
  private _curGlucoseVal: number;

  private _measureSeqNum: number = 0;

  private _manualInputModalId: string;
  private _secondTextInput: any;
  private _measureTotalCount: number;
  readonly _delayCount = GLOBAL.curMonitorAutoSaveDelayIdx === 0 ? 6 : 4;
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

  private _dragRef;
  private _canClick;
  private _beginPos = undefined;
  private _endPos = undefined;
  private _intervalSaveProc = undefined;

  private _isConnecting = false;

  constructor(props: TaskResultProps) {
    super(props);
    GLOBAL.isChineseDevice = false;
    this._isOTGDevice = GLOBAL.curDevice.type === 0 ? false : true;
  }

  public state: State = {
    tempMonitor: this.props.tempMonitor,
    curCertKind: 0, // indentity
    cardNumber: undefined, // GLOBAL.p_certNum,
    patientName: undefined, // GLOBAL.p_name,
    address: undefined,
    dataReady: this.props.dataReady,
    measureTotalCount: 0,
    measureBtnCaption: Strings.menu.task_measureData,
    saveBtnEnabled: false,
    curTimeMark: GLOBAL.p_timeMark, // free time
    maxGlucose: 0,
    timer: undefined,
    bluetoothEnabled: undefined,
    measureTime: undefined,
    pulsePause: undefined,
    remainUploadTime: this._delayCount, // second

    enableCameraIcon: true,
    saveBtnCaption: Strings.common.str_uploadRecord,
    errorDevice: this.props.errorDevice,
    isLoading: this.props.isLoading,
    pressure_low: undefined,
    pressure_high: undefined,
    temperature: undefined
  };
  componentDidMount() {
    // if (this.state.curCertKind == 0) this._secondTextInput.focus();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);

    this.bluetoothEnabledListener = DeviceEventEmitter.addListener("bluetoothEnabled", e =>
      this.bluetoothEnabled(e)
    );
    this.bluetoothDisabledListener = DeviceEventEmitter.addListener("bluetoothDisabled", e =>
      this.bluetoothDisabled(e)
    );
    this.errorListener = DeviceEventEmitter.addListener("error", e => this.error(e));
    this.deviceConnectedListener = DeviceEventEmitter.addListener("foundedDevice", (e) =>
      this._isConnecting = true
    );
    this.foundedDeviceListener = DeviceEventEmitter.addListener("foundedDevice", e =>
      this.foundedDevice(e)
    );
    this.totalCountListener = DeviceEventEmitter.addListener("totalCount", e => this.totalCount(e));
    this.dataDownloadedListener = DeviceEventEmitter.addListener("lastDataDownloaded", e =>
      this.dataDownloaded(e)
    );
    this.dataListener = DeviceEventEmitter.addListener("data", e => this.data(e));
    this.failedConnectDeviceListener = DeviceEventEmitter.addListener(
      "connectionToDeviceFailed",
      e => this.errorConnectDevice(e)
    );
    this.connectionFailedListener = DeviceEventEmitter.addListener("connectionFailed", e =>
      this.connectionFailed(e)
    );
    this.deviceDisconnectedListener = DeviceEventEmitter.addListener("deviceDisconnected", e =>
      this.deviceDisconnected(e)
    );

    this.getLatestDataOtgListener = DeviceEventEmitter.addListener("getLatestDataOTG", e =>
      this.latestDataOtgDownloaded(e)
    );
    this.getOtgDeviceSNListener = DeviceEventEmitter.addListener("getSnOTG", e =>
      this.otgDeviceSnDownloaded(e)
    );

    // this.requestBluetoothPermissions();

    if (GLOBAL.curDevice.type === 0) {
      /*
      careSensHelper
        .connnectToDevice(true, GLOBAL.curDevice.useLast)
        .then((result) => {
          this._isConnecting = false;

        })
        .catch((error) => {
          this.setState({ pulsePause: true });
          UTILS.showToast("失败（connnectToDevice）", ToastAndroid.LONG);
          this._isConnecting = false;
        });
      */
      careSensHelper
        .initialize()
        .then(() => {
          // const bPause = this.isValidPInfo() ? false : true;
          const isPause = this.state.errorDevice ? true : this.props.pauseMeasure;
          if (__DEV__) console.info("call onPausePulse in initialize");
          this.onPausePulse(isPause, false, true);
        })
        .catch(reason => {
          this.setState({ errorDevice: true });
          UTILS.showToast("初始化失败" + reason);
        });
    } else {
      const isPause = this.state.errorDevice ? true : this.props.pauseMeasure;
      this.onPausePulse(isPause, false, true);
    }
  }
  componentWillUnmount() {
    // clearInterval(this.state.timer)
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
    this.bluetoothEnabledListener.remove();
    this.bluetoothDisabledListener.remove();
    this.errorListener.remove();
    this.deviceConnectedListener.remove();
    this.foundedDeviceListener.remove();
    this.totalCountListener.remove();
    this.dataDownloadedListener.remove();
    this.dataListener.remove();
    this.failedConnectDeviceListener.remove();
    this.connectionFailedListener.remove();
    this.deviceDisconnectedListener.remove();
    this.getLatestDataOtgListener.remove();
    this.getOtgDeviceSNListener.remove();

    if (GLOBAL.curDevice.type === 0) careSensHelper.disconnect();
    CareSens.stopScan();
  }
  componentWillReceiveProps(nextProps: TaskResultProps) {
    const monitor = nextProps.tempMonitor && nextProps.tempMonitor;

    this.setState({
      errorDevice: nextProps.errorDevice,
      isLoading: nextProps.isLoading
    });
    if (nextProps.dataReady) {
      // for camera indentiyCard
      this.setState(
        {
          curCertKind: 0,
          dataReady: true,
          patientName: GLOBAL.curFreePatient.name,
          cardNumber: GLOBAL.curFreePatient.cert_num,
          address: GLOBAL.curFreePatient.address
        },
        () => this.isValidPInfo()
      );
    }
    if (monitor) {
      if (this.state.tempMonitor != monitor && monitor) {
        this.setState({ tempMonitor: monitor }, () => {
          this.onPausePulse(true, false);

          if (this.isValidPInfo()) {
            this.beginSaveProc();
          } else UTILS.showToast(Strings.message.input_patientInfoUpload);
          this._canShowAlert = true;
        });
      }
    } else {
      if (nextProps.pauseMeasure === false) {
        if (__DEV__) console.info("call onPausePulse in componentWillReceiveProps");
        this.onPausePulse(false, false);
      }
    }
    if (nextProps.needInit) {
      this.initInputsState();
    }
  }
  handleBackButton = () => {
    if (this._intervalSaveProc) {
      this.cancelSaveProc();
      this._alertPro2.open();
      return true;
    } else return false;
  };
  _renderAlertBack = () => {
    return (
      <AlertPro
        ref={ref => {
          this._alertPro2 = ref;
        }}
        onConfirm={() => this.props.goBack()}
        onCancel={() => this._alertPro2.close()}
        message={Strings.message.confirm_back}
      />
    );
  };
  private initInputsState = (initGlucose = true) => {
    GLOBAL.curFreePatient.name = undefined;
    GLOBAL.curFreePatient.cert_num = undefined;
    GLOBAL.curFreePatient.address = undefined;

    if (initGlucose) {
      this.setState(
        {
          tempMonitor: undefined,
          dataReady: false,
          patientName: undefined,
          cardNumber: undefined,
          address: undefined,
          measureVal: undefined,
          measureValString: undefined
        },
        () => this.props.onNeedInit(false)
      );
    } else {
      this.setState(
        {
          //          curCertKind: 0,
          dataReady: false,
          patientName: undefined,
          cardNumber: undefined,
          address: undefined
        },
        () => this.props.onNeedInit(false)
      );
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
      UTILS.showToast(e.e.message);
    }
  }

  errorConnectDevice(e) {
    if (__DEV__) console.error(`Error Connect to Device`);
    // UTILS.showToast("Error Connect to Device");
  }
  connectionFailed(e) {
    if (__DEV__) console.info('connectionFailed' + e.message + e.device.id);
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
      if (__DEV__) console.info("-------------------------name:", e.device.name);
      // console.log("founded device:" + e.device.id);
      UTILS.showToast("" + e.timeFound);
      if (e.device.name === GLOBAL.curDevice.name) {
        if (this.foundedDeviceListener) this.foundedDeviceListener.remove();
        await CareSens.stopScan();

        careSensHelper
          .connnectToDevice(true, GLOBAL.curDevice.useLast)
          .then((result) => {
            // this._isConnecting = false;
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
    this.setState({ tempMonitor: { value: this._curGlucoseVal, state: undefined } });
    this.onPausePulse(true, false);

    if (this.isValidPInfo()) {
      this.beginSaveProc();
      if (__DEV__) console.info("dataDownloaded 测量值即将自动上传到服务器");
    } else {
      UTILS.showToast(Strings.message.input_patientInfoUpload);
    }
    this._canShowAlert = true;
  };
  procUnrecieveData = () => {
    this.onPausePulse(true, false);
    this.onPausePulse(false, false);

    this._canShowAlert = true;
  };
  // 유선설비에서 SN과 최신기록얻기
  otgDeviceSnDownloaded(e) {
    // FIXME:
    if (__DEV__) {
      console.info("-------------------otgDeviceSnDownloaded sn ", e.sn);
      console.info("-------------------otgDeviceSnDownloaded val ", e.glucoseData);
    }

    if (GLOBAL.curDevice.type === 0) return;

    if (this.state.pulsePause) return;
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
    if (GLOBAL.curDevice.type === 0) return;

    if (this.state.pulsePause) return;


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
    UTILS.showToast("测定时间：" + e.measureTime + "秒");
    this.verifySeqNum(e.sequenceNumber)
      .then(() => {
        // if (GLOBAL.curMonitorAutoSaveDelayIdx < 3) this.dataDownloadedListener.remove();
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
        ref={ref => {
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

  private verifySeqNum = (seq: number): Promise<void> => {
    return new Promise(function (resolve, reject) {
      if (GLOBAL.curDevice.last_seqnum != seq) {
        GLOBAL.curDevice.last_seqnum = seq;
        if (__DEV__) console.info("verify seq OK!!! ", seq);
        resolve();
      } else {
        if (__DEV__) console.info("verify seq Failed!!! ", seq);
        reject();
      }
    });
  };

  private onPausePulse = async (pulsePause: boolean, showToast: boolean, isFirst = false) => {
    if (this.state.pulsePause === pulsePause && !isFirst) return;
    this._isConnecting = false;
    this.setState({ pulsePause, measureVal: undefined });

    if (GLOBAL.curDevice.type === 0) {
      if (pulsePause) {
        careSensHelper.disconnect();
        // this._isConnecting = false;
      } else {
        if (__DEV__) console.info("call list");
        CareSens.list();

      }
    } else {
      this._isConnecting = false;
    }

    const msg = pulsePause
      ? Strings.message.alert_monitorPause
      : Strings.message.alert_monitorStart;

    if (showToast) UTILS.showToast(msg);
  };

  private onCardNumInputTextChange = (cardNumber: string) => {
    this.setState({ cardNumber });
    GLOBAL.curFreePatient.cert_num = cardNumber;
  };

  private onNameInputTextChange = (patientName: string) => {
    this.setState({ patientName });
    GLOBAL.curFreePatient.name = patientName;
  };
  private onAddressInputTextChange = (address: string) => {
    this.setState({ address });
    GLOBAL.curFreePatient.address = address;
  };
  private onGlucoseTextChange = (measureValString: string) => {
    this.setState({ measureValString });
  };

  onRadioChange = (curCertKind: number) => {
    const enableCameraIcon = curCertKind === 0 ? true : false;
    const cardNumber = undefined;
    const patientName = undefined;
    const address = undefined;
    this.setState({
      curCertKind,
      enableCameraIcon,
      cardNumber,
      patientName,
      address
    });

    GLOBAL.curFreePatient.cert_kind = curCertKind;
    GLOBAL.curFreePatient.name = undefined;
    GLOBAL.curFreePatient.cert_num = undefined;
    GLOBAL.curFreePatient.address = undefined;
    GLOBAL.curFreePatient.birthday = undefined;
    // GLOBAL.p_timeMark = 0;
  };
  private onPressureLowInputTextChange = (pressure_low: string) => {
    this.setState({ pressure_low });
    GLOBAL.p_pressure_low = Number(pressure_low);
  };
  private onPressureHighInputTextChange = (pressure_high: string) => {
    this.setState({ pressure_high });
    GLOBAL.p_pressure_high = Number(pressure_high);
  };
  private onTemperatureInputTextChange = (temperature: string) => {
    this.setState({ temperature });
    GLOBAL.p_temperatrue = Number(temperature);
  };
  private isValidPInfo = (checkCertNum = true): boolean => {
    let result = this.state.patientName !== undefined;
    if (checkCertNum) result = result && this.state.cardNumber !== undefined;
    return result;
  };
  private onCameraPress = () => {
    this.initInputsState(false);
    this.props.onCameraPress();
  };
  private onPressProc = (kind: string, param: number = 0) => {
    this.cancelSaveProc();
    switch (kind) {
      case "manual input":
        this.props.onManualInput();
        break;
      case "radio change":
        this.onRadioChange(param);
        break;
      case "pause monitor":
        this.foundedDeviceListener = DeviceEventEmitter.addListener("foundedDevice", (e) =>
          this.foundedDevice(e)
        );
        this.onPausePulse(!this.state.pulsePause, true, false);
        break;
      case "monitor log":
        this.onFreePatientLog();
        break;
      case "camera proc":
        this.state.curCertKind == 0 && this.onCameraPress();
        break;
    }
  };
  private cancelSaveProc = () => {
    if (this._intervalSaveProc) {
      clearInterval(this._intervalSaveProc);
      this._intervalSaveProc = undefined;

      this.setState({ saveBtnCaption: Strings.common.str_uploadRecord });
    }
  };
  private beginSaveProc = () => {
    if (GLOBAL.curMonitorAutoSaveDelayIdx === 3) {
      // this.onSavePress();
      return;
    } else if (GLOBAL.curMonitorAutoSaveDelayIdx == 2) {
      this.onSavePress();
      return;
    }
    let count =
      GLOBAL.curMonitorAutoSaveDelayIdx === 0 ? 6 : GLOBAL.curMonitorAutoSaveDelayIdx === 1 ? 4 : 1;
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
  private onSavePress = () => {
    this.cancelSaveProc();
    this.setState({
      isLoading: true
    });

    if (!this.isValidPInfo()) {
      UTILS.showToast(Strings.message.input_patientInfo);
      return;
    }
    GLOBAL.p_measureTime = UTILS.getFormattedDate(undefined, 1); // UTILS.getFormattedDate(this.state.measureTime, 1);
    wifi.getCurrentSignalStrength(level => {
      if (__DEV__) console.info("------- wifi strength ", level);
      const isOK = level > GLOBAL.wifiStopDbm ? true : false;
      this.props.onSavePress(this.state.tempMonitor, isOK);
    });
  };

  private onFreePatientLog = () => {
    const fpInfo: FreePatientModel = {
      name: this.state.patientName,
      cert_num: this.state.cardNumber,
      address: this.state.address
    };
    this.props.onFreePatientLog(fpInfo);
  };
  private onInDrag = () => {
    if (__DEV__) console.info("in drag");
    this._beginPos = this._dragRef.getPosition();
  };
  private onReleaseDrag = () => {
    this._endPos = this._dragRef.getPosition();
    const dist = Math.sqrt(
      Math.pow(this._endPos.offsetX - this._beginPos.offsetX, 2) +
      Math.pow(this._endPos.offsetY - this._beginPos.offsetY, 2)
    );
    if (dist > 6) {
      if (__DEV__) console.info("is drag");
    } else {
      if (__DEV__) console.info("call camera");
      this.onCameraPress();
    }
  };

  private renderToolbar = () => {
    const { themedStyle, ...restProps } = this.props;
    return (
      <View style={[commonStyles.toolbarContainer, { backgroundColor: "white" }]}>
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}>
          <RadioGroup
            onChange={index => this.onPressProc("radio change", index)}
            selectedIndex={this.state.curCertKind}
            style={{ flexDirection: "row", paddingVertical: 6 }}
          >
            <Radio
              text={Strings.common.str_identity}
              style={themedStyle.radioItem}
              textStyle={themedStyle.radioText}
            />
            <Radio
              text={Strings.common.str_hospitalCard}
              style={themedStyle.radioItem}
              textStyle={themedStyle.radioText}
            />
            <Radio
              text={Strings.common.str_handphone}
              style={themedStyle.radioItem}
              textStyle={themedStyle.radioText}
            />
          </RadioGroup>
        </View>
      </View>
    );
  };

  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const {
      cardNumber,
      patientName,
      address,
      tempMonitor,
      pressure_low,
      pressure_high,
      temperature
    } = this.state;
    let cardPreface = Strings.message.input_IdcardNumber;
    let cardNumberIcon = CreditCardIconFill;
    if (this.state.curCertKind == 1) {
      cardPreface = Strings.message.input_HospitalcardNumber;
      cardNumberIcon = CreditCardIconFill;
    }
    if (this.state.curCertKind == 2) {
      cardPreface = Strings.message.input_MobileNumber;
      cardNumberIcon = PhoneIconFill;
    }
    if (this.state.isLoading && GLOBAL.SHOW_LOADING) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1CAFF6" />
        </View>
      );
    }
    let glucoseValue: string;
    if (tempMonitor) {
      glucoseValue =
        tempMonitor.state > 0
          ? GLOBAL.MONITOR_STATES[tempMonitor.state]
          : tempMonitor.value && UTILS.glucoseConvMMol(tempMonitor.value);
    }
    return (
      <View
        style={{ flex: 1 }}
        onResponderGrant={() => {
          if (__DEV__) console.info("grant---");
        }}
        onResponderRelease={() => {
          if (__DEV__) console.info("release---");
          this.cancelSaveProc();
        }}
        onStartShouldSetResponder={e => {
          if (__DEV__) console.info("responder---");
          return true;
        }}
      >
        {this.renderToolbar()}
        {this._renderAlert()}
        {this._renderAlertBack()}
        <ContainerView style={themedStyle.container}>
          <View>
            <ValidationInput
              placeholder={Strings.message.input_name}
              icon={PersonIconFill}
              validator={StringValidator}
              onChangeText={this.onNameInputTextChange}
              value={patientName}
            />
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              <ValidationInput
                style={{ flex: 1 }}
                ref={input => {
                  this._secondTextInput = input;
                }}
                // enableIcon={this.state.enableCameraIcon}
                placeholder={cardPreface}
                icon={this.state.curCertKind != 0 && cardNumberIcon}
                validator={StringValidator}
                onChangeText={this.onCardNumInputTextChange}
                value={cardNumber}
                keyboardType={"numeric"}
              />
              {this.state.curCertKind == 0 && (
                <View style={{ paddingLeft: 10 }}>
                  <ImageButton
                    onPress={() => this.onPressProc("camera proc")}
                    imgSrc={require("@src/assets/icons/app/indentity_camera.png")}
                    width={55}
                    height={55}
                  />
                </View>
              )}
            </View>
            <ValidationInput
              multiline={true}
              // numberOfLines={2}
              maxLength={255}
              placeholder={Strings.message.input_address}
              icon={PinIconFill}
              validator={StringValidator}
              onChangeText={this.onAddressInputTextChange}
              value={address}
            />

            <View style={{ paddingVertical: 5 }}>
              <Text style={themedStyle.glucoseInputLabel}>
                {Strings.message.input_measureValue}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "flex-start"
              }}
            >
              <View style={{ flex: 0, width: 0 }} />
              <View style={{ width: 0 }} />
              <Section style={{ width: "100%" }} onPress={() => this.onPressProc("manual input")}>
                <Input
                  disabled={true}
                  textStyle={themedStyle.glucoseInputText}
                  labelStyle={themedStyle.glucoseInputLabel}
                  icon={BloodDropIconFill}
                  value={glucoseValue}
                />
              </Section>
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 10,
                marginTop: 0
              }}
            >
              {this.state.errorDevice ? (
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text status="danger" category="p1">
                    发现绑定设备异常
                  </Text>
                </View>
              ) : (
                  <View style={{ flex: 1, padding: 10 }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: "white",
                        minHeight: 120,
                        justifyContent: "center"
                      }}
                      onPress={() => this.onPressProc("pause monitor")}
                    >
                      <View style={{ alignItems: "center" }}>
                        <Spinner
                          isVisible={!this.state.pulsePause}
                          style={{ marginTop: 0 }}
                          size={50}
                          type="ThreeBounce"
                          // type="Wave"
                          color="#FF5544"
                        />
                      </View>
                      <View
                        style={{
                          marginBottom: 10,
                          alignItems: "center",
                          borderColor: "red",
                          borderRadius: 3,
                          borderWidth: this.state.pulsePause ? 1 : 0,
                          padding: this.state.pulsePause ? 10 : 0
                        }}
                      >
                        <Text status="danger" category="h6">
                          {this.state.pulsePause ? "测量开始" : "血糖测量中"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

              <View style={{ flex: 1 }}>
                <TimePointMenu
                  curTimeMark={GLOBAL.p_timeMark}
                  onMenuItemSelect={val => (GLOBAL.p_timeMark = val)}
                />
                <View style={{ height: 14 }} />

                <View style={themedStyle.leftButtonWrapper}>
                  <Button
                    icon={UploadIconFill}
                    // size="giant"
                    onPress={() => this.onSavePress()}
                    disabled={this.state.tempMonitor == undefined || !this.isValidPInfo()}
                  >
                    {this.state.saveBtnCaption}
                  </Button>
                </View>
                <View style={themedStyle.leftButtonWrapper}>
                  <Button
                    icon={SearchIconFill}
                    // size="giant"
                    // status="warning"
                    onPress={() => this.onPressProc("monitor log")}
                  >
                    历史查询
                  </Button>
                </View>
              </View>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 30 }}
            >
              <ValidationInput
                maxLength={4}
                style={{ flex: 1, marginRight: 3 }}
                label={Strings.message.input_temperature}
                //  icon={TemperatureIcon}
                validator={StringValidator}
                onChangeText={this.onTemperatureInputTextChange}
                value={temperature}
                keyboardType={"numeric"}
              />
              <ValidationInput
                maxLength={4}
                style={{ flex: 1, marginLeft: 3 }}
                label={Strings.message.input_pressure_high}
                // icon={PressureIcon}
                validator={StringValidator}
                onChangeText={this.onPressureHighInputTextChange}
                value={pressure_high}
                keyboardType={"numeric"}
              />
              <ValidationInput
                maxLength={4}
                style={{ flex: 1, marginLeft: 1 }}
                label={Strings.message.input_pressure_low}
                // icon={PressureIcon}
                validator={StringValidator}
                onChangeText={this.onPressureLowInputTextChange}
                value={pressure_low}
                keyboardType={"numeric"}
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
export const TaskFreeMeasure = withStyles(TaskFreeMeasureComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"],
    padding: 10
  },
  section: {
    padding: 10,
    borderBottomWidth: 0,
    borderBottomColor: theme["border-basic-color-2"]
  },
  headerText: {
    padding: 8,
    fontSize: 14,
    color: theme["color-primary-default"],
    textAlign: "center"
  },
  valueFrame: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme["color-primary-500"]
  },
  inputData: {
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    padding: 0,
    fontSize: 26,
    textAlign: "center",
    width: "100%",
    height: "100%"
  },
  saveBtn: {
    marginTop: 20
  },
  getLogBtn: { marginTop: 0, width: "48%", alignSelf: "flex-start" },
  getDataBtn: { marginTop: 0, width: "48%", alignSelf: "flex-end" },
  radioContainer: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "center"
  },
  radioItem: { marginRight: 6 },
  bottomView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute", // Here is the trick
    bottom: 12, // Here is the trick
    right: 10,
    width: 80,
    height: 80
  },
  slideInOption: {
    padding: 5
  },
  menuText: {
    fontSize: 20
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  timeText: {
    color: theme["text-hint-color"]
  },

  menuRowContainer: {
    paddingVertical: 3,
    flexDirection: "row",
    borderWidth: 0.3,
    borderColor: "lightgray",
    justifyContent: "space-around"
  },
  menuOption: {
    width: "50%",
    borderLeftWidth: 0.3,
    borderRightWidth: 0.3,
    borderColor: "lightgray"
  },
  radioText: {
    color: theme["color-primary-500"],
    fontSize: 16
  },
  glucoseInputText: { fontSize: 20, color: "red", textAlign: "center" },
  glucoseInputLabel: { fontSize: 16, color: theme["color-primary-500"] },
  leftButtonWrapper: { marginVertical: 3 }
}));
