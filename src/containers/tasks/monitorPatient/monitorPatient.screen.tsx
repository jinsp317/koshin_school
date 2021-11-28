import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { SearchIconOutline, LogIconOutline } from "@src/assets/icons";
import { MonitorPatient } from "./monitorPatient.component";
import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import {
  MonitorPatientModel,
  RequestPatientModel,
  TaskDataModel,
  RequestTaskDataModel, PointModel, PatientMonitorRawModel, GlucoseMonitorModel,
} from "@src/core/model";
import * as UTILS from "@src/core/app_utils";

import Modal from "react-native-modal";
import { GlobalHelpModal, GlobalHelpButton } from "@src/components/common";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import { database } from "@src/core/utils/database";
import { EventRegister } from "react-native-event-listeners";
import { AppSync } from "@src/core/appSync";
import moment from "moment";
import { HospitalModel } from '../../../core/model/hospital.model';
interface State {
  isLoading: boolean;
  isModalVisible: boolean;
  data: MonitorPatientModel[];
  unchecked: number;
  isRefresh: boolean;
  showGlobalHelpButton: boolean;
}
export class MonitorPatientScreen extends React.Component<NavigationScreenProps, State> {
  private focusListener: any;
  private blurListener: any;
  private _filterModalId: string;
  private _requestParams: RequestPatientModel;
  private _refreshing: boolean;
  private _selectedIndex: number;
  private _points: PointModel[];
  private _cpoint: PointModel;
  private _kind : number;
  private _hospitalInfo: HospitalModel;
  private _viewData: PatientMonitorRawModel[];

