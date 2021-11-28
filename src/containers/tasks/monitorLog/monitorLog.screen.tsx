import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert, BackHandler } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import {
  GlucoseMonitorModel,
  RequestGlucoseMonitorModel,
  PatientModel,
  PatientMonitorRawModel,
  PatientMonitorModel,
  MonitorsOnePointModel,
  HospitalModel,
  TaskDataModel,
} from "@src/core/model";
import { MonitorLog } from "./monitorLog.component";

import commonStyles from "@src/containers/styles/common";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { SwapIcon, SearchIconFill, SearchIconOutline, UploadIconFill } from "@src/assets/icons";
import Modal from "react-native-modal";
import { GlobalHelpModal, GlobalHelpButton } from "@src/components/common";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import { DetailLogModal } from "@src/containers/common/detailLog.modal";
import { database } from "@src/core/utils/database";
import { AppSync } from "@src/core/appSync";
import { EventRegister } from "react-native-event-listeners";

enum UpdateKind {
  ADD2ZERO = 0,
  ADD2FOOTER = 1,
  ADD2HEADER = 2,
}
interface State {
  data: PatientMonitorModel[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  downDataFailed: boolean;
  recentUpdateTime: string;
  isModalVisible: boolean;
  showGlobalHelpButton: boolean;
  isToday: boolean;
  // bedFilter: string;
  showMonitorDetailModal: boolean;
  curMonitors: GlucoseMonitorModel[];
}


type Props = NavigationScreenProps;
export class MonitorLogScreen extends React.Component<Props, State> {
  private _endDate: Date;
  private _beginDate: Date;
  private _reqParam: RequestGlucoseMonitorModel;
  private focusListener: any;
  private blurListener: any;
  private _curPatient: PatientModel;
  private syncListener: any;
  private _hospitalInfo: HospitalModel;
  private _isLoading: boolean;
  private _bedFilter: string;
  private _orgData: PatientMonitorModel[];
  private _synOldtime: string;
  private _showSyntime: boolean;
  constructor(props: NavigationScreenProps) {
    super(props);

    const today = new Date();
    this._endDate = today;
    this._beginDate = UTILS.getBeginEndTime(today, true);
    this._isLoading = false;
    this._bedFilter = '';
    this._synOldtime = '';
    this._orgData = [];
    this._showSyntime = false;
    this.state = {
      data: [],
      isLoading: false,
      isToday: true,
      downDataFailed: false,
      recentUpdateTime: undefined,
      isModalVisible: false,
      isRefreshing: false,
      showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0,
      showMonitorDetailModal: false,
      curMonitors: [],
    };
    this._reqParam = { is_group: 1, departments: [] };
  }



