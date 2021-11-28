import React from "react";
import {
  ImageRequireSource,
  BackHandler,
  Alert,
  NativeModules,
  EmitterSubscription,
  Vibration,
} from "react-native";
import { NavigationState } from "react-navigation";
import { mapping } from "@src/core/@eva-design/eva";
import { ApplicationProvider } from "@src/core/react-native-ui-kitten/theme";
import { DynamicStatusBar } from "@src/components/common";
import { ApplicationLoader, Assets } from "./core/appLoader/applicationLoader.component";
import { Router } from "./core/navigation/routes";
import { trackScreenTransition } from "./core/utils/analytics";
import { getCurrentStateName, getCurrentStateParam } from "./core/navigation/routeUtil";
import { ThemeContext, ThemeContextType, ThemeKey, themes, ThemeStore } from "@src/core/themes";
import { MenuProvider } from "react-native-popup-menu";
import { setSyncWait, connectedBluetoothServer } from './actions/actions'
import { Provider, connect } from 'react-redux';
import store from "./store";
import * as UTILS from "@src/core/app_utils";

import BackgroundJob from "react-native-background-job";
import BackgroundTask from "react-native-background-task";

import ReactNativeAN from "react-native-alarm-notification";
import { DeviceEventEmitter } from "react-native";
import AndroidOpenSettings from "react-native-android-open-settings";
import GLOBAL from "./core/globals";
import { AlarmModel } from "./core/model";
import * as SYNC_HELPER from "@src/core/syncHelper";
import NavigationService from "@src/core/utils/navigationService";
import { asyncStorageHelper } from "./core/utils/storageHelper";
import NetInfo from "@react-native-community/netinfo";
import RNRestart from "react-native-restart";
import { httpHelper } from "./core/utils/httpHelper";
import Wakeful from "react-native-wakeful";
import IntentLauncher from "react-native-intent-launcher";
import { EventRegister } from 'react-native-event-listeners';

const BluetoothChat = NativeModules.BluetoothIOModule;
const { EventOnDataRx, EventOnStateChange, EventOnBluetoothStateChange } = BluetoothChat.getConstants();
import NotificationSounds, { playSampleSound } from 'react-native-notification-sounds';
import { AppSync } from "@src/core/appSync";
import { StatusBar, Dimensions } from 'react-native';
import { ResponseSignModel } from "@src/core/model/responses.model";
const isPortrait = () => {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width;
};
const images: ImageRequireSource[] = [
  require("./assets/images/source/cloud_disabled.png"),
  require("./assets/images/source/cloud_disabled.png"),
  require("./assets/images/source/cloud_disabled.png"),
  require("./assets/images/source/cloud_disabled.png"),
  require("./assets/images/source/cloud_disabled.png"),
  require("./assets/images/source/cloud_disabled.png"),
  require("./assets/images/source/cloud_disabled.png"),
  require("./assets/images/source/cloud_disabled.png"),
  require("./assets/images/source/cloud_disabled.png"),
  require("./assets/images/source/cloud_disabled.png")
];

const fonts: { [key: string]: number } = {
  "opensans-semibold": require("./assets/fonts/opensans-semibold.ttf"),
  "opensans-bold": require("./assets/fonts/opensans-bold.ttf"),
  "opensans-extrabold": require("./assets/fonts/opensans-extra-bold.ttf"),
  "opensans-light": require("./assets/fonts/opensans-light.ttf"),
  "opensans-regular": require("./assets/fonts/opensans-regular.ttf")
};

const assets: Assets = {
  images: images,
  fonts: fonts
};

/** for background proc */
BackgroundTask.define(async () => {
  SYNC_HELPER.monitorMyTask(GLOBAL.everRunningJobKey);
  // Remember to call finish()
  BackgroundTask.finish();
});

// This has to run outside of the component definition since the component is never
// instantiated when running in headless mode

BackgroundJob.register({
  jobKey: GLOBAL.foregroundJobKey,
  job: () => SYNC_HELPER.dataSyncProc()
});
BackgroundJob.register({
  jobKey: GLOBAL.everRunningJobKey,
  job: () => SYNC_HELPER.monitorMyTask(GLOBAL.everRunningJobKey)
});

async function AlarmListenr(e) {
  const obj: AlarmModel = JSON.parse(e);
  // console.log(obj);

  if (obj.id === GLOBAL.AlarmKey_ResetApp) {
    RNRestart.Restart();
  }
  if (obj.id === GLOBAL.AlarmKey_OpenBatterySetting) {
    if (__DEV__) console.info("AlarmKey_OpenBatterySetting");
    AndroidOpenSettings.appDetailsSettings();
  } else if (obj.id === GLOBAL.AlarmKey_CheckTask) {
    if (__DEV__) console.info("AlarmKey_CheckTask");
    NavigationService.navigate("Task Glucose", { isCompleted: 0 });
  } else if (obj.id === GLOBAL.AlarmKey_GlucoseAlert) {
    if (__DEV__) console.info("AlarmKey_GlucoseAlert");
    NavigationService.navigate("Task Glucose", { isCompleted: 1 });
  }
}

