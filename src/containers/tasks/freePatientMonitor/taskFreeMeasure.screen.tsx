import Strings from "@src/assets/strings";
import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Alert,
  ToastAndroid,
  ActivityIndicator,
  BackHandler
} from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { TaskFreeMeasure } from "./taskFreeMeasure.component";

import RCTBaiDuOcrModule from "react-native-baidu-camera-ocr-scan";
import { IdentityInfo } from "../type";
import {
  FreePatientModel,
  FreePatientMeasureModel,
  FPMDataModel,
  MANAGE_KIND,
  MonitorModel
} from "@src/core/model";

import { database } from "@src/core/utils/database";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import { HistoryIconOutline, LogIconOutline } from "@src/assets/icons";
import * as UTILS from "@src/core/app_utils";
import { GlobalHelpButton, GlobalHelpModal } from "@src/components/common";
import Modal from "react-native-modal";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import BackgroundJob from "react-native-background-job";

interface State {
  isReady: boolean;
  isDataReady: boolean;
  uploadOk: boolean;
  pauseMeasure: boolean;
  needInit: boolean;
  errorDevice: boolean;
  isModalVisible: boolean;
  showGlobalHelpButton: boolean;
  tempMonitor: MonitorModel;
}

export class TaskFreeMeasureScreen extends React.Component<NavigationScreenProps, State> {
  private subscription: any;
  private focusListener: any;
  private blurListener: any;

  private identityInfo: IdentityInfo = new IdentityInfo();
  private _prevFPM: FPMDataModel;
  private _isFocus: boolean;

