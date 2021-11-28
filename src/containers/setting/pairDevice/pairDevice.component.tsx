import Strings from "@src/assets/strings";
import React from "react";
import {
  Dimensions,
  View,
  NativeModules,
  ToastAndroid,
  EmitterSubscription,
  DeviceEventEmitter,
  PermissionsAndroid,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ImageProps,
  ImageStyle,
  StyleProp,
  StyleSheet
} from "react-native";

import { SafeAreaView } from "@src/core/navigation";
import {
  ThemeProvider,
  ThemedComponentProps,
  ThemeType,
  withStyles,
  StyleType
} from "@src/core/react-native-ui-kitten/theme";
import { Text, Button, Input, RadioGroup, Radio } from "@src/core/react-native-ui-kitten/ui";
import { themes } from "@src/core/themes";
import { ScrollView } from "react-native-gesture-handler";
import { GlucoseDeviceIconFill } from "@src/assets/icons";
import AsyncStorage from "@react-native-community/async-storage";
import { DeviceList } from "./DeviceList";

const CareSens = NativeModules.CareSens;
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import ProgressBar from "@src/components/common/progressBar.component";
import commonStyles from "@src/containers/styles/common";
import { careSensHelper } from "@src/core/utils/caresensHelper";
import { DeviceModel } from "@src/core/model";
import logger from "redux-logger";

const screenWidth = Dimensions.get("window").width;
type IconProp = (style: StyleType) => React.ReactElement<ImageProps>;

interface ComponentProps { }
interface State {
  deviceType: number;
  isInitDevice: boolean;
  isEnabled: boolean;
  myDeviceNick: string;
  originDeviceNick: string;
  device: any;
  devices: any[];
  processing: boolean;
  isScanningDevice: boolean;
  isInitCompleted: boolean;
  bluetoothEnabled: boolean;
  remainInitTime: number;
}