interface State {
  theme: ThemeKey;
  isReady: boolean;
}

if (__DEV__) {
  // console.log(store.getState());
}
/* store.subscribe(() => {
  console.log(store.getState());
}); */
export default class App extends React.Component<{}, State> {
  private exitApp: boolean;
  private timeout: number;
  private _isRootScreen: boolean;
  private _wakeful;
  private dataListener: EmitterSubscription;
  private dataStateListener: EmitterSubscription;
  constructor(props) {
    super(props);
    this._isRootScreen = false;
  }
  public state: State = {
    theme: "App Theme",
    isReady: false
  };

  // 이벤트 등록
  async componentDidMount() {
    if (__DEV__) console.info("---------------app component did mount-------------------");

    this._wakeful = new Wakeful();
    this._wakeful.acquire();
    NotificationSounds.getNotifications('notification').then(soundsList => {
      GLOBAL.alarmSounds = soundsList;
    });
    Dimensions.addEventListener('change', () => {
      const bDir = isPortrait();
      if (bDir) {
        StatusBar.setHidden(false);
      } else {
        StatusBar.setHidden(true);
      }
      // this.setState({ isPortrait: bDir })
    });
    store.dispatch(connectedBluetoothServer(false));
    NetInfo.addEventListener(state => {
      // console.log(state);
      // if (state.type == Connect_Type.Wifi) {
      GLOBAL.connectType = state.type;
      this.handleConnectivityChange(state.isConnected);
      // }

    });

    // NetInfo.isConnected.addEventListener("connectionChange", this.handleConnectivityChange);
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);

    // 알람이 소멸될때...
    // DeviceEventEmitter.addListener("OnNotificationDismissed", async function (e) {
    //   console.log("---NotificationDismissed" + JSON.parse(e));
    // });
    this.dataListener = DeviceEventEmitter.addListener(EventOnDataRx, (e) => this.onBTSynData(e));
    // 사용자가 알람을 열었을때...

    this.dataStateListener = DeviceEventEmitter.addListener(EventOnStateChange,
      (e) => this.onBluetoothStateChange(e));
    DeviceEventEmitter.addListener("OnNotificationOpened", AlarmListenr);

