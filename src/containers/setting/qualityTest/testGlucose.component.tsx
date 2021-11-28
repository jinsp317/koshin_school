import Strings from "@src/assets/strings";
import React from "react";
import {
  NativeModules,
  View,
  TouchableOpacity,
  TouchableOpacityProps,
  ToastAndroid,
  EmitterSubscription,
  DeviceEventEmitter,
  PermissionsAndroid,
  ActivityIndicator,
  Alert
} from "react-native";
import {
  ThemeType,
  withStyles,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Text } from "@src/core/react-native-ui-kitten/ui";
import { ContainerView, textStyle } from "@src/components/common";

import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import { careSensHelper } from "@src/core/utils/caresensHelper";

import Spinner from "react-native-spinkit";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import AlertPro from "@src/components/common/alertPro";
const CareSens = NativeModules.CareSens;

interface ComponentProps {
  onSavePress: (value: number) => void;
  pauseMeasure: boolean;
  needInit: boolean;
  isLoading: boolean;
  errorDevice: boolean;
  onNeedInit: (needInit: boolean) => void;
}
interface State {
  measureValString: string;
  measureTotalCount: number | undefined;

  maxGlucose: number;
  timer: any;
  bluetoothEnabled: boolean;
  measureVal: number | undefined;
  measureTime: Date;
  pulsePause: boolean;

  errorDevice: boolean;
  isLoading: boolean;
  buttonDisabled: boolean;
}

