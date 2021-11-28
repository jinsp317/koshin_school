import Strings from "@src/assets/strings";
import React from "react";
import { View, Text, EmitterSubscription, NativeModules, DeviceEventEmitter } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { SignInForm2Data } from "./signInForm2";
import { SignIn } from "./signIn.component";
import { httpHelper } from "@src/core/utils/httpHelper";
import AndroidOpenSettings from "react-native-android-open-settings";
import commonStyle from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";

import GLOBAL from "@src/core/globals";
import * as SYNC_HELPER from "@src/core/syncHelper";
import * as UTILS from "@src/core/app_utils";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import wifi from "react-native-android-wifi";
import { VersionInfoModel } from "@src/core/model/versionInfo.model";
import { PointModel } from "@src/core/model/point.model";
import Modal from "react-native-modal";
import { UpdateVersionModal } from "@src/components/common";
import DeviceInfo from "react-native-device-info";
import { AppSync } from "@src/core/appSync";
import BackgroundJob from "react-native-background-job";
import { database } from "@src/core/utils/database";
import { connect } from 'react-redux';
import { UserModel, Http_Error } from '@src/core/model';
import Wakeful from "react-native-wakeful";
import { ResponseSignModel, ResponseModel } from "@src/core/model/responses.model";
import { EventRegister } from "react-native-event-listeners";
class btParams {
  action: string;
  token?: string;
  params?: string;
  records?: string;
  timestamp?: string;
}
enum LoginStatus { Login, Users, Points, Departments, DataSync }
/*
bluetooth server에 대한 로그인 모듈을 새로 구성한다.
1. login
*/
const BluetoothChat = NativeModules.BluetoothIOModule;
const { EventOnDataRx, EventOnStateChange, EventOnBluetoothStateChange } = BluetoothChat.getConstants();

interface State {
  isLoading: boolean;
  isModalVisible: boolean;
  versionInfo: VersionInfoModel;
  showLoadingMsg: boolean;
  usingBluetoothServer: boolean;
  signMode: number;
  users: UserModel[];
}


