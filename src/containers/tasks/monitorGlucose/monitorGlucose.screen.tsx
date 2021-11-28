import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, Alert, ToastAndroid, ActivityIndicator } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { MonitorGlucose } from "./monitorGlucose.component";
import { EventRegister } from "react-native-event-listeners";
import { connect } from 'react-redux';
import {
  FreePatientModel,
  MANAGE_KIND,
  GlucoseMonitorModel,
  MonitorModel,
  TaskDataModel,
  WarningLogModel,
} from "@src/core/model";

import { database } from "@src/core/utils/database";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import * as UTILS from "@src/core/app_utils";
import { NoticeModel } from "@src/core/model/notice.model";
import Modal from "react-native-modal";
import { PostMonitorModal } from "./postMonitor.modal";
import { TimeSelectMonitorModal } from "./timeSelectMonitor.modal";

import ReactNativeAN from "react-native-alarm-notification";
import moment from "moment";
import { AppSync } from "@src/core/appSync";
import BackgroundJob from "react-native-background-job";

interface State {
  isReady: boolean;
  uploadOk: boolean;
  pauseMeasure: boolean;
  needInit: boolean;
  errorDevice: boolean;
  tempMonitor: MonitorModel;
  _notice: NoticeModel;
  isModalVisible: boolean;
  isTimeVisible: boolean;
  postKind: number;
  timeKind: number;
}
interface SynProps {
  isSynWait: boolean;
}
export type RdxProps = NavigationScreenProps & SynProps;
export class MonitorGlucoseScreenO extends React.Component<RdxProps, State> {
  private focusListener: any;
  private blurListener: any;
  private _taskPatient: TaskDataModel;
  private _wifiOk: boolean;
  private _point: number;

  private _tempRetestNotice1: NoticeModel;
  private _tempRetestNotice2: NoticeModel;

  private _pointDay: string; // for yesterday or tomorrow task
  private _isFocus: boolean;
  private _alertValueType: number;
  private _kind: number;
  private syncListener: any;

  constructor(props, ctx) {
    super(props, ctx);
    this._taskPatient = undefined;
    this._wifiOk = true;

    this._alertValueType = 0; // no alarm
    this._point = -1;
    this.state = {
      isReady: true,
      uploadOk: true,
      pauseMeasure: false,
      needInit: false,
      errorDevice: false,
      tempMonitor: { eat_time: '', time: '', value: '' },
      _notice: undefined,
      isModalVisible: false,
      isTimeVisible: false,
      timeKind: 0,
      postKind: 1, // high 0: low
    };
  }
  // ** for use baidu ocr*/
  componentDidMount() {
    BackgroundJob.cancelAll();
    this._tempRetestNotice1 = undefined;
    this._tempRetestNotice2 = undefined;

  }

  componentWillUnmount() {
    // this.focusListener && this.focusListener.remove();
    // this.blurListener && this.blurListener.remove();
    // careSensHelper.disconnect();
    GLOBAL.startBackgroundJobs();
  }

  componentWillMount() {
    this._taskPatient = this.props.navigation.getParam("taskPatient", undefined);
    this._pointDay = this.props.navigation.getParam("pointDay", undefined);
    this._kind = this.props.navigation.getParam("myKind", undefined);
    if (!this._taskPatient.age && this._taskPatient.birthday) {
      const aaa = UTILS.getAge(this._taskPatient.birthday);
    }
  }