  componentDidMount() {
    GLOBAL.curRouteName = this.props.navigation.state.routeName;
    asyncStorageHelper.setSessionInfos();
    this.setNavigationParams();
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this._hospitalInfo = _hItem;
        this.updateData(true);
      });
      EventRegister.addEventListener(GLOBAL.sync_success, data => {
        // if (this.state.isLoading) return;
        // if (this._isLoading) return;
        const curUpdateTime = AppSync.lastSyncTime;
        const stayDay = UTILS.getFormattedDate(this._endDate, 0);
        const curDay = UTILS.getFormattedDate(undefined, 0);
        const isToday = stayDay == curDay;
        const pTime = UTILS.getFormattedDate(AppSync.oldSyncTime, 2);
        const cTime = UTILS.getFormattedDate(curUpdateTime, 2);
        if (this._showSyntime) {
          UTILS.showToast(`${Strings.common.str_prev_sync} : ${pTime} \n${Strings.common.str_cur_sync} : ${cTime} `);
          this._showSyntime = false;
        }
        // this.setState({ isRefreshing: true });
        database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
          this._hospitalInfo = _hItem;
          this.updateData(isToday);
        });
      });
      EventRegister.addEventListener(GLOBAL.sync_connect_error, data => {
        this.setState({ isRefreshing: false });
      });
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => {
      // console.log('blur')
      EventRegister.removeAllListeners();
    })

  }
  componentWillUnmount() {
    // tslint:disable-next-line: max-line-length
    this.focusListener && this.focusListener.remove(); // BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
    EventRegister.removeAllListeners();
    this.blurListener && this.blurListener.remove();
  }
  handleBackButton = () => {
    this.onActionbarLeftPress();
    return false;
  };

  public onRefreshData = async () => {
    this.setState({ isLoading: true });
    // if (!GLOBAL.isOffline)
    //   /();
    // else
    if (this.state.isLoading) return;
    this.updateData();
  };
  private onRefreshing = () => {
    if (this.state.isRefreshing) return;
    this.setState({ isRefreshing: true });
    this._synOldtime = AppSync.lastSyncTime;
    this._showSyntime = true;
    AppSync.synchronize(false);
  }

  private setNavigationParams() {
    const onRightPress = this.onTopRightPress;
    const onLeftPress = this.onActionbarLeftPress;
    this.props.navigation.setParams({
      onLeftPress,
      onRightPress,
      rightIcon: SearchIconOutline,
      leftIcon: SwapIcon,
    });
  }

  onTopRightPress = () => {
    this.props.navigation.navigate("Task FilterA", {
      onGoBack: this.onGoBack,
      kind: 1,
    });
  };
  private onActionbarLeftPress = () => {
    this.props.navigation.navigate("Task MonitorLogB", {
      date: this._beginDate,
    });
  };
  private onSearch = (filter: string) => {
    this._bedFilter = filter;
    const new_data = this._orgData.filter(_it => {
      return _it.bed_number.indexOf(this._bedFilter) > -1;
    });
    this.setState({ data: new_data });
  }
  /**
   * kind 0:replace, 1 add to footer, 2 add to header
   */
  private updateData = (isToday = true) => {
    this.setState({ isLoading: true });
    if (this.state.isRefreshing) {
      this.setState({ isLoading: true });
    } else {
      this.setState({ isLoading: true, isRefreshing: true });
    }
    this._isLoading = true;
    const that = this;
    // this._synOldtime = AppSync.lastSyncTime;
    this.updateDataPromise(UpdateKind.ADD2ZERO)
      .then(data => {
        this._isLoading = false;
        if (data) {
          let new_data: PatientMonitorModel[] = [];
          this._orgData = data;
          if (this._bedFilter.length > 0) {
            new_data = this._orgData.filter(_it => {
              return _it.bed_number.indexOf(this._bedFilter) > -1;
            });
          } else {
            new_data = this._orgData;
          }
          // if (kind == UpdateKind.ADD2ZERO) {
          //   new_data = data;
          // } else if (kind == UpdateKind.ADD2FOOTER) {
          //   new_data = that.state.data.concat(data);
          // } else if (kind == UpdateKind.ADD2HEADER) {
          //   new_data = data.concat(that.state.data);
          // }
          that.setState({
            recentUpdateTime: that._reqParam.end_time,
            data: new_data,
            showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0,
            isLoading: false,
            isToday: isToday,
            isRefreshing: false,
            downDataFailed: false,
          });
        } else {
          if (kind === UpdateKind.ADD2ZERO) {
            that.setState({
              recentUpdateTime: that._reqParam.end_time,
              isLoading: false,
              showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0,
              downDataFailed: false,
              isRefreshing: false,
              data: [],
            });
          } else {
            that.setState({
              recentUpdateTime: that._reqParam.end_time,
              isLoading: false,
              showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0,
              isRefreshing: false,
              downDataFailed: false,
            });
          }
        }
      })
      .catch(error => {
        this._isLoading = false;
        UTILS.showToast(Strings.common.str_opFailed);
        that.setState({ isLoading: false, isToday: isToday, downDataFailed: true, showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0 });
      });
  };
  private updateDataPromise = (kind: UpdateKind): Promise<PatientMonitorModel[]> => {
    const that = this;

    // this._reqParam = { is_group: 1 };
    const reqParam = { ...this._reqParam };

    if (this._beginDate) reqParam.begin_time = UTILS.getBeginEndTimeString(this._beginDate, true);
    if (this._endDate) {
      reqParam.end_time = UTILS.getBeginEndTimeString(this._endDate, false);
    }

    if (kind === UpdateKind.ADD2HEADER) {
      reqParam.begin_time = this.state.recentUpdateTime;
      reqParam.end_time = `${UTILS.getFormattedDate(this._endDate, 0)} ${UTILS.getFormattedDate(
        new Date(), 2)}`;
    }

    // my patients
    if (GLOBAL.isFilterMyCharge) {
      if (GLOBAL.curUser.job_position_type === 1) reqParam.o_doctor_id = GLOBAL.curUser.id;
      if (GLOBAL.curUser.job_position_type === 2) reqParam.o_nurse_id = GLOBAL.curUser.id;
    }

    if (GLOBAL.isFilterPatients) {
      reqParam.patients = GLOBAL.filterPaitentIds;
    }
    // departments
    reqParam.departments = [];
    GLOBAL.totalDepartments.forEach(e => {
      if (e.checked) reqParam.departments.push(e.id);
    });

    return new Promise(function (resolve, reject) {
      // const dataHelper = GLOBAL.isOffline ? database.recordsHelper : httpHelper;
      const dataHelper = database.recordsHelper;
      dataHelper.downloadGlucoseMonitors(reqParam)
        .then(responseJson => {
          if (responseJson) {
            resolve(that.getRecord(responseJson));
          } else {
            resolve(undefined);
          }
        })
        .catch(exception => {
          reject(exception);
        });
    });
  };

  private getRecord = (data: PatientMonitorRawModel[]) => {
    const newData: PatientMonitorModel[] = data.map(item => {
      return {
        id: item.id,
        name: item.name,
        is_in: item.is_in,
        gender: item.gender,
        department_id: item.department_id,
        doctor_id: item.doctor_id,
        nurse_id: item.nurse_id,
        patient_number: item.patient_number,
        bed_number: item.bed_number,
        advice: item.advice,
        point_monitors: this.makePointMonitors(item.records),
      };
    });

    return newData;
  };

  private makePointMonitors = (data: GlucoseMonitorModel[]) => {
    const pointCount = GLOBAL.COMMON_POINTS.length;
    const pointMonitors: MonitorsOnePointModel[] = [];
    GLOBAL.COMMON_POINTS.forEach(() => {
      pointMonitors.push({ monitors: [] });
    });
    if (data.length === 0) {
      return pointMonitors;
    } else {
      const groups = data.reduce((rs, _it) => {
        rs[_it.point] = rs[_it.point] || [];
        rs[_it.point].push(_it);
        return rs;
      }, {});
      const keys = Object.keys(groups);
      keys.forEach(ky => {
        const ik = parseInt(ky, 0);
        pointMonitors[ik].monitors = groups[ky];
        /// pointMonitorsmonitors = groups[ky];
      });
      // GLOBAL.COMMON_POINTS.forEach((point, index) => {
      //   const pointMonitor: MonitorsOnePointModel = { monitors: [] };
      //   pointMonitor.monitors = data.filter((record, it) => record.point === index);
      //   // data.forEach(record => {
      //   //   if (index === record.point) {
      //   //     pointMonitor.monitors.push(record);
      //   //   }
      //   // });
      //   pointMonitors.push(pointMonitor);
      // });

      return pointMonitors;
    }

  };

  private onItemSelect = (item: PatientMonitorModel) => {
    let taskCount = 0;
    if (item.advice) {
      item.advice.forEach(a => taskCount++);
    }
    let point: number;
    let taskType: number;
    let taskValue: number;
    const taskPatient = {
      ...item,
      record: {
        id: undefined,
        patient_id: item.id,
        point: point,
        value: undefined,
        time: undefined,
      },
      task_type: taskType,
      task_value: taskValue,
      task_detail: { id: undefined, point: point },
    };
    this.props.navigation.navigate("Monitor GlucoseA", {
      taskPatient: taskPatient,
      onGoBack: this.onGoBack,
    });
  };

  private onCellSelect = (rowIndex: number, point: number, monitor: GlucoseMonitorModel, hasTask: boolean) => {
    const patient = this.state.data[rowIndex];
    const records = patient.point_monitors[point];
    this._curPatient = patient;
    if (!monitor || (monitor.state === GLOBAL.retryState || monitor.eat_time != null)) {
      this.setState({ curMonitors: [] });
      const taskPatient: TaskDataModel = {
        ...patient,
        record: {
          id: undefined,
          patient_id: patient.id,
          point: point,
          value: undefined,
          time: UTILS.getFormattedDate(this._endDate, 1),
        },
        task_type: hasTask ? 1 : undefined,
        task_detail: { id: undefined, point: point },
      };
      this.props.navigation.navigate("Monitor GlucoseA", {
        taskPatient: taskPatient,
        onGoBack: this.onGoBack,
      });
    } else {
      if (
        patient.point_monitors &&
        patient.point_monitors[point].monitors &&
        patient.point_monitors[point].monitors.length > 1
      ) {
        // patient.point_monitors[point].monitors[0].patient_name = patient.name;
        // this.setState({
        //   curMonitors: [...patient.point_monitors[point].monitors]
        // });
        // this.setState({ showMonitorDetailModal: true, isModalVisible: true });
        this.setState({ curMonitors: [] });
        this.props.navigation.navigate("Monitor Result", {
          patient: patient,
          monitor: monitor,
          curMoniters: patient.point_monitors[point].monitors,
          onGoBack: this.onGoBack,
        });
      } else {
        this.setState({ curMonitors: [] });
        this.props.navigation.navigate("Monitor Result", {
          patient: patient,
          monitor: monitor,
          curMoniters: patient.point_monitors[point].monitors,
          onGoBack: this.onGoBack,
        });
      }
    }
  };

  private onGoBack = (beUpdate: boolean) => {
    if (beUpdate) {
      this.updateData();
    }
  }
  private onDateChange = (date: Date) => {
    this._endDate = date;
    this._beginDate = date;
    const stayDay = UTILS.getFormattedDate(this._endDate, 0);
    const curDay = UTILS.getFormattedDate(undefined, 0);
    const isToday = stayDay == curDay;
    this.updateData(isToday);
  };
  private onDepartmentChange = (id: number) => {
    this._reqParam.department_id = id;
    this.updateData();
  };
  private onSelectOneMonitor = (index: number) => {
    this.setState({ isModalVisible: false, showMonitorDetailModal: false });
    const monitor = this.state.curMonitors[index];
    // this.setState({ curMonitors: [] });
    this.props.navigation.navigate("Monitor Result", {
      patient: this._curPatient,
      monitor: monitor,
      onGoBack: this.onGoBack,
    });

    this.setState({ curMonitors: [] });
  };

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
          {this.state.showMonitorDetailModal ?
            (<DetailLogModal
              onOK={this.onSelectOneMonitor}
              monitors={this.state.curMonitors}
              hospitalInfo={this._hospitalInfo} />
            ) : (
              <GlobalHelpModal />
            )}
        </Modal>

        <MonitorLog
          isLoading={this.state.isLoading}
          data={this.state.data}
          isToday={this.state.isToday}
          downDataFailed={this.state.downDataFailed}
          onItemSelect={this.onItemSelect}
          onCellSelect={this.onCellSelect}
          isRefresh={this.state.isRefreshing}
          onRefresh={this.onRefreshing}
          recentUpdateTime={this.state.recentUpdateTime}
          onDateChange={this.onDateChange}
          onSearch={this.onSearch}
          endDate={this._endDate}
          onDepartmentChange={this.onDepartmentChange}
          hospitalInfo={this._hospitalInfo}
          departmentIndex={0}
        />
        <GlobalHelpButton isVisible={this.state.showGlobalHelpButton}
          onPress={() =>
            this.setState({
              showMonitorDetailModal: false,
              isModalVisible: true,
            })
          }
        />
      </View>
    );
  }
}