export type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props, State> {
  private _alertPro: any;
  private _curGlucoseVal: number;

  private _measureSeqNum: number = 0;
  private _canShowAlert = true;
  private _isConnecting = false;

  private bluetoothEnabledListener: EmitterSubscription;
  private bluetoothDisabledListener: EmitterSubscription;
  private errorListener: EmitterSubscription;
  private foundedDeviceListener: EmitterSubscription;
  private totalCountListener: EmitterSubscription;
  private dataDownloadedListener: EmitterSubscription;
  private dataListener: EmitterSubscription;
  private failedConnectDeviceListener: EmitterSubscription;
  private connectionFailedListener: EmitterSubscription;
  private deviceDisconnectedListener: EmitterSubscription;
  private getLatestDataOtgListener: EmitterSubscription;
  private getOtgDeviceSNListener: EmitterSubscription;
  private _isGetLatestValue = false;

  constructor(props: Props) {
    super(props);
    GLOBAL.isChineseDevice = false;
    this._isGetLatestValue = false;
    this.state = {
      measureTotalCount: 0,
      measureValString: undefined,

      maxGlucose: 0,
      timer: undefined,
      bluetoothEnabled: undefined,
      measureTime: UTILS.createDate(undefined),
      measureVal: undefined,
      pulsePause: this.props.pauseMeasure,

      errorDevice: this.props.errorDevice,
      isLoading: this.props.isLoading,
      buttonDisabled: false
    };
  }

  componentDidMount() {
    this.bluetoothEnabledListener = DeviceEventEmitter.addListener("bluetoothEnabled", e =>
      this.bluetoothEnabled(e)
    );
    this.bluetoothDisabledListener = DeviceEventEmitter.addListener("bluetoothDisabled", e =>
      this.bluetoothDisabled(e)
    );
    this.errorListener = DeviceEventEmitter.addListener("error", e => this.error(e));
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
      careSensHelper.connnectToDevice(true, GLOBAL.curDevice.useLast)
        .then((result) => {
          this._isConnecting = false;
          careSensHelper
            .initialize()
            .then(() => {
              const isPause = this.state.errorDevice ? true : this.props.pauseMeasure;
              if (__DEV__) console.info("call onPausePulse in initialize");
              this.onPausePulse(isPause, false, true);
            })
            .catch(reason => {
              this.setState({ errorDevice: true });
              UTILS.showToast("初始化失败" + reason);
            });
        })
        .catch((error) => {
          this.setState({ pulsePause: true });
          UTILS.showToast("失败（connnectToDevice）", ToastAndroid.LONG);
          this._isConnecting = false;
        });
    }
  }
  componentWillUnmount() {
    this.bluetoothEnabledListener.remove();
    this.bluetoothDisabledListener.remove();
    this.errorListener.remove();
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
  private onGetLastRecordFromOTG = () => {
    this._isGetLatestValue = true;
    this.setState({ buttonDisabled: true });
    careSensHelper.getOtgDeviceInfo();

  };
  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      errorDevice: nextProps.errorDevice,
      isLoading: nextProps.isLoading
    });
    if (nextProps.pauseMeasure === false) {
      if (__DEV__) console.info("call onPausePulse in componentWillReceiveProps");
      this.onPausePulse(false, false);
    }
    if (nextProps.needInit) {
      this.initInputsState();
    }
  }
  private initInputsState = (initGlucose = true) => {
    if (initGlucose) {
      this.setState(
        {
          measureVal: undefined,
          measureValString: undefined
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
      UTILS.showToast(e.e.message);
    }
  }

  errorConnectDevice(e) {
    if (__DEV__) console.error(`Error Connect to Device`);
    // UTILS.showToast("Error Connect to Device");
  }
  connectionFailed(e) {
    if (__DEV__) console.warn(`connectionFailed` + e.message + e.device.id);
    // UTILS.showToast("connectionFailed");
  }
  deviceDisconnected(e) {
    if (__DEV__) console.warn("device disconnected -----------------", e.device.id);
    if (!this.state.pulsePause) {
      // console.log("call start connnectToDevice");
      // careSensHelper.connnectToDevice();
    }
  }
  foundedDevice = async (e) => {

    if (e) {
      GLOBAL.sn = e.serialNumber;
      if (__DEV__) {
        console.info("-------------------------name:", e.device.name);
        console.info("founded device:", e.device.id);
      }

      UTILS.showToast("" + e.timeFound);
      if (e.device.name === GLOBAL.curDevice.name) {
        if (this.foundedDeviceListener) this.foundedDeviceListener.remove();
        await CareSens.stopScan();

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
      }


    }
    if (GLOBAL.curDevice.type > 0) return;

    if (e) {
      this._measureSeqNum = Number(e.sequenceNumber);

      if (e.bounded == undefined) {
        // case of paired
        if (__DEV__) {
          console.info(`设备发现 <name:${e.device.name}><id:${e.device.id}><SN:${e.serialNumber}><sq:${e.sequenceNumber}>`
          );
        }

      } else {
        // case of no paired
        this.verifyDevId(e.device.id).then(() => {
          if (e.bounded == true) {
            UTILS.showToast("设备异常");
          } else {
            // UTILS.showToast("请检查蓝牙配对状态");
          }
        });
      }
    }
  }
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
  procRecieveData = () => {
    const measureValString = UTILS.glucoseConvMMol(this._curGlucoseVal);
    this.setState({ measureValString }, () => {
      this.onPausePulse(true, false);

      this.onSavePress();
      this._canShowAlert = true;
    });
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
      // UTILS.showToast(e.sn);
      console.info("-------------------otgDeviceSnDownloaded val ", e.glucoseData);
    }

    if (GLOBAL.curDevice.type === 0) return;

    if (!this._isGetLatestValue && this.state.pulsePause) return;
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
      // e.sn = "test otg device";
      GLOBAL.curDevice.otg_sn = e.sn;
      // UTILS.showToast(e.sn);
      // sn을 꼭 알고싶어?
      if (!e.sn) {
        careSensHelper.getOtgDeviceInfo();
      } else {
        this.procRecieveData();
      }
    }

  }

  dataDownloaded(e) {
    if (GLOBAL.curDevice.type > 0) return;
    // if (this._measureSid > -1 && GLOBAL.curDevice.last_seqnum === e.sequenceNumber) return;
    // this._measureSid = e.sequenceNumber;
    // if (GLOBAL.curMonitorAutoSaveDelayIdx < 3) this.dataDownloadedListener.remove();
    GLOBAL.isChineseDevice = GLOBAL.isChineseDeviceCheck(e.serialNumber);
    if (GLOBAL.curDevice.type == 0 && GLOBAL.isChineseDeviceCheck(e.serialNumber)) {
      GLOBAL.isChineseDevice = true;
    } else {
      GLOBAL.isChineseDevice = false;
    }

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
        message={Strings.message.confirm_reuseTestMonitorValue}
      />
    );
  };
  data(e) {
    if (e.result) {
      const { id, data } = e.result;
      if (__DEV__) console.warn(`Data from device ${id} : ${data}`);
    }
  }
  // 测量记录Sequence number
  private verifySeqNum = (seq: number): Promise<void> => {
    return new Promise(function (resolve, reject) {
      if (GLOBAL.curDevice.last_seqnum != seq) {
        GLOBAL.curDevice.last_seqnum = seq;
        if (__DEV__) console.info("verify seq OK!!! ", seq);
        resolve();
      } else {
        if (__DEV__) console.warn("verify seq Failed!!! ", seq);
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
        if (__DEV__) console.warn("verify dev id Failed!!!");
        reject();
      }
    });
  };
  // 测量暂停继续
  private onPausePulse = async (pulsePause: boolean, showToast: boolean, isFirst = false) => {
    if (this.state.pulsePause === pulsePause && !isFirst) return;
    if (this._isConnecting) return;
    if (__DEV__) console.info("call onPausePulse");
    this._isConnecting = true;
    this.setState({ pulsePause, measureVal: undefined });

    if (GLOBAL.curDevice.type === 0) {
      if (pulsePause) {
        // clearTimeout(this._monitorInterval);
        if (__DEV__) console.info("call start disconnect");
        careSensHelper.disconnect();
        this._isConnecting = false;
      } else {
        if (__DEV__) console.info("call list");
        await CareSens.list();
        /*
        careSensHelper
          .connnectToDevice()
          .then((result) => {
            this._isConnecting = false;
          })
          .catch((error) => {
            this.setState({ pulsePause: true });
            UTILS.showToast("失败（startScan）", ToastAndroid.LONG);
            this._isConnecting = false;
          });
          */
        // this.connectTimer();
      }
    } else {
      this._isConnecting = false;
    }

    const msg = pulsePause
      ? Strings.message.alert_monitorPause
      : Strings.message.alert_monitorStart;
    if (showToast) UTILS.showToast(msg);
  };

  private onSavePress = () => {
    const value: number = Number(this.state.measureValString);
    this.props.onSavePress(UTILS.glucoseConvMgNum(value));
  };

  private renderAlertbar = () => {
    const { themedStyle } = this.props;
    return (
      <View style={themedStyle.alertbarContainer}>
        <Text>{Strings.message.warning_errorDevice}</Text>
      </View>
    );
  };

  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1CAFF6" />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {this.state.errorDevice && this.renderAlertbar()}
        <ContainerView
          style={themedStyle.container}
          contentContainerStyle={{ flex: 1, justifyContent: "center" }}
        >
          {GLOBAL.DEBUG && (
            <Button
              onPress={() => {
                this.setState({ measureValString: "30" }, () => this.onSavePress());
              }}
            >
              test
            </Button>
          )}
          {GLOBAL.curDevice.type > 0 && (
            <Button style={[themedStyle.buttonWrapper, { marginBottom: 10 }]}
              onPress={() => this.onGetLastRecordFromOTG()}
              disabled={this.state.buttonDisabled}
            >
              获取最后一条数据
            </Button>
          )}
          {this._renderAlert()}
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <TouchableOpacity
              style={{ backgroundColor: "white", minHeight: 50 }}
              onPress={() => this.onPausePulse(!this.state.pulsePause, true, false)}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Spinner
                  isVisible={!this.state.pulsePause}
                  style={{ marginTop: 0 }}
                  size={80}
                  type="ThreeBounce"
                  // type="Wave"
                  color="#FF5544"
                />
              </View>
              <View
                style={{
                  marginBottom: 10,
                  alignItems: "center",
                  borderRadius: 3,
                  borderColor: "red",
                  borderWidth: this.state.pulsePause ? 1 : 0,
                  padding: this.state.pulsePause ? 10 : 10
                }}
              >
                <Text status="danger" category="h6">
                  {this.state.pulsePause ? "质控检测开始" : "检测中"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ContainerView>
      </View>
    );
  }
}
interface SectionProps extends TouchableOpacityProps {
  children?: React.ReactNode;
}

export const TestGlucose = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"],
    padding: 10
  },
  alertbarContainer: {
    flexDirection: "row",
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 3,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme["color-warning-500"],
    height: 46
  },

  sectionTextMain: {
    ...textStyle.subtitle,
    color: theme["text-basic-color"],
    fontSize: 20,
    marginHorizontal: 10,
  },
  sectionTextSub: {
    ...textStyle.subtitle,
    color: theme["#ccc"],
    fontSize: 18,
    marginRight: 10
  },
  headerText: {
    padding: 8,
    fontSize: 14,
    color: theme["color-primary-default"],
    textAlign: "center"
  },
  saveBtn: {
    marginTop: 20
  },
  slideInOption: {
    padding: 5
  },
  menuText: {
    fontSize: 20
  },
  glucoseInputText: { fontSize: 20, color: "red", textAlign: "center" },
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
    borderColor: theme["border-basic-color-2"]
  },
  sectionA: {
    borderTopWidth: 1,
    borderColor: theme["border-basic-color-2"]
  },
  pointMenuText: { fontSize: 18, color: theme["#ccc"], fontWeight: "normal" }
}));