  private onActionbarRightPress = () => {
    const xpath = "Task FreeMeasureHistory";
    if (GLOBAL.curUser) {
      database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    }
    this.props.navigation.navigate(xpath);
  };
  private procNoticePost = (notice: NoticeModel, kind: MANAGE_KIND) => {
    if (notice.notice == '-') return;
    const alarmId = `${moment(notice.notice).format("HHmmss")}`;
    if (kind === MANAGE_KIND.ADD) {
      // make alarm
      // 식사표기일때는 시간 2시간후로 설정하기
      // const notice_time = notice.type === 0 ? UTILS.modifyDate(notice.notice, 2, true, 2)
      const notice_time = UTILS.createDate(notice.notice);

      const alarmData = { ...GLOBAL.alarmNotifDataDef };
      alarmData.id = alarmId;
      const caption = notice.type === 0 ? "吃饭标记" : "复测";
      alarmData.message = `${this._taskPatient.name} ${caption} ${notice.notice}`;
      alarmData.fire_date = ReactNativeAN.parseDate(notice_time);
      alarmData.schedule_once = false;
      ReactNativeAN.deleteAlarm(alarmData.id);
      ReactNativeAN.scheduleAlarm(alarmData);
    } else if (kind === MANAGE_KIND.DEL) {
      // remove alarm
      ReactNativeAN.deleteAlarm(alarmId);
    }
    this.setState({ _notice: notice, isReady: true });

    // 중복측정인 경우는 이미 페지절환되였으므로 아래의 동작 필요없음
    // if (notice.type === 0) {
    //   const { navigation } = this.props;
    //   navigation.state.key ? navigation.goBack(navigation.state.key) : navigation.goBack();
    //   navigation.state.params.onGoBack({ beUpdate: true });
    // }
  };
  private procUploadFailed = (kind = 0) => {
    if (kind === 0) {
    } else {
    }
    this._tempRetestNotice1 = undefined;
    this._tempRetestNotice2 = undefined;
  };
  private onPostTimeModal = (pKind: number, point: number) => {
    this._point = point;
    this.setState({ timeKind: pKind, isTimeVisible: true });
  }
  private onSaveNotice = async (notice: NoticeModel, kind: MANAGE_KIND) => {
    /*if (GLOBAL.isOffline) {
      //오프라인인 경우 림시로 노틱스처리를 하지 않는다
      this.procUploadFailed(2);
      careSensHelper.disconnect();
      return;
    }*/

    // const dataHelper = GLOBAL.isOffline ? database.noticeHelper : httpHelper;
    const dataHelper = database.noticeHelper;
    notice.type === 0 && this.setState({ isReady: false });
    const formData = new FormData();
    if (kind === MANAGE_KIND.ADD || kind === MANAGE_KIND.MODIFY) {
      formData.append("patient_id", this._taskPatient.id);
      formData.append("type", notice.type);
      formData.append("date", notice.date);
      formData.append("notice", notice.notice);
      if (notice.record_id) formData.append("record_id", notice.record_id);
      if (notice.task_type) formData.append("task_type", notice.task_type);
      if (notice.task_value) formData.append("task_value", notice.task_value);

      if (kind === MANAGE_KIND.MODIFY) formData.append("id", notice.id);
    } else if (kind === MANAGE_KIND.DEL) {
      formData.append("id", notice.id);
    }
    await dataHelper.setPatientNotice(formData, kind)
      .then((response) => {
        if (response.success) {
          if (kind === MANAGE_KIND.DEL) {
            const alarmId = `${moment(notice.notice).format("HHmmss")}`;
            ReactNativeAN.deleteAlarm(alarmId);
            this.setState({ _notice: null, isReady: true });
          } else {
            notice = response.notice;
            this.procNoticePost(notice, kind);
          }

        } else {
          notice.type === 0 && this.setState({ isReady: true });
          // UTILS.showToast(Strings.message.op_fail);
        }
      })
      .catch((ex) => {
        notice.type === 0 && this.setState({ isReady: true });
        // UTILS.showToast(Strings.message.connectServer_fail);
      });
  };
  private onSaveProc = () => {
    // if (!this._isFocus) return;

    this.setState({ isModalVisible: false });
    const monitor = this._taskPatient.record;
    if (monitor.point === 9) {
      let t = monitor.time;
      if (this._taskPatient && this._taskPatient.task_detail && this._taskPatient.task_detail.time) {
        t = monitor.time.substring(0, 10) + " " + this._taskPatient.task_detail.time + ":00";
      }
      monitor.time = t;
    }
    if (this._taskPatient.id) monitor.patient_id = this._taskPatient.id;

    if (monitor.time) {
      if (this._pointDay) {
        const time = UTILS.changeDay(undefined, this._pointDay);
        monitor.time = time;

      }
    }

    // 复测, 随机인경우는 포인트를 변경시킨경우는 수이지타스크처리가 아닌것으로 처리하도록 한다
    if (
      (this._taskPatient.task_type === 2 && UTILS.getAnytimePoint() === monitor.point) ||
      this._taskPatient.task_type === 3
    ) {
      monitor.task_type = this._taskPatient.task_type;
      if (this._taskPatient.task_value >= 0) {
        monitor.task_value = this._taskPatient.task_value;
      }
    }


    if (!monitor.user_id) {
      monitor.user_id = GLOBAL.curUser.id;
      monitor.user_name = GLOBAL.curUser.name;
    }
    if (!monitor.patient_name) {
      monitor.patient_name = this._taskPatient.name ? this._taskPatient.name : "ERROR";
    }
    if (!monitor.bed_number) {
      monitor.bed_number = this._taskPatient.bed_number ? this._taskPatient.bed_number : "0";
    }
    if (!(monitor.gender >= 0)) monitor.gender = 0;
    /*
    if (!this._wifiOk || UTILS.checkOffline(false)) {
      this.procUploadFailed();
      careSensHelper.disconnect();
      return;
    }
 */ this.setState({ isReady: false });
    // const dataHelper = GLOBAL.isOffline ? database.recordsHelper : httpHelper;
    const dataHelper = database.recordsHelper;
    monitor.isRetry = false;
    if (this._tempRetestNotice1 && this._tempRetestNotice1.type == 1) {
      monitor.isRetry = true;
    }
    if (this._tempRetestNotice2 && this._tempRetestNotice2.type == 2) {
      monitor.isRetry = true;
    }
    if (monitor.state == GLOBAL.mealState || monitor.state == GLOBAL.retryState) {
      monitor.isRetry = true;
    }
    dataHelper.manageGlucoseMonitor(monitor, MANAGE_KIND.ADD)
      .then(async (response) => {
        if (response.success) {
          if (response.record) {
            const record_id = response.record.id;
            if (monitor.isRetry) {
              const type = monitor.state == GLOBAL.mealState ? 0 : 1;
              const _notice: NoticeModel = {
                notice: monitor.eat_time,
                type: type,
                id: record_id,
                patient_id: monitor.patient_id
              };
              this.procNoticePost(_notice, MANAGE_KIND.ADD);
            }
            if (this._tempRetestNotice1 && this._tempRetestNotice1.type == 1) {
              const notice = this._tempRetestNotice1;
              notice.patient_id = this._taskPatient.id;
              notice.record_id = record_id;
              await this.onSaveNotice(notice, MANAGE_KIND.ADD);
            }
            if (this._tempRetestNotice2 && this._tempRetestNotice2.type == 2) {
              const notice = this._tempRetestNotice2;
              notice.patient_id = this._taskPatient.id;
              notice.record_id = record_id;
              await this.onSaveNotice(notice, MANAGE_KIND.ADD);
            }
            if (this._alertValueType > 0) {
              const e: TaskDataModel = this._taskPatient;
              UTILS.SendAlarm(e, this._alertValueType);
              const warningData: WarningLogModel = {
                id: record_id,
                patient_id: e.id,
                patient_name: e.name,
                bed_number: e.bed_number,
                patient_number: e.patient_number,
                department_id: e.department_id,
                department_name: e.department_name,
                doctor_id: e.doctor_id,
                doctor_name: e.doctor_name,
                nurse_id: e.nurse_id,
                nurse_name: e.nurse_name,
                point: e.record.point,
                value: e.record.value,
                time: e.record.time,
                warning_kind: this._alertValueType,
                warning_time: UTILS.getFormattedDate(undefined, 1),
                //                flag: 1
              };
              database.addWarningLog(warningData);
            }
          }
          this._tempRetestNotice1 = undefined;
          this._tempRetestNotice2 = undefined;
          const { navigation } = this.props;
          if (!this.props.isSynWait && !GLOBAL.usingBluetoothServer) {
            AppSync.synchronize(false);
          }
          /* wifi.getCurrentSignalStrength(level => {
            if (__DEV__) {
              console.info("------- wifi strength " + level);
            }
            const isOK = level > GLOBAL.wifiStopDbm ? true : false;
            if (!isOK) {
              // UTILS.showToast(Strings.message.warning_current_wifi_bad, ToastAndroid.LONG);
            }
          }); */
          // navigation.goBack(null);
          // if (!this.props.isSynWait) {
          //   AppSync.synchronize(false);
          // }
          navigation.goBack();
          navigation.state.params.onGoBack({
            beUpdate: true,
            monitor4cash: this._taskPatient.record,
          });
          this.setState({ isReady: true });
          // EventRegister.emit(GLOBAL.sync_success, "The synctronization is completed !!!");
          const msg = Strings.message.dataUpload_success;
          UTILS.showToast(msg);

        } else {
          this.setState({ pauseMeasure: false, needInit: false, isReady: true });
          UTILS.showToast(Strings.message.dataUpload_fail);
        }
      })
      .catch((ex) => {
        // this.procUploadFailed();

        this.setState({ pauseMeasure: false, needInit: false, isReady: true });
        UTILS.showToast(Strings.message.dataUpload_fail);
      });
  };
  private removeTicket = (monitor: GlucoseMonitorModel) => {
    console.log(monitor);
    const dataHelper = database.recordsHelper;
    dataHelper.manageGlucoseMonitor(monitor, MANAGE_KIND.FULL_DEL).then(async (response) => {
      if (!this.props.isSynWait && !GLOBAL.usingBluetoothServer) {
        AppSync.synchronize(false);
        const { navigation } = this.props;
        navigation.goBack();
        navigation.state.params.onGoBack({
          beUpdate: true,
          monitor4cash: this._taskPatient.record,
        });
        const msg = Strings.message.dataUpload_success;
        UTILS.showToast(msg);
      }
    }).catch((ex) => {
      this.setState({ pauseMeasure: false, needInit: false, isReady: true });
      UTILS.showToast(Strings.message.dataUpload_fail);
    })
  }
  private onSavePress = (monitor: GlucoseMonitorModel, wifiOK: boolean) => {
    // if (!this._isFocus) return;
    this._alertValueType = 0;
    // this._taskPatient.record = monitor;
    this._taskPatient.record.value = monitor.value;
    this._taskPatient.record.state = monitor.state;
    this._taskPatient.record.eat_time = monitor.eat_time;
    if (__DEV__) console.info(this._taskPatient.record);
    this._wifiOk = wifiOK;

    const alarm_min = this._taskPatient.alarm_min ? this._taskPatient.alarm_min : GLOBAL.GLUCOSE_WARNING_MIN_VAL;
    const alarm_max = this._taskPatient.alarm_max ? this._taskPatient.alarm_max : GLOBAL.GLUCOSE_WARNING_MAX_VAL;
    if (GLOBAL.isOffline) {
      this.onSaveProc();
    } else {
      // if (monitor.state === 1 || (!(monitor.state > 0) && monitor.value > alarm_max)) {
      if ((!(monitor.state > 0) && monitor.value > alarm_max)) {
        this._alertValueType = 1;
        this.setState({ postKind: 1, isModalVisible: true });
        // } else if (monitor.state === 2 || (!(monitor.state > 0) && monitor.value < alarm_min)) {
      } else if ((!(monitor.state > 0) && monitor.value < alarm_min)) {
        this._alertValueType = 2;
        this.setState({ postKind: 0, isModalVisible: true });
      } else {
        this.onSaveProc();
      }
    }
  };