type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props, State> {
  private bluetoothEnabledListener: EmitterSubscription;
  private bluetoothDisabledListener: EmitterSubscription;
  private errorListener: EmitterSubscription;
  private foundedDeviceListener: EmitterSubscription;
  private totalCountListener: EmitterSubscription;
  private dataDownloadedListener: EmitterSubscription;
  private lastDataNotSupporListener: EmitterSubscription;

  private _beginBindingProc: boolean;
  private _curRecordCount: number;

  private _selDevice: DeviceModel;
  private _initInterval;

  constructor(props: Props) {
    super(props);
    GLOBAL.isChineseDevice = false;
    this._beginBindingProc = false;
    this._selDevice = { ...GLOBAL.curDevice };
    this.state = {
      deviceType: GLOBAL.curDevice.type,
      isInitDevice: false,
      myDeviceNick: GLOBAL.curDevice.nick,
      originDeviceNick: undefined,
      isEnabled: false,
      device: null,
      devices: [],
      processing: false,
      isScanningDevice: false,
      isInitCompleted: false,
      bluetoothEnabled: false,
      remainInitTime: 0
    };
  }
  public componentDidMount() {
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
    this.totalCountListener = DeviceEventEmitter.addListener("totalCount", e =>
      this.totalCount(e)
    );
    this.dataDownloadedListener = DeviceEventEmitter.addListener("lastDataDownloaded", e =>
      this.dataDownloaded(e)
    );
    this.lastDataNotSupporListener = DeviceEventEmitter.addListener("lastDataNotSupport", e =>
      this.lastDataNotSupport(e)
    );
    if (GLOBAL.curDevice.type === 0) {
      this.initialize()
        .then(() => {
          if (__DEV__) console.info("init ok")
        })
        .catch(reason => {
          UTILS.showToast("初始化失败" + reason);
        });
    } else {
      // otg device
    }
  }
  componentWillUnmount() {
    this._initInterval && clearInterval(this._initInterval);
    this.procUnmount();
  }
  private procUnmount = () => {
    this.bluetoothEnabledListener.remove();
    this.bluetoothDisabledListener.remove();
    this.errorListener.remove();
    this.foundedDeviceListener.remove();
    if (this.dataDownloadedListener) this.dataDownloadedListener.remove();
    if (this.totalCountListener) this.totalCountListener.remove();
    if (this.lastDataNotSupporListener) this.lastDataNotSupporListener.remove();
    careSensHelper.disconnect();
    this.stopScan();
  };
  /**for caresens device bluetooth */
  async initialize() {
    this.setState({ isScanningDevice: true });
    try {
      const isEnabled = await CareSens.isEnabled();
      this.setState({ isEnabled: isEnabled });
      if (!isEnabled) this.toggleBluetooth(true);

      await CareSens.list();
    } catch (e) {
      UTILS.showToast(e.message);
    }
  }

  toggleDevicePairing = async ({ id, paired }) => {
    if (paired) {
      await this.unpairDevice(id);
    } else {
      await this.pairDevice(id);
    }
  };
  toggleBluetooth = async value => {
    try {
      if (value) {
        await CareSens.enable();
      } else {
        await CareSens.disable();
      }
    } catch (e) {
      if (__DEV__) console.error(e.message);
      UTILS.showToast(e.message);
    }
  };
  startScan = async () => {
    try {
      const result = await CareSens.startScan();
      if (result) {
      } else {
        UTILS.showToast("失败（startScan）", ToastAndroid.LONG);
      }
    } catch (e) {
      UTILS.showToast(e.message);
    }
  };

  stopScan = async () => {
    try {
      await CareSens.stopScan();
    } catch (e) {
      UTILS.showToast(e.message);
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
  pairDevice = async id => {
    this.setState({ processing: true });
    try {
      const paired = await CareSens.pairDevice(id);

      if (paired) {
        // this.stopScan();
        // this.startScan();
        UTILS.alert(`配对成功(${paired.name}<${paired.id}>)`);

        this.setState(({ devices, device }) => ({
          processing: false,
          device: {
            ...device,
            ...paired,
            paired: true
          },
          devices: devices.map(v => {
            if (v.id === paired.id) {
              return {
                ...v,
                ...paired,
                paired: true
              };
            }

            return v;
          })
        }));
      } else {
        this.setState({ processing: false });
        UTILS.showToast(`配对失败 <${id}>`);
      }
    } catch (e) {
      UTILS.showToast(e.message);
      this.setState({ processing: false });
    }
  };

  unpairDevice = async id => {
    this.setState({ processing: true });

    try {
      const unpaired = await CareSens.unpairDevice(id);

      if (unpaired) {
        UTILS.showToast(
          `Device ${unpaired.name}<${unpaired.id}> unpaired successfully`,
          ToastAndroid.SHORT
        );
        this.setState(({ devices, device }) => ({
          processing: false,
          device: {
            ...device,
            ...unpaired,
            connected: false,
            paired: false
          },
          devices: devices.map(v => {
            if (v.id === unpaired.id) {
              return {
                ...v,
                ...unpaired,
                connected: false,
                paired: false
              };
            }

            return v;
          })
        }));
      } else {
        UTILS.showToast(`Device <${id}> unpairing failed`, ToastAndroid.SHORT);
        this.setState({ processing: false });
      }
    } catch (e) {
      UTILS.showToast(e.message);
      this.setState({ processing: false });
    }
  };

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

  foundedDevice(e) {
    if (__DEV__) {
      console.info("-------------------------serialNumber:", e.device.serialNumber);
      console.info("-------------------------sequenceNumber:", e.device.sequenceNumber);
      console.info("-------------------------bounded:", e.device.bounded);
      console.info("founded device:", e.device.id);
    }

    if (e) {
      GLOBAL.sn = e.serialNumber;
      GLOBAL.isChineseDevice = GLOBAL.isChineseDeviceCheck(e.serialNumber);
      // if (GLOBAL.sn && (GLOBAL.sn.startsWith("F040") || GLOBAL.sn.startsWith("F042") || GLOBAL.sn.startsWith("F038")))
      //   GLOBAL.isChineseDevice = true;
      // else
      //   GLOBAL.isChineseDevice = false;
    }

    if (e && !this._beginBindingProc) {
      this._beginBindingProc = true;
      CareSens.stopScan();

      // UTILS.showToast(`设备发现 <${e.device.name}><${e.device.id}><${e.bounded}>`);

      const devicesTotal = [
        {
          id: e.device.id,
          name: e.device.name,
          address: e.device.address,
          paired: JSON.parse(e.bounded),
          connected: false
        }
      ];

      this.setState({ devices: devicesTotal });
      this.setState({ isScanningDevice: false });
      this.setState({ isInitCompleted: true });
    }
  }
  lastDataNotSupport(e) {
    if (__DEV__) console.info("~~~~~~~~~~~~~~~~~~~~~~~~~ lastDataNotSupport");
    GLOBAL.curDevice.useLast = false;

    careSensHelper.downloadLast(false);
  }
  totalCount(e) {
    if (__DEV__) console.info("totalCount:", e.totalCount);
    if (e) {
      // for set valid sequence number

      // this.totalCountListener = undefined;

      careSensHelper.downloadLast(true);
      GLOBAL.curDevice.record_count = e.totalCount;
      this._curRecordCount = 0;
    }
  }

  dataDownloaded(e) {
    if (this.dataDownloadedListener) this.dataDownloadedListener.remove();
    UTILS.showToast(Strings.common.str_opSuccess);

    careSensHelper.disconnect();

    asyncStorageHelper.setDeviceInfos();
    this.setState({ isInitDevice: false });
    if (__DEV__) console.info("useLastRecord = ", GLOBAL.curDevice.useLast);

    this._initInterval && clearInterval(this._initInterval);
  }

  /**end for message reciever */
  renderModal = (device, processing) => {
    /*        if (!device) return null;
                if (device.paired) return null;
                this.pairDevice(device.id).then(
                    () => {this.setState({processing: false})}
                )
                .catch(
                    (reason) => {this.setState({processing: false})}
                )
                */
    return null;

    const { id, name, paired, connected } = device;

    return (
      <Modal animationType="fade" transparent={false} visible={true} onRequestClose={() => { }}>
        {device ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{name}</Text>
            <Text style={{ fontSize: 14 }}>{`<${id}>`}</Text>

            {processing && <ActivityIndicator style={{ marginTop: 15 }} size={60} />}

            {!processing && (
              <View style={{ marginTop: 20, width: "50%" }}>
                <Button onPress={() => this.toggleDevicePairing(device)}>
                  {paired ? "Unpair" : "Pair"}
                </Button>
              </View>
            )}
          </View>
        ) : null}
      </Modal>
    );
  };

  private renderIconElement = (
    icon: IconProp,
    style: StyleProp<ImageStyle>
  ): React.ReactElement<ImageProps> => {
    const flatStyle: ImageStyle = StyleSheet.flatten(style);

    const iconElement: React.ReactElement<ImageProps> = icon(flatStyle);

    return React.cloneElement(iconElement, {
      style: [flatStyle, iconElement.props.style]
    });
  };
  onUpdateMyDeviceNickPress = async () => {
    if (!this.totalCountListener) {
      this.totalCountListener = DeviceEventEmitter.addListener("totalCount", e =>
        this.totalCount(e)
      );
    }


    this.setState({ myDeviceNick: this.state.originDeviceNick });
    this._selDevice.nick = this.state.originDeviceNick;

    GLOBAL.curDevice.name = this._selDevice.name;
    GLOBAL.curDevice.nick = this._selDevice.nick;
    GLOBAL.curDevice.id = this._selDevice.id;
    GLOBAL.curDevice.useLast = true;
    const id = GLOBAL.curDevice.id;
    if (__DEV__) console.info("call start connnectToDevice:", id);


    // for get data all for set valid sequence number
    this.setState({ remainInitTime: 60, isInitDevice: true });

    this._initInterval && clearInterval(this._initInterval);
    let intervalCounter = 0;
    this._initInterval = setInterval(() => {
      this.setState({ remainInitTime: 60 - intervalCounter });
      intervalCounter++;
      if (intervalCounter > 60) {
        careSensHelper.disconnect();
        this.stopScan();

        clearInterval(this._initInterval);

        this._initInterval = undefined;

        if (this.state.isInitDevice) {
          UTILS.showToast("设备初始化失败，请重新试试");
          this.setState({
            isInitDevice: false,
            isScanningDevice: false,
            isInitCompleted: true
          });
        }
      }
    }, 1000);
    // await careSensHelper.disconnect();
    careSensHelper.connnectToDevice(true, true);

    asyncStorageHelper.setDeviceInfos();
  };
  onDeviceListItemPressed = device => {
    this.setState({ device });
    if (!device.paired) {
      this.pairDevice(device.id)
        .then(() => {
          this.setState({ originDeviceNick: device.name });
          // for get data all for set valid sequence number
          this._selDevice = {
            id: device.id,
            nick: device.name,
            name: device.name,
            sn: device.name
          };
        })
        .catch(reason => {
          this.setState({ processing: false });
        });
    } else {
      this.setState({ originDeviceNick: device.name });
      this._selDevice = {
        id: device.id,
        nick: device.name,
        name: device.name,
        sn: device.name
      };
    }
  };
  onRadioChange = index => {
    this.setState({ deviceType: index });
    GLOBAL.curDevice.type = index;
    asyncStorageHelper.setDeviceInfos();

    if (index === 0) {
      this.initialize();
    } else {
      // careSensHelper.getOtgDeviceInfo();
      this.setState({ isScanningDevice: false });

      careSensHelper.disconnect();
      this.stopScan();

      clearInterval(this._initInterval);
    }
  };
  private renderToolbar = () => {
    const { themedStyle, ...restProps } = this.props;
    let disabled = this.state.isInitDevice;
    if (this.state.deviceType === 1) disabled = false;
    return (
      <View style={[commonStyles.toolbarContainer, { backgroundColor: "white" }]}>

        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>

          <Text style={themedStyle.radioText}>{"类型:"}</Text>

          <RadioGroup
            onChange={index => this.onRadioChange(index)}
            selectedIndex={this.state.deviceType}
            style={{ flexDirection: "row", paddingVertical: 6, justifyContent: "center", flex: 1 }}
          >
            <Radio
              disabled={disabled}
              text={"蓝牙"}
              style={themedStyle.radioItem}
              textStyle={themedStyle.radioText}
            />
            <Radio
              disabled={disabled}
              text={"国内有线"}
              style={themedStyle.radioItem}
              textStyle={themedStyle.radioText}
            />
            <Radio
              disabled={disabled}
              text={"国外有线"}
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
    const iconElement = this.renderIconElement(GlucoseDeviceIconFill, [themedStyle.deviceIcon]);
    const { isEnabled, myDeviceNick, originDeviceNick, device, devices, processing } = this.state;

    if (this.state.isInitDevice) {
      return (
        <View style={commonStyles.progressBar}>
          <ProgressBar />
          <Text>{"正在进行设备初始化，请稍后 \n (请保持设备蓝牙连接状态)"}</Text>
          <Text>{`${this.state.remainInitTime}`}</Text>
        </View>
      );
    }
    return (
      <SafeAreaView style={themedStyle.safeAreaContainer}>
        <ScrollView style={{ padding: 8, paddingTop: 0 }}>
          {this.renderToolbar()}
          {this.state.deviceType > 0 ? (
            <View />
          ) : (
              <View>
                <View style={themedStyle.myDeviceContainer}>
                  <View style={themedStyle.myDeviceCaptionContainer}>
                    {iconElement}
                    <Text category="h6" style={themedStyle.captionText}>
                      {"  当前设备"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text category="h3" status="warning" style={themedStyle.myDeviceName}>
                      {myDeviceNick}
                    </Text>
                  </View>
                </View>
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <Input
                      label="设备名称"
                      placeholder="请输入设备名称"
                      textStyle={{ fontSize: 18 }}
                      onChangeText={originDeviceNick => this.setState({ originDeviceNick })}
                      value={originDeviceNick}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                  <Button
                    disabled={!this.state.originDeviceNick}
                    appearance="outline"
                    style={themedStyle.confirmBtn}
                    onPress={this.onUpdateMyDeviceNickPress}
                  >
                    绑定
                </Button>
                </View>

                <View
                  style={{
                    marginTop: 10,
                    borderTopWidth: 0.5,
                    borderColor: "lightgray",
                    minHeight: 200
                  }}
                >
                  {this.state.isScanningDevice && !this.state.isInitCompleted ? (
                    <ActivityIndicator style={{ marginTop: 20 }} size={20} />
                  ) : (
                      <React.Fragment>
                        {this.renderModal(device, processing)}
                        <DeviceList
                          devices={devices}
                          onDevicePressed={device => this.onDeviceListItemPressed(device)}
                        />
                      </React.Fragment>
                    )}
                </View>
              </View>
            )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export const PairDevice = withStyles(MyComponent, (theme: ThemeType) => ({
  safeAreaContainer: {
    backgroundColor: theme["mycolor-background"]
  },
  toolbarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // paddingHorizontal: 6,
    backgroundColor: theme["mycolor-background"],
    marginBottom: 1
  },
  confirmBtn: {
    marginVertical: 10,
    width: 120,
    borderRadius: 3,
    borderWidth: 0.5
  },
  myDeviceContainer: {
    // paddingHorizontal: 10,
    paddingVertical: 10
  },
  myDeviceCaptionContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  myDeviceCaption: {
    marginLeft: 20
  },
  deviceIcon: {
    // tintColor: theme["color-warning-500"],
    width: 26,
    height: 26
  },
  myDeviceName: {
    width: "100%",
    alignItems: "center",
    minHeight: 60
  },
  captionText: {
    color: theme["text-hint-color"]
  },
  radioText: {
    color: theme["color-primary-500"],
    fontSize: 14
  },
  radioItem: { marginRight: 2 }
}));
