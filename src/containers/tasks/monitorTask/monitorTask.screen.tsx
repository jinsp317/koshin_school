import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { View, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { SearchIconOutline, LogIconOutline } from "@src/assets/icons";
import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import { MonitorTask } from "./monitorTask.component";
import { TaskDataModel, RequestTaskDataModel, HospitalModel } from "@src/core/model";
import * as UTILS from "@src/core/app_utils";
import { GlobalHelpButton, GlobalHelpModal } from "@src/components/common";
import Modal from "react-native-modal";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import { database } from "@src/core/utils/database";
import { EventRegister } from "react-native-event-listeners";
import { AppSync } from "@src/core/appSync";
import moment from "moment";
interface State {
  isLoading: boolean;
  isModalVisible: boolean;
  data_incompleted: TaskDataModel[]; // incompleted
  data_completed: TaskDataModel[]; // completed
  isCompleted: number;
  unchecked: number;
  showGlobalHelpButton: boolean;
}
let that: MonitorTaskScreen;

export class MonitorTaskScreen extends React.Component<NavigationScreenProps, State> {
  private that: any;
  private focusListener: any;
  private blurListener: any;
  private _requestParams: RequestTaskDataModel;
  private _isComplete: number;
  private _selectedIndex = undefined;
  private _pointDay: string;
  private syncListener: any;
  private _hospitalInfo: HospitalModel;

  constructor(props: NavigationScreenProps) {
    super(props);
    that = this;
    this._isComplete = 0;
    this._pointDay = undefined;
    this.state = {
      isLoading: false,
      isModalVisible: false,
      data_incompleted: [],
      data_completed: [],
      isCompleted: 0,
      unchecked: 0,
      showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0
    };
  }
  componentWillMount() {
    this.setNavigationParams();
    this._isComplete = this.props.navigation.getParam("isCompleted", 0);
    //    if (this.state.isCompleted != isCompleted) this.setState(isCompleted);

  }
  componentWillReceiveProps(nextProps) {
    const isCompleted = nextProps.navigation.getParam("isCompleted", 0);
    if (this._isComplete != isCompleted) {
      if (this.state.isCompleted != isCompleted) this.setState({ isCompleted });
    }

  }
  componentDidMount() {
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this.setState({ showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0 });
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this._hospitalInfo = _hItem;
        this.updateData();
      });
      EventRegister.addEventListener(GLOBAL.sync_success, data => {
        database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
          this._hospitalInfo = _hItem;
          this.updateData();
        })
      });
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => {
      EventRegister.removeAllListeners();
    });
    GLOBAL.curRouteName = this.props.navigation.state.routeName;
    asyncStorageHelper.setSessionInfos();

    this._requestParams = {
      day: UTILS.getFormattedDate(undefined, 0),
      is_completed: this._isComplete,
      point: UTILS.getPointIdFromTime(),
      pointIndex: UTILS.getTaskPointIndexFromTime(),
      departments: [],
      patients: [],
      is_charge: undefined
    };
    if (this._isComplete != this.state.isCompleted) {
      this.setState({ isCompleted: this._isComplete });
    }
    this.setRequestParams();

    //this.updateData();
  }
  componentWillUnmount() {
    this.focusListener && this.focusListener.remove();
    EventRegister.removeAllListeners();

  }
  private _requestSyn = () => {
    AppSync.synchronize(false);
  }
  private updateData = () => {
    this.setState({ isLoading: true });
    // const dataHelper = GLOBAL.isOffline ? database.tasksHelper : httpHelper;
    const dataHelper = database.tasksHelper;
    dataHelper.downloadTasks(this._requestParams)
      .then(responseJson => {
        const result: TaskDataModel[] = responseJson.result;
        if (result) {
          const data = result.map(e => {
            const advicePoint = e.task_detail;
            if (e.task_type == 1) {
              if (advicePoint.to_time) {
                const point = advicePoint.point;
                const ft = GLOBAL.serverPoints[point];
                // const pTime = moment(`${cdate} ${ft.to_time}`);
                //  if()
                const time = moment(`${this._requestParams.day} ${ft.to_time}`);
                if (time <= moment(advicePoint.to_time)) {
                  if (!e.record) {
                    e.record = {
                      point: UTILS.getPointId(e)
                    };
                  }
                  return e;
                }
              }
              else {
                if (!e.record) {
                  e.record = {
                    point: UTILS.getPointId(e)
                  };
                }
                return e;
              }
            }
            else if (e.task_type == 2) {
              if (advicePoint.to_time) {
                const time = moment(`${this._requestParams.day} ${advicePoint.time}`);
                if (time <= moment(advicePoint.to_time)) {
                  if (!e.record) {
                    e.record = {
                      point: UTILS.getPointId(e)
                    };
                  }
                  return e;
                }
              } else {
                if (!e.record) {
                  e.record = {
                    point: UTILS.getPointId(e)
                  };
                }
                return e;
              }
            }
            else {
              if (!e.record) {
                e.record = {
                  point: UTILS.getPointId(e)
                };
              }
              return e;
            }

          });
          database.patientsHelper.getUncheckedCount().then(count => {
            /*  this.setState({
               isLoading: false
             }); */
            this.state.isCompleted
              ? this.setState({ data_completed: data, unchecked: count, isLoading: false })
              : this.setState({ data_incompleted: data, unchecked: count, isLoading: false });
          })

        } else {
          UTILS.showToast(Strings.message.error_refreshFaild);
          this.setState({ isLoading: false });
        }
      })
      .catch(exception => {
        UTILS.showToast(Strings.message.error_refreshFaild);
        this.setState({ isLoading: false });
      });
  };

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
  };
  onTopLeftPress = () => {
    this.props.navigation.navigate("Task MonitorLog");
  };
  private onDataRefresh = () => {
    this.setState({ isLoading: true });
    this.updateData();
  };
  private setRequestParams = () => {
    this._requestParams.departments = [];
    this._requestParams.patients = [];
    GLOBAL.totalDepartments.forEach(e => {
      if (e.checked) this._requestParams.departments.push(e.id);
    });

    if (GLOBAL.isFilterMyCharge) this._requestParams.is_charge = 1;
    else this._requestParams.is_charge = 0;

    if (GLOBAL.isFilterPatients) {
      this._requestParams.patients = GLOBAL.filterPaitentIds;
    }
  };
  private onGoBack = (params: any) => {
    if (params.beUpdate) {
      that.setRequestParams();
      that.updateData();
    }
  };
  private onItemSelect = (index: number) => {
    this._selectedIndex = index;
    const task = this.state.isCompleted
      ? this.state.data_completed[index]
      : this.state.data_incompleted[index];

    if (this._requestParams.is_completed === 0) {
      task.record = {
        id: undefined,
        patient_id: task.id,
        point: this._requestParams.point,
        value: undefined,
        time: this._requestParams.day,
        task_type: task.task_type,
        task_value: task.task_value
      };

      this.props.navigation.navigate({
        routeName: "Monitor GlucoseA",
        key: this.props.navigation.state.routeName,
        params: {
          taskPatient: task,
          onGoBack: this.onGoBack,
          pointDay: this._pointDay
        }
      });
    } else {
      this.props.navigation.navigate("Monitor Result", {
        patient: task,
        monitor: this.state.isCompleted
          ? this.state.data_completed[index].record
          : this.state.data_incompleted[index].record,
        onGoBack: this.onGoBack
      });
    }
  };
  private onPointChange = (index: number) => {
    const today = UTILS.getFormattedDate(undefined, 0);
    this._requestParams.pointIndex = index;

    if (index === 0) {
      // yesterday evning
      this._requestParams.point = GLOBAL.todayTaskPoints[index].id;
      this._requestParams.day = UTILS.getFormattedDate(UTILS.modifyDate(undefined, 1, false, 0), 0);
      this._pointDay = this._requestParams.day;
    } else if (index === GLOBAL.todayTaskPoints.length - 1) {
      // tomorrow morning
      this._requestParams.point = GLOBAL.todayTaskPoints[index].id;
      this._requestParams.day = UTILS.getFormattedDate(UTILS.modifyDate(undefined, 1, true, 0), 0);
      this._pointDay = this._requestParams.day;
    } else {
      this._requestParams.point = GLOBAL.todayTaskPoints[index].id;
      this._requestParams.day = today;
      this._pointDay = undefined;
    }
    this.updateData();
  };
  private onScanPress = () => {
    this.props.navigation.navigate("Monitor ScanPatient", {
      onGoBack: this.onGoBack,
      key: "MONITOR_TASK"
    });
  };

  private onTaskKindChange = (index: number) => {
    if (this.state.isCompleted != index) this.setState({ isCompleted: index });
    this._requestParams.is_completed = index;
    this.updateData();
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
        <MonitorTask
          isLoading={this.state.isLoading}
          hospitalInfo={this._hospitalInfo}
          data={this.state.isCompleted ? this.state.data_completed : this.state.data_incompleted}
          onItemSelect={this.onItemSelect}
          onPointChange={this.onPointChange}
          onTaskKindChange={this.onTaskKindChange}
          isCompleted={this.state.isCompleted}
          unchecked={this.state.unchecked}
          requestSync={this._requestSyn}
          onScanPress={this.onScanPress}
          onDataRefresh={this.onDataRefresh}
        />
        <GlobalHelpButton
          isVisible={this.state.showGlobalHelpButton}
          onPress={() => this.setState({ isModalVisible: true })}
        />
      </View>
    );
  }
}