  constructor(props: NavigationScreenProps) {
    super(props);
    this.state = {
      isLoading: false,
      isModalVisible: false,
      isRefresh: false,
      data: [],
      unchecked: 0,
      showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0
    };
    this._viewData = [];
    this._refreshing = false;
  }
  componentWillMount() {
    this.setNavigationParams();


  }
  componentDidMount() {
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this.setState({ isRefresh: true });
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this._hospitalInfo = _hItem;
        this.setState({ showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0 });
        this.updateData();
      })
      EventRegister.addEventListener(GLOBAL.sync_success, data => {
        this.setState({ isRefresh: true });
        database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
          this._hospitalInfo = _hItem;
          this.updateData();
        })
      });
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => {
      EventRegister.removeAllListeners();
    })
    GLOBAL.curRouteName = this.props.navigation.state.routeName;
    asyncStorageHelper.setSessionInfos();
    this._requestParams = {
      has_advice: undefined,
      o_doctor_id: 0,
      o_nurse_id: 0,
      departments: [],
      patients: []
    };
    database.recordsHelper.getPoints().then(res => {
      this._points = res;
    });
    // 2020-09-28
    // this.updateData();
  }
  componentWillUnmount() {
    this.focusListener && this.focusListener.remove();
    this.blurListener && this.blurListener.remove();
    EventRegister.removeAllListeners();
  }
  private updateData = () => {
    // my patients
    // this._requestParams = {
    //   has_advice: undefined,
    //   o_doctor_id: 0,
    //   o_nurse_id: 0,
    //   departments: [],
    //   patients: []
    // };
    if (GLOBAL.isFilterMyCharge) {
      if (GLOBAL.curUser.job_position_type === 1) this._requestParams.o_doctor_id = GLOBAL.curUser.id;
      if (GLOBAL.curUser.job_position_type === 2) this._requestParams.o_nurse_id = GLOBAL.curUser.id;
    }

    if (GLOBAL.isFilterPatients) {
      this._requestParams.patients = GLOBAL.filterPaitentIds;
    }

    // departments
    this._requestParams.departments = [];
    GLOBAL.totalDepartments.forEach(e => {
      if (e.checked) this._requestParams.departments.push(e.id);
    });

    // this.setState({ isLoading: true });
    // const dataHelper = GLOBAL.isOffline ? database.patientsHelper : httpHelper;
    const dataHelper = database.patientsHelper;
    dataHelper.getMonitorPatients(this._requestParams)
      .then(result => {

        // const result = responseJson;
        // console.log(this._requestParams);
        // console.log(result);

        this._viewData = result;
        let result_new = [];
        if (result) {
          console.log(this._requestParams)
          result_new = this.postViewData(this._viewData, this._requestParams);
          dataHelper.getUncheckedCount().then(count => {
            this.setState({
              isLoading: false,
              isRefresh: false,
              data: result_new,
              unchecked: count
            });
          });

          // if (this._requestParams.has_advice) {
          //   result_new = this._viewData.filter(_it => _it.apoints || _it.atimes);
          // } else if (this._requestParams.has_advice === 0) {
          //   result_new = this._viewData.filter(_it => _it.apoints == null && _it.atimes == null);
          // } else result_new = this._viewData;
          /*result.forEach((data, index) => {
            const advice = data.apoints;
            // const advice = data.advice ? data.advice.map((e, index) => {
            //   return e ? GLOBAL.COMMON_POINTS[index] + " " : undefined;
            // }).filter(e => e) : undefined;
            if (this._requestParams.has_advice) {
              if (advice != null) result_new.push(data);
            } else if (this._requestParams.has_advice === 0) {
              if (advice === null) result_new.push(data);
            } else result_new.push(data);
          });*/

        } else {
          UTILS.showToast(Strings.message.error_refreshFaild);
          this.setState({ isLoading: false, isRefresh: false });
        }
      })
      .catch(exception => {
        if (__DEV__) console.error(exception);
        UTILS.showToast(exception);
        UTILS.showToast(Strings.message.error_refreshFaild);
        this.setState({ isLoading: false, isRefresh: false });
      });
  };
  private _requestSyn = () => {
    AppSync.synchronize(false);
  }
  private setNavigationParams() {
    const onRightPress = this.onTopRightPress;
    const onLeftPress = this.onTopLeftPress;
    this.props.navigation.setParams({
      // leftIcon: LogIconOutline,
      // onLeftPress,
      onRightPress,
      rightIcon: SearchIconOutline
    });
  }

  onTopRightPress = () => {
    this.props.navigation.navigate("Task FilterA", {
      onGoBack: this.onGoBack,
      kind: 1
    });
    // this.setState({ isModalVisible: true });
    // this.showFindModal();
  };
  onTopLeftPress = () => {

    const xpath = "Task MonitorLog";
    if (GLOBAL.curUser) {
      database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    }
    this.props.navigation.navigate(xpath);
    // this.setState({ isModalVisible: true });
    // this.showFindModal();
  };
  private onGoBack = (params: any) => {
    if (params.beUpdate) {
      this._requestParams.departments = [];
      GLOBAL.totalDepartments.forEach(e => {
        if (e.checked) this._requestParams.departments.push(e.id);
      });
      setTimeout(() => {
        this.updateData();
      }, 5000);
    }
  };
  private onItemSelect = async (index: number, item: MonitorPatientModel) => {
    this._selectedIndex = index;
    this.setState({ isLoading: true });
    // const curPatient: MonitorPatientModel = this.state.data[index];
    index = this.state.data.findIndex(_it => _it.id === item.id);
    const curPatient: MonitorPatientModel = item;
    const requestParams: RequestTaskDataModel = {
      patient_id: curPatient.id,
      day: UTILS.getFormattedDate(undefined, 0)
    };
    // const dataHelper = GLOBAL.isOffline ? database.tasksHelper : httpHelper;
    const dataHelper = database.tasksHelper;
    const ret: TaskDataModel[] = await dataHelper.downloadTasksMin(curPatient);
    // console.log(ret);
    let curTask: TaskDataModel;
    if (ret.length) {
      curTask = UTILS.getCurrentTask(ret, UTILS.getFormattedDate(undefined, 1));
      this.gotoMonitor(index, curTask);
      this.setState({ isLoading: false });
    } else {
      this.gotoMonitor(index);
      this.setState({ isLoading: false });
    }
    // console.log(curTask);
    // this.gotoMonitor(index, curTask);
    // this.setState({ isLoading: false });
    // dataHelper.downloadTasks(requestParams)
    //   .then(responseJson => {
    //     const result: TaskDataModel[] = responseJson.result;
    //     let curTask: TaskDataModel;
    //     if (result) {
    //       curTask = UTILS.getCurrentTask(result, UTILS.getFormattedDate(undefined, 1));
    //     }
    //     console.log('downloadTasks');
    //     console.log(curTask);
    //     this.gotoMonitor(index, curTask);
    //     this.setState({ isLoading: false });
    //   })
    //   .catch(exception => {
    //     this.gotoMonitor(index);
    //     this.setState({ isLoading: false });
    //   });
  };
  private gotoMonitor = (index: number, task: TaskDataModel = undefined) => {
    const item = this.state.data[index];
    let taskCount = 0;
    if (item.advice) {
      item.advice.forEach(a => taskCount++);
    }
    const patient = this.state.data[index];
    let point: number;
    let taskType: number;
    let taskValue: number;
    if (task && task.task_type > 0) {
      point = task.task_type === 1 ? task.task_detail.point : UTILS.getAnytimePoint();
      if (task.task_type != 3) {
        // not notice
        taskType = task.task_type;
        taskValue = task.task_value;
      }
    }

    const taskPatient = {
      ...patient,
      record: {
        id: undefined,
        patient_id: patient.id,
        point: point,
        value: undefined,
        time: undefined
      },
      task_type: taskType,
      task_value: taskValue,
      task_detail: task && task.task_detail
    };
    this.props.navigation.navigate("Monitor GlucoseA", {
      taskPatient: taskPatient,
      onGoBack: this.onGoBack
    });
  };
  private onOrderKindChange = (index: number) => {
    // this._has_advice =
    if (index === 0) this._requestParams.has_advice = undefined;
    else if (index === 1) this._requestParams.has_advice = 1;
    else this._requestParams.has_advice = 0;

    /*this.updateData(); */
    const newData = this.postViewData(this._viewData, this._requestParams);
    this.setState({ isLoading: false, data: newData });
  };
  private postViewData(viewData: PatientMonitorRawModel[], reqData: RequestPatientModel): PatientMonitorRawModel[] {
    let result_new = [];
    if (reqData.has_advice) {
      result_new = this._viewData.filter(_it => _it.apoints || _it.atimes);
    } else if (reqData.has_advice === 0) {
      result_new = this._viewData.filter(_it => !(_it.apoints || _it.atimes) );
    } else result_new = this._viewData;
    if (reqData.no_record_to_time != undefined) {
      result_new = result_new.filter(_it => {
        const item = _it as PatientMonitorRawModel;
        const rec = item.record;
        if (rec && reqData.no_record_to_time) {
          const time = moment(rec.time).toDate();
          return !(time >= reqData.no_record_from_time && time <= reqData.no_record_to_time);
        }
        return true;
      });
    }
    return result_new;
  }
  private onScanPress = () => {
    this.props.navigation.navigate("Monitor ScanPatient", {
      onGoBack: this.onGoBack,
      key: "MONITOR_PATIENT"
    });
  };
  private onRefresh = () => {
    this.setState({ isRefresh: true });
    this.updateData();
  };
  private onNoMonitorKindChange = (index: number) => {
    this.setState({ isLoading: true });
    const now = moment().toDate();
    const today = UTILS.getFormattedDate(undefined, 0);
    const before1 = UTILS.modifyDate(undefined, 1, false, 2);
    const before2 = UTILS.modifyDate(undefined, 2, false, 2);
    this._kind = index;
    if (index === 0) {
      this._requestParams.no_record_begin_time = undefined;
      this._requestParams.no_record_end_time = undefined;
      this._requestParams.no_record_to_time = undefined;
      this._requestParams.no_record_from_time = undefined;
      // this._requestParams.c_point = undefined;
    } else if (index === 1) {
      this._requestParams.no_record_to_time = now;
      this._requestParams.no_record_from_time = before1;
      // this._cpoint = this._points.find(_it => {
      //   const from = moment(today + ' ' + _it.from_time).toDate();
      //   const to = moment(today + ' ' + _it.to_time).toDate();
      //   return from <= before1 && to >= before1;
      // });
      // this._requestParams.c_point = this._cpoint.id;
      // if (point.length) this._cpoint = point[0];
      // else this._cpoint = undefined;
      this._requestParams.no_record_begin_time = UTILS.getFormattedDate(before1, 1);
    } else {
      this._requestParams.no_record_begin_time = UTILS.getFormattedDate(before2, 1);
      this._requestParams.no_record_to_time = now;
      this._requestParams.no_record_from_time = before2;
      // this._cpoint = this._points.find(_it => {
      //   const from = moment(today + ' ' + _it.from_time).toDate();
      //   const to = moment(today + ' ' + _it.to_time).toDate();
      //   return from <= before2 && to >= before2;
      // });
      // this._requestParams.c_point = this._cpoint.id;
      // if (point.length) this._cpoint = point[0];
      // else this._cpoint = undefined;
    }
    const vwData = this.postViewData(this._viewData, this._requestParams);
    this.setState({ isLoading: false, data: vwData });

    //// this.updateData();
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

        <MonitorPatient
          isLoading={this.state.isLoading}
          isRefresh={this.state.isRefresh}
          data={this.state.data}
          unchecked={this.state.unchecked}
          hospitalInfo={this._hospitalInfo}
          onItemSelect={this.onItemSelect}
          onOrderKindChange={this.onOrderKindChange}
          onNoMonitorKindChange={this.onNoMonitorKindChange}
          onScanPress={this.onScanPress}
          requestSyn={this._requestSyn}
          onRefreshData={this.onRefresh}
        />
        <GlobalHelpButton
          isVisible={this.state.showGlobalHelpButton}
          onPress={() => this.setState({ isModalVisible: true })}
        />
      </View>
    );
  }
}