    asyncStorageHelper
      .getInfos()
      .then(() => {
        if (__DEV__) console.info("todo:rhj--------------begin init app");
        GLOBAL.server_ip = GLOBAL.server_mode === 0 ? GLOBAL.cloud_server_ip : GLOBAL.lan_server_ip;
        GLOBAL.alarmNotifDataDef.play_sound =
          GLOBAL.curWarningPlaySoundEnabled === 0 ? true : false;
        // UTILS.showToast(GLOBAL.lan_server_ip);
        httpHelper.setServerURL(GLOBAL.server_ip);
        BluetoothChat.componentDidMount();
        // if (GLOBAL.bluetoothServer) {

        // }
        this.initApp();
      })
      .catch(e => this.initApp());
  }

  // 이벤트 해제
  componentWillUnmount() {
    this._wakeful && this._wakeful.release();
    // if (GLOBAL.curDevice.type === 1) careSensHelper.stopOtgDevice();

    this.exitApp = false;
    // NetInfo.removeEventListener()
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);

    DeviceEventEmitter.removeListener("OnNotificationDismissed", e => { });
    DeviceEventEmitter.removeListener("OnNotificationOpened", e => { });

    BackgroundJob.deleteAll();
    this.dataListener && this.dataListener.remove();
  }
  private onBluetoothStateChange(e) {
    if (__DEV__) console.info('BluetoothStateChange:', e);
    if (e.state === 3) {
      GLOBAL.BluetoothConnState = true;
      store.dispatch(connectedBluetoothServer(true));
      playSampleSound(GLOBAL.alarmSounds[5]);
      if (!GLOBAL.token && GLOBAL.isSignin) {
        const logParam: any = {};
        logParam.username = GLOBAL.curUser.nick;
        logParam.password = GLOBAL.curUser.password;
        const sdParam: any = {};
        sdParam.action = 'login';
        sdParam.params = JSON.stringify(logParam);
        BluetoothChat.writeString(JSON.stringify(sdParam));
      } else if (GLOBAL.token && GLOBAL.isSignin) {
        store.dispatch(setSyncWait(false));
        /// SYNC_HELPER.dataSyncProc();
      }
    } else {
      if (store.getState().blueServerConn.syncStatus && GLOBAL.usingBluetoothServer) {
        // BluetoothChat.connect(GLOBAL.bluetoothServer, false);
      }
      /// GLOBAL.BluetoothConnState = false;
      store.dispatch(connectedBluetoothServer(false));
    }
  }
  private onBTSynData(param) {
    const st = store.getState();
    if (__DEV__) console.info('onBTSynData Store:', st);
    if (store.getState().blueServerConn.syncStatus) {
      try {
        const res = JSON.parse(param.data);
        if (!GLOBAL.token) {
          if (res.success) {
            GLOBAL.token = res.token;
            GLOBAL.isSignin = true;
          }
        } else {
          AppSync.responseSynData(res).then(() => {
            // UTILS.showToast("Blue Tooth Connect!");
            AppSync.resetData = false;
            AppSync.lastSyncTime = AppSync.nwLastSynTime;
            if (__DEV__) console.info('end Bluetooth sync -------------------<<<< ' + AppSync.lastSyncTime);
            EventRegister.emit(GLOBAL.sync_success, 'The synctronization is completed !!!');
            playSampleSound(GLOBAL.alarmSounds[6]);
            Vibration.vibrate(5000);
            /// BluetoothChat.setBluetoothEnable(false);
            //// BluetoothChat.stopConnection();
            store.dispatch(setSyncWait(false));
          }).catch(() => {
            store.dispatch(setSyncWait(false));
          });
        }
      } catch (error) {
        GLOBAL.token = undefined;
        store.dispatch(connectedBluetoothServer(false));
        /* console.log(param.data);
        console.log('end Bluetooth sync Error-----------<<<< ' + AppSync.lastSyncTime); */
        EventRegister.emit(GLOBAL.sync_data_error, 'The synctronization is completed !!!');
        store.dispatch(setSyncWait(false));
      }
      //// console.log(param);
    } else {
      try {
        const res = JSON.parse(param.data);
        if (!GLOBAL.token && GLOBAL.isSignin) {
          if (res.success) {
            GLOBAL.token = res.token;
            GLOBAL.isSignin = true;
            return;
          }
        }
      } catch (error) {
        GLOBAL.token = undefined;
        store.dispatch(connectedBluetoothServer(false));
      }
      //// store.dispatch(setSyncWait(true));
      /// console.log(store.getState());
    }
    // console.log(store.getState());
    // if(store.getState())
    //// console.log(param);
  }
  async checkStatus() {
    const status = await BackgroundTask.statusAsync();

    if (status.available) {
      // Everything's fine
      return;
    }

    const reason = status.unavailableReason;
    if (reason === BackgroundTask.UNAVAILABLE_DENIED) {
      Alert.alert("Denied", 'Please enable background "Background App Refresh" for this app');
    } else if (reason === BackgroundTask.UNAVAILABLE_RESTRICTED) {
      Alert.alert("Restricted", "Background tasks are restricted on your device");
    }
  }
  initApp = () => {
    // if (GLOBAL.curDevice.type === 1) careSensHelper.downloadLastOTG();

    // background task
    /* const interval = GLOBAL.TASK_CHECK_INTERVAL_VALUES[GLOBAL.curTaskCheckIntervalIdx];
    if (interval > 0) {
      BackgroundTask.cancel();
      BackgroundTask.schedule({
        period: 60 * interval // Aim to run every 30 mins - more conservative on battery
      });
    } else {
      BackgroundTask.cancel();
    }
 */
    // Optional: Check if the device is blocking background tasks or not
    this.checkStatus();

    // push reset alarm
    const alarmId = GLOBAL.AlarmKey_ResetApp;
    const alarmData = { ...GLOBAL.alarmNotifDataDef };
    alarmData.id = alarmId;
    alarmData.vibrate = false;
    alarmData.vibration = 0;
    alarmData.play_sound = false;
    alarmData.auto_cancel = false;

    alarmData.message = `点击后修复程序`;
    // alarmData.fire_date = ReactNativeAN.parseDate(new Date(Date.now()));
    alarmData.schedule_once = true;
    ReactNativeAN.deleteAlarm(alarmData.id);
    !GLOBAL.DEBUG && ReactNativeAN.sendNotification(alarmData);

    BackgroundJob.isAppIgnoringBatteryOptimization((error, ignoringOptimization) => {
      if (ignoringOptimization === true) {
      } else {
        // 드롭존에서 앱 해제할것을 요구...
        // Dispay a toast or alert to user indicating that the app needs to be removed from battery optimization list, for the job to get fired regularly
        const alarmId = GLOBAL.AlarmKey_OpenBatterySetting;
        // make alarm
        const alarmData = { ...GLOBAL.alarmNotifDataDef };
        alarmData.id = alarmId;
        alarmData.message = `为了确保应用程序正常运行，请从电池优化菜单中手动删除此应用,允许后台运行`;
        alarmData.fire_date = ReactNativeAN.parseDate(new Date(Date.now()));
        alarmData.vibrate = false;
        alarmData.vibration = 0;
        alarmData.play_sound = false;
        alarmData.auto_cancel = false;

        ReactNativeAN.deleteAlarm(alarmData.id);

        !GLOBAL.DEBUG && ReactNativeAN.sendNotification(alarmData);
        //          ReactNativeAN.scheduleAlarm(alarmData);
      }
    });

    this.setState({ isReady: true });

    const PowerManager = NativeModules.RNPowermanager;
    /*
    if (PowerManager.isSupported) {
      console.log("************* PowerManager is surpported");
      PowerManager.startPowerManager();
      return;
    }

    return;
*/
    PowerManager.isIgnoringBatteryOptimizations().then(result => {
      if (!result) {
        if (__DEV__) console.info("************* PowerManager isIgnoringBatteryOptimiz is False");
        // TASK 2: Check Battery Optimazation Permission

        IntentLauncher.startActivity({
          action: "android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
          data: "package:com.daleapp"
        });
        /*
    PermissionsAndroid.check("android.permission.ACCESS_COARSE_LOCATION").then(granted => {
      //
    });
  */
      }
    });
  };
  // 이벤트 동작
  handleConnectivityChange = isConnected => {

    GLOBAL.isOffline = !isConnected;
    // UTILS.showToast("network connection changed:" + isConnected);
    if (GLOBAL.usingBluetoothServer) return;
    if (!GLOBAL.isOffline && GLOBAL.curUser.nick) {
      const formdata = new FormData();
      formdata.append("nick", GLOBAL.curUser.nick);
      formdata.append("password", GLOBAL.curUser.password);

      // cloud mode
      GLOBAL.server_mode === 0 && formdata.append("hospital_id", GLOBAL.hospital_num);

      httpHelper.signIn(formdata)
        .then(response => {
          const responseJson = response as ResponseSignModel;
          if (responseJson.success == true) {
            if (__DEV__) console.info('SignIn Result:', responseJson);
            GLOBAL.token = responseJson.token;
            AppSync.synchronize(false);

          }
        })
        .catch(error => { });
    }
    // console.log("network connection changed:" + isConnected);
  };
  handleBackButton = () => {
    if (!this._isRootScreen) return false;

    // 2000(2초) 안에 back 버튼을 한번 더 클릭 할 경우 앱 종료
    if (this.exitApp == undefined || !this.exitApp) {
      UTILS.showToast("再按一次退出");
      this.exitApp = true;

      this.timeout = setTimeout(
        () => {
          this.exitApp = false;
        },
        2000 // 2초
      );
    } else {
      clearTimeout(this.timeout);

      BackHandler.exitApp(); // 앱 종료
    }
    return true;
  };
  private onTransitionTrackError = (error: any): void => {
    console.warn("Analytics error: ", error.message);
  };

  private onNavigationStateChange = (prevState: NavigationState, currentState: NavigationState) => {
    const prevStateName: string = getCurrentStateName(prevState);
    const currentStateName: string = getCurrentStateName(currentState);

    const isRoot = getCurrentStateParam(currentState);
    if (isRoot != undefined) {
      this._isRootScreen = isRoot.root ? true : false;
    } else this._isRootScreen = false;

    if (prevStateName !== currentStateName) {
      trackScreenTransition(currentStateName).catch(this.onTransitionTrackError);
    }
  };

  private onSwitchTheme = (theme: ThemeKey) => {
    ThemeStore.setTheme(theme).then(() => {
      this.setState({ theme });
    });
  };

  public render(): React.ReactNode {
    const contextValue: ThemeContextType = {
      currentTheme: this.state.theme,
      toggleTheme: this.onSwitchTheme
    };

    return (
      <ApplicationLoader assets={assets}>
        <Provider store={store}>
          <MenuProvider>
            <ThemeContext.Provider value={contextValue}>
              <ApplicationProvider mapping={mapping} theme={themes[this.state.theme]}>
                <DynamicStatusBar currentTheme={this.state.theme} />
                {this.state.isReady && (
                  <Router
                    ref={navigatorRef => {
                      NavigationService.setTopLevelNavigator(navigatorRef);
                    }}
                    onNavigationStateChange={this.onNavigationStateChange}
                  />
                )}
              </ApplicationProvider>
            </ThemeContext.Provider>
          </MenuProvider>
        </Provider>
      </ApplicationLoader>
    );
  }
}