interface RdProps {
  connected: boolean;
}
export type RdxProps = NavigationScreenProps & RdProps;
export class SignInScreenO extends React.Component<RdxProps, State> {
  private _defFormData;
  private _autoLogin: boolean;
  private _showUserInfo: boolean;
  private _signinMode: number;
  private _LoginStatus: LoginStatus;
  private _userParam: SignInForm2Data;
  private dataListener: EmitterSubscription;
  private _timeStamp: string;
  constructor(props: RdxProps) {
    super(props);
    GLOBAL.versionInfo.name = DeviceInfo.getVersion();
    GLOBAL.versionInfo.number = Number(DeviceInfo.getBuildNumber());
    this._signinMode = GLOBAL.signInMode;
    this.state = {
      isLoading: true,
      isModalVisible: false,
      versionInfo: GLOBAL.versionInfo,
      showLoadingMsg: false,
      usingBluetoothServer: GLOBAL.usingBluetoothServer,
      signMode: this._signinMode,
      users: []
    };
    this._autoLogin = false;
    this._showUserInfo = false;
  }
  componentWillMount() {
    // console.log("todo:rhj--------------begin sigin componentWillMount");
    if (GLOBAL.switchUser) {
      if (__DEV__) console.info("GLOBAL.switchUser = true");
      // 어카운트 절환
      const savedUser = UTILS.getSavedUser(GLOBAL.switchUser.id);
      if (savedUser) {
        // 등록한적이 있는 절환 어카운트
        GLOBAL.curUser.id = savedUser.id;
        GLOBAL.curUser.nick = savedUser.nick;
        GLOBAL.curUser.password = savedUser.password;

        this._autoLogin = true;
      } else {
        if (__DEV__) console.info("GLOBAL.switchUser = false");
        // 등록한적이 없는 절환 어카운트
        GLOBAL.curUser.id = GLOBAL.switchUser.id;
        GLOBAL.curUser.nick = GLOBAL.switchUser.nick;
        GLOBAL.curUser.password = undefined;
        this._autoLogin = false;
      }
    } else {
      // console.log("표준 로그인");
      // 표준 로그인
      if (GLOBAL.isSaveInfo && !GLOBAL.isSignOut) this._autoLogin = true;
    }

    if (GLOBAL.isSaveInfo || GLOBAL.isSignOut || GLOBAL.switchUser) this._showUserInfo = true;
    if (GLOBAL.isOtherLogin) {
      this._autoLogin = false;
      this._showUserInfo = false;
    }
    this._defFormData = {
      username: GLOBAL.curUser.nick,
      password: GLOBAL.curUser.password
    };
  }
  componentDidMount() {
    this.setState({ isLoading: false });
    this.dataListener = DeviceEventEmitter.addListener(EventOnDataRx, (e) => this.btDataRead(e));
    if (this._autoLogin && GLOBAL.curUser.nick) {
      this.onSignInPress(this._defFormData);
    }
    if (this._signinMode == 0) {
      // asyncStorageHelper.getConfigInfos().then(() => {
      database.patientsHelper.getUsers(GLOBAL.hospital_num).then(users => {
        this.setState({ signMode: 1, users: users });
      });
      // });
    }
    EventRegister.addEventListener(GLOBAL.sync_connect_error, () => {
      UTILS.showToast(Strings.message.warning_wifi_bad);
      this.setState({ isLoading: false });
    });
    EventRegister.addEventListener(GLOBAL.sync_data_error, () => {
      UTILS.showToast(Strings.message.error_refreshFaild);
      this.setState({ isLoading: false });
    });
    EventRegister.addEventListener(GLOBAL.sync_success, () => {
      if (GLOBAL.isSignin) {
        GLOBAL.startBackgroundJobs();
        const needDailyTest = true;
        this.props.navigation.navigate(needDailyTest ? "Task MonitorLog" : "MainNavigator");
      }
    });
  }
  componentWillUnmount() {
    this.dataListener && this.dataListener.remove();
    EventRegister.removeAllListeners();
  }
  private onSignInPress = (data: SignInForm2Data) => {
    GLOBAL.isSignOut = false;
    GLOBAL.isSignin = false;
    GLOBAL.isOtherLogin = false;
    GLOBAL.switchUser = undefined;
    if (!AppSync.hasFullSynchronized && (GLOBAL.isOffline || (GLOBAL.usingBluetoothServer && !this.state.usingBluetoothServer))) {
      UTILS.showToast(Strings.message.connectServer_fail);
      return;
    }
    database.memberHelper.getMember(data.username).then(user => {
      if (user != null) { /// 기타 가입
        if (this.state.usingBluetoothServer) { /// 블루트스련결부분
          if (this.props.connected) {
            this.loginBluetooth(data);
          } else {
            this.loginOffline(data);
          }
          return;
        }
        if (GLOBAL.isOffline) { /// offline 련결
          this.loginOffline(data);
        } else { /// online 련결
          this.loginOnline(data);
        }
      } else { /// 첫가입에 처리 
        if (this.state.usingBluetoothServer) {
          if (this.props.connected) {
            AppSync.lastSyncTime = '0000-00-00 00:00:00';
            this.loginBluetooth(data);
          } else {
            UTILS.showToast(Strings.message.connectServer_fail);
            // this.loginOffline(data);
          }
          return;
        }
        if (GLOBAL.isOffline) {
          // this.loginOffline(data);
          if (AppSync.hasFullSynchronized) {
            UTILS.showToast(Strings.message.login_account_error);
          } else {
            UTILS.showToast(Strings.message.login_no_network);
          }

        } else {
          AppSync.lastSyncTime = '0000-00-00 00:00:00';
          AppSync.lastServerTime = '0000-00-00 00:00:00';
          GLOBAL.token = undefined;
          AppSync.hasFullSynchronized = false;
          this.loginOnline(data);
        }
      }
    }).catch(_er => {

    });

  };
  private loginBluetooth = (data) => {

    const formdata = new btParams();
    formdata.action = 'login';
    formdata.params = JSON.stringify(data);
    BluetoothChat.writeString(JSON.stringify(formdata));
    this._userParam = data;
    this._LoginStatus = LoginStatus.Login;
  }
  private btGetUsers = (token: string) => {
    this._LoginStatus = LoginStatus.Users;
    const formdata = new btParams();
    formdata.action = 'user/friends';
    formdata.token = token;
    BluetoothChat.writeString(JSON.stringify(formdata));
  }
  private beGetPoints = (token: string) => {
    this._LoginStatus = LoginStatus.Points;
    const formdata = new btParams();
    formdata.action = 'point';
    formdata.token = token;
    BluetoothChat.writeString(JSON.stringify(formdata));
  }
  private beGetDepartments = (token: string) => {
    this._LoginStatus = LoginStatus.Departments;
    const formdata = new btParams();
    formdata.action = 'department';
    formdata.token = token;
    BluetoothChat.writeString(JSON.stringify(formdata));
  }
  private btRequestSync = async (token: string) => {
    this.setState({ showLoadingMsg: true });

    const upData = await AppSync.uploadReqeustData(AppSync.lastSyncTime);
    this._timeStamp = UTILS.getFormattedDate(undefined, 1);
    const formData = new btParams();
    formData.action = 'records/synchronizeNw';
    // formData.records = upData;
    formData.records = JSON.stringify(upData);
    formData.timestamp = AppSync.lastSyncTime;
    formData.token = token;
    BluetoothChat.writeString(JSON.stringify(formData));
    this._LoginStatus = LoginStatus.DataSync;
  }
  private btDataRead = (params) => {
    if (this._LoginStatus === LoginStatus.Login) {
      if (params.data === 'request wrong') {
        UTILS.showToast(Strings.message.error_userNamePassword);
        this.setState({ isLoading: false });
        return;
      } else if (params.data === 'server error') {
        UTILS.showToast(Strings.message.connectServer_fail);
        this.setState({ isLoading: false });
        return;
      } else {
        this.setState({ isLoading: true });
        try {
          const res = JSON.parse(params.data);
          if (res.success) {
            GLOBAL.token = res.token;
            GLOBAL.curUser.nick = this._userParam.username;
            GLOBAL.curUser.password = this._userParam.password;
            GLOBAL.isSignin = true;
            this.btGetUsers(GLOBAL.token);
          } else {
            UTILS.showToast(Strings.message.error_userNamePassword);
            this.setState({ isLoading: false });
            return;
          }
        } catch (error) {
          UTILS.showToast(Strings.message.connectServer_fail);
          this.setState({ isLoading: false });
          return;
        }

      }
    } else if (this._LoginStatus === LoginStatus.Users) {
      if (params.data === 'server error') {
        UTILS.showToast(Strings.message.connectServer_fail);
        this.setState({ isLoading: false });
        return;
      }
      // console.log(params.data);
      try {
        const res = JSON.parse(params.data);
        if (res.success === true) {
          SYNC_HELPER.setGlobalUsers(res.result);
          this.beGetPoints(GLOBAL.token);
        } else {
          this.setState({ isLoading: false });
        }
      } catch (error) {
        UTILS.showToast(Strings.message.connectServer_fail);
        this.setState({ isLoading: false });
        return;
      }



    } else if (this._LoginStatus === LoginStatus.Points) {
      if (params.data === 'server error') {
        UTILS.showToast(Strings.message.connectServer_fail);
        this.setState({ isLoading: false });
        return;
      }
      try {
        const res = JSON.parse(params.data);
        if (res.success) {
          const points: PointModel[] = res.result;
          this.beGetDepartments(GLOBAL.token);
          SYNC_HELPER.setGlobalPoints(points);
        } else {
          this.setState({ isLoading: false });
        }
      } catch (error) {
        UTILS.showToast(Strings.message.connectServer_fail);
        this.setState({ isLoading: false });
        return;
      }
    } else if (this._LoginStatus === LoginStatus.Departments) {
      if (params.data === 'server error') {
        UTILS.showToast(Strings.message.connectServer_fail);
        this.setState({ isLoading: false });
        return;
      }
      try {
        const res = JSON.parse(params.data);
        if (res.success) {
          SYNC_HELPER.setGlobalDepartments(res.result);
          this.btRequestSync(GLOBAL.token);
        } else {
          this.setState({ isLoading: false });
        }
      } catch (error) {
        UTILS.showToast(Strings.message.connectServer_fail);
        this.setState({ isLoading: false });
        return;
      }
    } else if (this._LoginStatus === LoginStatus.DataSync) {
      if (params.data === 'server error') {
        UTILS.showToast(Strings.message.connectServer_fail);
        this.setState({ isLoading: false });
        return;
      }
      try {
        const res = JSON.parse(params.data);
        this.setState({ showLoadingMsg: true });
        if (res.success) {
          // UTILS.showToast("Blue Tooth Connect!");
          AppSync.lastSyncTime = this._timeStamp;
          UTILS.updateSavedUsers();
          asyncStorageHelper.setUserInfos();
          asyncStorageHelper.setServerData();
          AppSync.responseSynData(res).then(() => {
            let needDailyTest = false;
            const last_moniotr_time = GLOBAL.curTestQuality.time;
            const current_setting_time = UTILS.conv2TodayTimeString(GLOBAL.curDailyTest.time);
            if (!GLOBAL.curDailyTest.disabled) {
              if (last_moniotr_time) {
                // 오늘 최근측정값이 매일검사설정의 시간보다 앞선 경우
                if (UTILS.isFutureTime(last_moniotr_time, current_setting_time, false)) {
                  needDailyTest = true;
                } else if (
                  GLOBAL.curDailyTest.target_kind === 1 &&
                  GLOBAL.curTestQuality.result_type != 1
                ) {
                  // 검사가 통과되였을때만  통과하도록 설정 && 성공이 아니면
                  needDailyTest = true;
                }
              } else needDailyTest = true; // 측정리력이 없는 경우
            }
            if (!needDailyTest) UTILS.showToast(Strings.message.info_loginSuccess);
            /// BluetoothChat.stopConnection();
            GLOBAL.startBackgroundJobs();
            let xpath = needDailyTest ? "Task MonitorLog" : "MainNavigator";

            if (GLOBAL.curUser) {
              database.getUserPath({ id: GLOBAL.curUser.id }).then((rpath) => {
                xpath = rpath ? rpath : xpath;
                database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
                this.props.navigation.navigate(xpath);
              });
            }
          }).catch(() => {
            UTILS.showToast("初始化异常");
            if (GLOBAL.curUser.id) {
              database.getUserPath({ id: GLOBAL.curUser.id }).then((rpath) => {
                const xpath = rpath ? rpath : "MainNavigator";
                if (GLOBAL.curUser) {
                  database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
                }
                this.props.navigation.navigate(xpath);
              })
            } else {
              const xpath = "MainNavigator";
              if (GLOBAL.curUser) {
                database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
              }
              this.props.navigation.navigate(xpath);
            }


          });
        } else {
          this.setState({ isLoading: false });
        }
      } catch (error) {
        UTILS.showToast(Strings.message.connectServer_fail);
        this.setState({ isLoading: false });
        return;
      }
    }
  }
  private loginOffline = (data: SignInForm2Data) => {
    let flagOk = false;
    // UTILS.updateSavedUsers();
    if (__DEV__) {
      console.info(GLOBAL.myUsers);
      console.info(GLOBAL.curUser);
    }

    if (data.username === GLOBAL.curUser.nick && data.password == GLOBAL.curUser.password) {
      flagOk = true;
      if (__DEV__) console.info(GLOBAL.curHospitalId);
      GLOBAL.myUsers.forEach(e => {
        if (e.nick === GLOBAL.curUser.nick) {
          GLOBAL.curUser.hospital_id = e.hospital_id;
          GLOBAL.curUser.id = e.id;
          GLOBAL.curUser.name = e.name;
          GLOBAL.curUser.job_position_type = e.job_position_type;
          GLOBAL.curHospitalId = GLOBAL.curUser.hospital_id;

          if (__DEV__) console.info("GLOBAL.curHospitalId=", GLOBAL.curHospitalId);
        }
      });
      GLOBAL.isSignin = true;
      GLOBAL.startBackgroundJobs();

      /*
      database.getReleatedDepartments(GLOBAL.curUser.id).then(result => {
        GLOBAL.curUser.relatedDepartments = result;
      });
      */

    }
    if (__DEV__) console.info(flagOk);
    if (!flagOk) {
      UTILS.showToast(Strings.message.error_userNamePassword);
      return;
    }
    UTILS.showToast(Strings.message.login_offline_signin);
    GLOBAL.curRouteName = "Task Glucose";
    database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
      GLOBAL.curHospital = _hItem;
    });
    asyncStorageHelper.getCashData()
      .then(result => {
        database.getUserPath({ id: GLOBAL.curUser.id }).then((rpath) => {
          const xpath = rpath ? rpath : "MainNavigator";
          GLOBAL.curRouteName = xpath;
          if (GLOBAL.curUser) {
            database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
          }
          this.props.navigation.navigate(xpath);
        });

      })
      .catch(e => {
        UTILS.showToast(Strings.message.connectServer_fail);
        // this.props.navigation.navigate("MainNavigator");
      });
  };
  private loginOnline = (data: SignInForm2Data) => {
    this.setState({ isLoading: true });
    const formdata = new FormData();
    formdata.append("nick", data.username);
    formdata.append("password", data.password);

    // cloud mode
    GLOBAL.server_mode === 0 && formdata.append("hospital_id", GLOBAL.hospital_num);

    httpHelper.signIn(formdata)
      .then(response => {
        const responseJson = response as ResponseSignModel;
        if (responseJson.success == true) {
          // console.log(responseJson);
          GLOBAL.token = responseJson.token;
          GLOBAL.curUser.nick = data.username;
          // if (GLOBAL.isSaveInfo) {
          GLOBAL.curUser.password = data.password;        

          GLOBAL.isSignin = true;
          if (__DEV__) console.info(GLOBAL.versionInfo);
          GLOBAL.versionUp = false;
          if (GLOBAL.versionInfo.number < responseJson.version) {
            GLOBAL.newVersion = responseJson.version;
            GLOBAL.versionUp = true;
          }
          // GLOBAL.curUser.job_position_id = data.job_position_id;
          // GLOBAL.curUser.is_admin = data.is_admin;
          // }

          this.initAppOnline();
          // this.setState({ isLoading: false });
        } else {
          GLOBAL.token = undefined;
          if (responseJson.error == "nick") UTILS.showToast(Strings.message.login_account_error);
          else if (responseJson.error == "password") {
            UTILS.showToast(Strings.message.login_account_error);
          } else if (responseJson.error == "is_valid") {
            UTILS.showToast(Strings.message.login_account_error);
          } else UTILS.showToast(Strings.message.error_unkown + responseJson.message);
          this.setState({ isLoading: false });
        }
      })
      .catch(error => {
        if (__DEV__) console.log(error);
        if (error == Http_Error.Server_Error) {
          UTILS.showToast(Strings.message.connectServer_fail);
        }
        else if (error == Http_Error.Authority_Error) {
          UTILS.showToast(Strings.message.error_userPassword);
        }
        else if (error == Http_Error.Authority_Invalid_User_Error) {
          UTILS.showToast(Strings.message.login_account_error);
        }
        else {
          UTILS.showToast(Strings.message.login_server_expired);
        }
        this.setState({ isLoading: false });
      });
  };
  private onForgotPasswordPress = () => {
    const xpath = "Forgot Password";
    // if (GLOBAL.curUser) {
    //   database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    // }
    this.props.navigation.navigate(xpath);
  };
  private onConfigPress = () => {
    const xpath = "Set AppInfo";
    // if (GLOBAL.curUser) {
    //   database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    // }
    this.props.navigation.navigate(xpath);
  };
  private onBlueToothPress = () => {
    const xpath = "Set BlueTooth";
    // if (GLOBAL.curUser) {
    //   database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    // }
    this.props.navigation.navigate(xpath);
  };
  private onSetWifiPress = () => {
    AndroidOpenSettings.wifiSettings();
    // this.props.navigation.navigate('Set Wifi');
  };
  private onSetBluetoothPress = () => {
    AndroidOpenSettings.bluetoothSettings();
  }
  private onSaveInfoChanged = (isSave: boolean) => {
    GLOBAL.isSaveInfo = isSave;
    asyncStorageHelper.setUserInfos();
  };
  private onSaveUsingBluetoothSever = (isUsing: boolean) => {
    this.setState({ usingBluetoothServer: isUsing });
    GLOBAL.usingBluetoothServer = isUsing;
  }

  private onCheckVersionPress = () => {
    httpHelper
      .downloadVersionInfo()
      .then(response => {
        const versionInfos: VersionInfoModel[] = response.result;
        if (versionInfos.length > 0) {
          const versionInfo = versionInfos.pop();
          if (versionInfo.number > GLOBAL.versionInfo.number) {
            GLOBAL.newVersion = versionInfo.number.toString();
            this.setState({ versionInfo, isModalVisible: true });
          } else {
            UTILS.showToast(Strings.message.version_noUpdate);
          }
        }
      })
      .catch(e => {
        UTILS.showToast(Strings.common.str_opFailed);
      });
  };

  private initAppOnline = async () => {
    try {
      await SYNC_HELPER.setGlobalInfo();
      // for set current user info


      //
      UTILS.updateSavedUsers();
      asyncStorageHelper.setUserInfos();
      asyncStorageHelper.setServerData();

      // check wifi state
      // wifi.getCurrentSignalStrength(level => {
      //   if (__DEV__) console.info("------- wifi strength " + level);
      //   const isOK = level > GLOBAL.wifiStopDbm ? true : false;
      //   if (!isOK) {
      //     // UTILS.showToast(Strings.message.warning_current_wifi_bad, ToastAndroid.LONG);
      //   }
      // });

      // for first check current task and warning from server
      // SYNC_HELPER.monitorMyTask("first key");
      // 자료동기화 스레드



      // 혈탕계검사 첵크

      let needDailyTest = false;
      const now = UTILS.getFormattedDate(undefined, 1);
      const last_moniotr_time = GLOBAL.curTestQuality.time;
      const current_setting_time = UTILS.conv2TodayTimeString(GLOBAL.curDailyTest.time);

      if (!GLOBAL.curDailyTest.disabled) {
        if (UTILS.isFutureTime(current_setting_time, now, false)) {
          // 매일검사설정에서 설정한 시간이 지난 경우만

          // 측정값이 있는 경우
          if (last_moniotr_time) {
            // 오늘 최근측정값이 매일검사설정의 시간보다 앞선 경우
            if (UTILS.isFutureTime(last_moniotr_time, current_setting_time, false)) {
              needDailyTest = true;
            } else if (
              GLOBAL.curDailyTest.target_kind === 1 &&
              GLOBAL.curTestQuality.result_type != 1
            ) {
              // 검사가 통과되였을때만  통과하도록 설정 && 성공이 아니면
              needDailyTest = true;
            }
          } else needDailyTest = true; // 측정리력이 없는 경우
        }
      }
      if (!needDailyTest) UTILS.showToast(Strings.message.info_loginSuccess);

      if (GLOBAL.DEBUG) needDailyTest = false;
      needDailyTest = true;
      if (!AppSync.hasFullSynchronized && !GLOBAL.isOffline) {
        this.setState({ showLoadingMsg: true });
        AppSync.synchronize(false);
      } else {
        GLOBAL.startBackgroundJobs();
        if (__DEV__) console.info("then end sync in sign in");
        let xpath = needDailyTest ? "Task MonitorLog" : "MainNavigator";
        if (GLOBAL.curUser) {
          const rpath = await database.getUserPath({ id: GLOBAL.curUser.id });
          xpath = rpath && rpath != 'FirstNavigator' ? rpath : xpath;
          database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
          this.props.navigation.navigate(xpath);
          // database.getUserPath({ id: GLOBAL.curUser.id }).then(rpath => {
          //   xpath = rpath ? rpath : xpath;
          //   database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
          //   this.props.navigation.navigate(xpath);
          // });
        }
      }


      // this.props.navigation.navigate(needDailyTest ? "DailyTestHomeNavigator" : "MainNavigator");
      let xpath = needDailyTest ? "Task MonitorLog" : "MainNavigator";


      // needDailyTest = true;

    } catch {
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        GLOBAL.curHospital = _hItem;
      });
      e => {
        UTILS.showToast("初始化异常");
        let xpath = "MainNavigator";
        if (GLOBAL.curUser) {
          database.getUserPath({ id: GLOBAL.curUser.id }).then((rpath) => {
            xpath = rpath ? rpath : xpath;
            database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
            this.props.navigation.navigate(xpath);
          });
        }
      };
    }
  };
  public render(): React.ReactNode {
    // console.log(this.props.connected);
    return (this.state.isLoading && ((GLOBAL.usingBluetoothServer && this.props.connected)
      || (!GLOBAL.usingBluetoothServer))) ? (
        <View style={commonStyle.progressBar}>
          <ProgressBar />
          {this.state.showLoadingMsg && (
            <Text style={{ marginVertical: 10 }}>
              {Strings.message.info_syncIsCurrentlyInProgress}
            </Text>
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Modal
            isVisible={this.state.isModalVisible}
            onBackdropPress={() => this.setState({ isModalVisible: false })}
            onSwipeComplete={() => this.setState({ isModalVisible: false })}
            onBackButtonPress={() => this.setState({ isModalVisible: false })}
            swipeDirection="left"
          >
            <UpdateVersionModal versionInfo={this.state.versionInfo}
              onClose={() => this.setState({ isModalVisible: false })}
            />
          </Modal>
          <SignIn
            onSignInPress={this.onSignInPress}
            onCheckVersionPress={this.onCheckVersionPress}
            onForgotPasswordPress={this.onForgotPasswordPress}
            onConfigPress={this.onConfigPress}
            onBlueToothPress={this.onBlueToothPress}
            onSetWifiPress={this.onSetWifiPress}
            onSaveInfoChanged={this.onSaveInfoChanged}
            isSaveInfo={GLOBAL.isSaveInfo}
            users={this.state.users}
            signMode={this._signinMode}
            usingBluetoothServer={GLOBAL.usingBluetoothServer}
            bluetoothCommState={this.props.connected || GLOBAL.myUsers.length > 0}
            onSaveUsingBluetooth={this.onSaveUsingBluetoothSever}
            defFormData={this._showUserInfo ? this._defFormData : undefined}
          />
        </View>
      );
  }
}

const mapStateToProps = (state) => {
  return {
    connected: state.blueServerConn.connected
  }
}
export const SignInScreen = connect(mapStateToProps, null)(SignInScreenO);