  private onProcNeedInit = (needInit: boolean) => {
    this.setState({ needInit });
  };
  private onManualInput = () => {
    const route =
      this.props.navigation.state.routeName === "Monitor GlucoseA"
        ? "Monitor ManualInputA"
        : "Monitor ManualInputB";

    this.props.navigation.navigate(route, {
      onGoBack: this.onGoBack,
    });
  };
  private onGoBack = (monitor: MonitorModel) => {
    if (monitor) {
      this.setState({ tempMonitor: monitor });
    }
  };
  private onPostMonitor = (notice1: NoticeModel, notice2: NoticeModel) => {
    this.setState({ isModalVisible: false });
    this._tempRetestNotice1 = notice1;
    this._tempRetestNotice2 = notice2;
    this.onSaveProc();
  };
  private onTimeSave = (time: { hour: number; minute: number; pKind: number }) => {
    if (__DEV__) console.info(time);
    this.setState({ isTimeVisible: false });
    let state = 0;
    if (time.pKind === 0) {
      state = GLOBAL.mealState;
    } else {
      state = GLOBAL.retryState;
    }
    const ctime = moment().toDate();
    const cfmtTime = UTILS.getFormattedDate(ctime, 1);
    const rtime = moment(ctime).add(time.hour, 'h').add(time.minute, 'm').toDate();
    const rfmtTime = UTILS.getFormattedDate(rtime, 1);
    const monitor: GlucoseMonitorModel = { patient_id: 0, point: this._point, value: 0, state: state, time: cfmtTime, eat_time: rfmtTime };
    if (__DEV__) console.info(monitor);
    this._taskPatient.record = monitor;
    this.onSaveProc();
  }
  render() {
    return (
      <View style={commonStyles.container}>
        <Modal isVisible={this.state.isModalVisible}
          onBackdropPress={() => this.setState({ isModalVisible: false })}
          onSwipeComplete={() => this.setState({ isModalVisible: false })}
          onBackButtonPress={() => this.setState({ isModalVisible: false })}
          swipeDirection="left"
          style={{ justifyContent: "flex-end", margin: 0 }}
        >
          <PostMonitorModal
            onOK={this.onPostMonitor}
            onCancel={this.onSaveProc}
            onRequestClose={this.onSaveProc}
            kind={this.state.postKind}
          />
        </Modal>
        <Modal isVisible={this.state.isTimeVisible}
          onBackdropPress={() => this.setState({ isTimeVisible: false })}
          onSwipeComplete={() => this.setState({ isTimeVisible: false })}
          onBackButtonPress={() => this.setState({ isTimeVisible: false })}
          style={{ justifyContent: "flex-end", margin: 0 }}
        >
          <TimeSelectMonitorModal
            onOK={this.onTimeSave}
            onCancel={() => {
              this.setState({ isTimeVisible: false })
            }}
            onRequestClose={() => {
              this.setState({ isTimeVisible: false })
            }}
            kind={this.state.timeKind} />
        </Modal>
        <MonitorGlucose
          errorDevice={this.state.errorDevice}
          isLoading={!this.state.isReady}
          onSavePress={this.onSavePress}
          onSaveNotice={this.onSaveNotice}
          pauseMeasure={this.state.pauseMeasure}
          needInit={this.state.needInit}
          _notice={this.state._notice}
          onNeedInit={this.onProcNeedInit}
          taskPatient={this._taskPatient}
          onManualInput={this.onManualInput}
          tempMonitor={this.state.tempMonitor}
          onPostTimeSelect={this.onPostTimeModal}
          myKind={this._kind}
          goBack={() => this.props.navigation.goBack()}
          removeTicket={this.removeTicket}
          navigation={this.props.navigation}
        />
      </View>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    isSynWait: state.blueServerConn.isSynWait,
  };
};
export const MonitorGlucoseScreen = connect(mapStateToProps, null)(MonitorGlucoseScreenO);
// export default withNavigationFocus(MonitorGlucoseScreen);
