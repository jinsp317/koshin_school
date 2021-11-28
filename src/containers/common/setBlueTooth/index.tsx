import React from "react";

import {
  ActivityIndicator,
  AppRegistry,
  StyleSheet,
  ScrollView, Alert, FlatList, TouchableHighlight
} from 'react-native'
import { NavigationScreenProps } from "react-navigation";
import {
  ThemeProvider,
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { themes } from "@src/core/themes";
import GLOBAL from "@src/core/globals";
import { connectedBluetoothServer } from '../../../actions/actions'

import { Button, Text, Input, InputProps } from "@src/core/react-native-ui-kitten/ui";
import { NativeModules, DeviceEventEmitter, EmitterSubscription, View } from 'react-native';
import AndroidOpenSettings from "react-native-android-open-settings";
import { connect } from 'react-redux'
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
const BluetoothChat = NativeModules.BluetoothIOModule;
const { EventOnDataRx, EventOnStateChange,
  EventOnBluetoothStateChange, onBluetoothDiscoveryStart } = BluetoothChat.getConstants();
import { playSampleSound } from 'react-native-notification-sounds';
import * as UTILS from "@src/core/app_utils";
import Strings from "@src/assets/strings";
interface State {
  myDeviceNick: string;
  originDeviceNick: string;
  oDevice: any[];
  deviceId: string;
  cDevice: any;
  crDevice: any;
  findStatus: boolean;
}
export type SetBlueToothProps = ThemedComponentProps & NavigationScreenProps & {
  onBluetoothSvConnect: (status: boolean) => void;
  connected: boolean;
};
const mapDispatchToProps = (dispatch) => {
  return {
    onBluetoothSvConnect: (status: boolean) => {
      dispatch(connectedBluetoothServer(status));
    }
  }
}
class MyComponent extends React.Component<SetBlueToothProps, State> {
  private deviceId: any;
  private dataListener: EmitterSubscription;
  private dataStateListener: EmitterSubscription;
  private bluetoothEnableListener: EmitterSubscription;
  private soundList: any[];
  constructor(props: SetBlueToothProps) {
    super(props);
    this.state = {
      myDeviceNick: undefined,
      originDeviceNick: undefined,
      oDevice: [],
      cDevice: GLOBAL.bluetoothServer,
      deviceId: undefined,
      crDevice: undefined,
      findStatus: true
    }
    this.dataListener = undefined;
    this.dataStateListener = undefined;
    this.bluetoothEnableListener = undefined;
  }
  private comingSoonModalId: string;

  private showComingSoonModal = () => {

  };

  private hideComingSoonModal = () => {

  };
  private findDevices = async () => {
    this.setState({ findStatus: true });
    BluetoothChat.getDeviceList("").then((deviceList) => {
      // console.log(deviceList);
      if (deviceList.length) {
        playSampleSound(GLOBAL.alarmSounds[1]);
        this.setState({ findStatus: false, oDevice: deviceList });
      } else {
        this.findDevices();
      }
    }).catch((e) => {
      if (__DEV__) console.error(e.message);
    })
  }


  componentDidMount() {
    // CareSens.disconnectAll();
    // console.log(EventOnDataRx);
    // BluetoothChat.componentDidMount();
    // this.dataListener = DeviceEventEmitter.addListener(EventOnDataRx, (e) => this.data(e));

    this.dataStateListener = DeviceEventEmitter.addListener(EventOnStateChange,
      (e) => this.onBluetoothStateChange(e));
    this.bluetoothEnableListener = DeviceEventEmitter.addListener(onBluetoothDiscoveryStart,
      (e) => this.onBluetoothChange(e));
    this.deviceId = GLOBAL.bluetoothServer;
    BluetoothChat.discoveryStart();
    // BluetoothChat.listenerAdd("onBluetoothStateChange", this.onBluetoothStateChange);
    // BluetoothSerial.on('connectionSuccess ', () => console.log('connectionSuccess'));
  }
  componentWillUnmount() {
    this.dataListener && this.dataListener.remove();
    this.dataStateListener && this.dataStateListener.remove();
    this.bluetoothEnableListener && this.bluetoothEnableListener.remove();
  }
  private onDevicePressed = device => () => {
    // console.log(device);
    // BlueToothHelper.connectDevice(device);
    this.deviceId = device;
    this.setState({ cDevice: device, crDevice: device });
    // console.log(pDevice);
  }
  private onBluetoothChange(e) {
    setTimeout(() => {
      this.findDevices();
    }, 1000);
  }
  private onBluetoothStateChange = (e) => {
    if (e.state === 3) {
      playSampleSound(GLOBAL.alarmSounds[5]);
      GLOBAL.BluetoothConnState = true;
      this.props.onBluetoothSvConnect(true);
      GLOBAL.bluetoothServer = this.deviceId;
      asyncStorageHelper.setUserInfos();
      UTILS.showToast(Strings.message.success_bluetooth_server);
    } else {
      GLOBAL.BluetoothConnState = false;
      this.props.onBluetoothSvConnect(false);
    }
  }

  private renderItem = (info, index) => {
    const styles = this.props.themedStyle;
    return (
      <TouchableHighlight underlayColor="#eee" key={index}
        style={styles.listItem}
        onPress={this.onDevicePressed(info)}
      >
        <View style={styles.deviceItem}>
          <Text style={styles.deviceCaptionContainer}>{`${info.name}`}</Text>
        </View>
      </TouchableHighlight>
    )
  }
  private onUpdateMyDeviceNickPress = async () => {
    if (this.deviceId) {

      BluetoothChat.connect(this.deviceId, false);
    }
    // BluetoothSerial.connect(this.deviceId).then((res) => {
    //   console.log('connection success.');

    // }).catch((err) => {
    //   console.log(err);
    // });
  }
  render() {
    const { themedStyle, ...restProps } = this.props;
    const { myDeviceNick, originDeviceNick, findStatus, oDevice, cDevice, crDevice } = this.state;
    return (
      <ThemeProvider theme={{ ...this.props.theme, ...themes["App Theme"] }}>
        <ScrollView keyboardShouldPersistTaps="always" keyboardDismissMode={"interactive"}>
          {findStatus && (<ActivityIndicator style={{ marginTop: 20 }} size={20} />)}
          {cDevice && (
            <View style={{
              flex: 1,
              flexDirection: 'row',
            }}>
              <Text category="h6" status="warning" style={themedStyle.captionText}>
                {" 当前设备"}
              </Text>
              <Text category="h6" status="warning" style={themedStyle.captionText}>
                {`${cDevice.name}`}
              </Text>
            </View>
          )}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
            <View style={{ alignItems: "center" }}>
              <Text category="h6" style={themedStyle.curDeviceName}>
                {`${crDevice ? crDevice.name : ''}`}
              </Text>
            </View>
            <Button disabled={!this.state.cDevice}
              appearance="outline"
              style={themedStyle.confirmBtn}
              onPress={this.onUpdateMyDeviceNickPress}
            >
              连接
              </Button>
          </View>
          <ScrollView keyboardShouldPersistTaps="always" keyboardDismissMode={"interactive"}>
            <View style={themedStyle.listContainer}>
              {oDevice.length > 0 ? (
                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index, separators }) => this.renderItem(item, index)}
                  contentContainerStyle={themedStyle.contentContainer}
                  initialNumToRender={10}
                  data={oDevice}
                  refreshing={findStatus}
                  onRefresh={this.onRefresh}
                />
              ) : (<View />)}
            </View>
          </ScrollView>
        </ScrollView>
      </ThemeProvider>
    );
  }
  private _bootstrapAsync = async () => {
    // this.showComingSoonModal();
  };
}
const mapStateToProps = (state) => {
  return {
    connected: state.blueServerConn.connected
  }
}
export const SetBlueToothScreen = withStyles(connect(mapStateToProps, mapDispatchToProps)(MyComponent), (theme: ThemeType) => ({
  safeAreaContainer: {
    backgroundColor: theme["mycolor-background"]
  },
  deviceCaptionContainer: {
    flexDirection: "row",
    marginHorizontal: 3,
    alignItems: "center"
  },
  deviceItem: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 9,
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
  contentContainer: {
    paddingHorizontal: 3,
    paddingVertical: 3
  },
  listContainer: {
    borderColor: "lightgray",
    borderTopWidth: 0.5
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
  curDeviceName: {
    marginVertical: 13,
    marginHorizontal: 3
  },
  captionText: {
    marginHorizontal: 3,
  },
  radioText: {
    color: theme["color-primary-500"],
    fontSize: 14
  },
  radioItem: { marginRight: 2 }
}));