  constructor(props, ctx) {
    super(props, ctx);
    const that = this;
    this.subscription = null;
    this.state = {
      isReady: true,
      isDataReady: false,
      uploadOk: true,
      pauseMeasure: false,
      needInit: false,
      errorDevice: false,
      isModalVisible: false,
      showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0,
      tempMonitor: undefined
    };
  }
  // ** for use baidu ocr*/
  componentDidMount() {
    BackgroundJob.cancelAll();
    GLOBAL.curRouteName = this.props.navigation.state.routeName;
    asyncStorageHelper.setSessionInfos();
    if (__DEV__) console.info("fpm didmount");
    this.subscription = RCTBaiDuOcrModule.addListener();
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this._isFocus = true;
      this.setState({ showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0 });
      const errorDevice =
        GLOBAL.curDevice.type > 0 ? false : GLOBAL.curDevice.id == undefined ? true : false;
      this.setState({ errorDevice });
    });
    this.blurListener = this.props.navigation.addListener("didBlur", () => {
      this._isFocus = false;
      if (__DEV__) console.info("blur screen");
    });
  }
  componentWillUnmount() {
    if (__DEV__) console.info("fpm will unmount");
    this.subscription && this.subscription.remove();
    this.focusListener && this.focusListener.remove();
    this.blurListener && this.blurListener.remove();
    GLOBAL.startBackgroundJobs();
  }
  componentWillReceiveProps(nextProps: NavigationScreenProps) {
    if (__DEV__) console.info("fpm will ReceiveProps");
  }
  componentWillMount() {
    this.setNavigationParams();
  }

  private setNavigationParams() {
    const onRightPress = this.onActionbarRightPress;
    const onLeftPress = this.onActionbarLeftPress;
    this.props.navigation.setParams({
      onLeftPress,
      onRightPress,
      rightIcon: LogIconOutline
    });
  }
  private onActionbarRightPress = () => {

    const xpath = "Task FreeMeasureHistory";
    if (GLOBAL.curUser) {
      database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    }
    this.props.navigation.navigate(xpath);
  };
  private onActionbarLeftPress = () => {
    this.props.navigation.goBack();
  };
  private onFreePatientLog = (fpInfo: FreePatientModel) => {
    this.props.navigation.navigate("Task FreeMeasureHistory", {
      fpInfo: fpInfo
    });
  };
  private onGoBack2 = (dataIsReady: boolean) => {
    if (dataIsReady) {
      this.setState({
        isDataReady: dataIsReady,
        needInit: false
      });
    }
  };

  private onManualInput = () => {
    const route = "Monitor ManualInputA";

    this.props.navigation.navigate(route, {
      onGoBack: this.onGoBack
    });
  };
  private onGoBack = (monitor: MonitorModel) => {
    if (monitor) {
      this.setState({ tempMonitor: monitor });
    }
  };

  private procUploadFailed = (patient: FreePatientModel, data: FreePatientMeasureModel) => {
    // database.addFreePatientMeasure(patient, data).then(success => {
    //   console.log("add to database");
    //   GLOBAL.tobeUpdateUpload = true;
    // });
  };
  private onSavePress = (monitor: MonitorModel, wifiOK: boolean) => {
    // if (!this._isFocus) return;

    // this.setState({ isReady: true, pauseMeasure: true });
    const data: FreePatientMeasureModel = {};

    const patient: FreePatientModel = { ...GLOBAL.curFreePatient };
    data.value = monitor.value;
    data.time = GLOBAL.p_measureTime;
    data.point = GLOBAL.p_timeMark;
    data.pressure_low = GLOBAL.p_pressure_low;
    data.pressure_high = GLOBAL.p_pressure_high;
    data.temperature = GLOBAL.p_temperatrue;

    const formData = new FormData();
    if (data.value) formData.append("value", data.value);
    if (data.time) formData.append("time", data.time);
    if (data.point >= 0) formData.append("point", data.point);
    if (data.temperature) formData.append("temperature", data.temperature);
    if (data.pressure_low) formData.append("pressure_low", data.pressure_low);
    if (data.pressure_high) formData.append("pressure_high", data.pressure_high);
    if (patient.name) formData.append("name", patient.name);
    if (patient.cert_num) formData.append("cert_num", patient.cert_num);
    if (patient.cert_kind >= 0) formData.append("cert_kind", patient.cert_kind);
    if (patient.gender >= 0) formData.append("gender", patient.gender);
    if (patient.address) formData.append("address", patient.address);
    /*
    if (!wifiOK) {
      this.procUploadFailed(patient, data);
      this.setState({
        pauseMeasure: false,
        needInit: true,
        isReady: true,
        tempMonitor: undefined
      });
      UTILS.showToast(Strings.message.warning_wifi_bad);
      return;
    }


 */
    // const dataHelper = GLOBAL.isOffline ? database.freeMeasuresHelper : httpHelper;
    const dataHelper = database.freeMeasuresHelper;
    dataHelper
      .manageFreePatientMeasure(formData, MANAGE_KIND.ADD)
      .then(response => {
        if (response.success) {
          GLOBAL.curFreePatient.name = undefined;
          GLOBAL.curFreePatient.cert_kind = 0;
          GLOBAL.curFreePatient.cert_num = undefined;
          GLOBAL.curFreePatient.address = undefined;

          GLOBAL.p_pressure_low = 0;
          GLOBAL.p_pressure_high = 0;
          GLOBAL.p_temperatrue = 0;

          this.setState({
            pauseMeasure: false,
            needInit: true,
            isReady: true,
            tempMonitor: undefined
          });

          const msg = GLOBAL.isOffline
            ? Strings.message.warning_current_wifi_bad
            : Strings.message.dataUpload_success;
          UTILS.showToast(msg);
        } else {
          // this.procUploadFailed(patient, data);
          this.setState({
            pauseMeasure: false,
            needInit: true,
            isReady: true,
            tempMonitor: undefined
          });
          UTILS.showToast(Strings.message.dataUpload_fail);
        }
      })
      .catch(ex => {
        // this.procUploadFailed(patient, data);
        this.setState({
          pauseMeasure: false,
          needInit: true,
          isReady: true,
          tempMonitor: undefined
        });
        UTILS.showToast(Strings.message.connectServer_fail);
      });
  };
  private onProcNeedInit = (needInit: boolean) => {
    this.setState({ needInit });
  };
  private onCameraPress = () => {
    const isReady = false;
    this.setState({ isReady });

    RCTBaiDuOcrModule.init(GLOBAL.baiduOcrKey1, GLOBAL.baiduOcrKey2, (data: number) => {
      if (data == 0) {
        this.setState({ isReady: true });

        RCTBaiDuOcrModule.ocr("CARD_FRONT", data => {
          if (data.error == 0) {
            if (data.type == "CARD_FRONT") {
              this.setState({ isReady: true });
              GLOBAL.curFreePatient.name = data.name;
              GLOBAL.curFreePatient.address = data.address;
              GLOBAL.curFreePatient.cert_num = data.num;
              GLOBAL.curFreePatient.gender = data.sex == "男" ? 0 : 1;
              GLOBAL.curFreePatient.birthday = data.birthday;

              this.props.navigation.navigate("Task GetIdentityInfo", {
                identityInfo: this.identityInfo,
                onGoBack: this.onGoBack2
              });
            } else if (data.type == "CARD_BACK") {
              UTILS.showToast(
                "身份证反面\nexpiryDate=" +
                data.expiryDate +
                "\nsignDate=" +
                data.signDate +
                "\nsignUnit=" +
                data.signUnit,
                ToastAndroid.SHORT
              );
            } else {
              if (__DEV__) console.dir(data);
            }
          } else {
            UTILS.showToast("失败，请稍后再试", ToastAndroid.LONG);
            this.setState({ isReady: true });
          }
        });
      } else {
        UTILS.showToast(`初始化失败 代码=${data}`, ToastAndroid.LONG);
        this.setState({ isReady: true });
      }
    });
  };

  private onMenuItemSelect = (route: string) => {
    // const xpath = "Task FreeMeasureHistory";
    if (GLOBAL.curUser) {
      database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: route });
    }
    this.props.navigation.navigate(route);
  };

  render() {
    return (
      <View style={commonStyles.container}>
        <Modal
          isVisible={this.state.isModalVisible}
          onBackdropPress={() => this.setState({ isModalVisible: false })}
          onSwipeComplete={() => this.setState({ isModalVisible: false })}
          onBackButtonPress={() => this.setState({ isModalVisible: false })}
          swipeDirection="left"
        >
          <GlobalHelpModal />
        </Modal>

        <TaskFreeMeasure
          errorDevice={this.state.errorDevice}
          isLoading={!this.state.isReady}
          dataReady={this.state.isDataReady}
          onSavePress={this.onSavePress}
          onFreePatientLog={this.onFreePatientLog}
          onCameraPress={this.onCameraPress}
          pauseMeasure={this.state.pauseMeasure}
          needInit={this.state.needInit}
          onNeedInit={this.onProcNeedInit}
          onManualInput={this.onManualInput}
          tempMonitor={this.state.tempMonitor}
          goBack={() => {
            const xpath = "ShuJu";
            if (GLOBAL.curUser) {
              database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
            }
            this.props.navigation.navigate(xpath)
          }}
        />
        <GlobalHelpButton
          isVisible={this.state.showGlobalHelpButton}
          onPress={() => this.setState({ isModalVisible: true })}
        />
      </View>
    );
  }
}
