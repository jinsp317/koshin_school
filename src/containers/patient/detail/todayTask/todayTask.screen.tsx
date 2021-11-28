import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps, NavigationParams } from "react-navigation";
import {
  GlucoseMonitorModel,
  RequestGlucoseMonitorModel,
  PatientModel,
  TaskDataModel,
  RequestTaskDataModel
} from "@src/core/model";
import { TodayTask } from "./todayTask.component";

import commonStyles from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { withStyles, ThemeType, ThemedComponentProps } from "@src/core/react-native-ui-kitten";
import { database } from "@src/core/utils/database";
import moment from "moment";
interface State {
  data: TaskDataModel[];
  isLoading: boolean;
  downDataFailed: boolean;
  recentUpdateTime: string;
  uploadOk: boolean;
}
interface ComponentProps {
  navigation: NavigationParams;
}
type Props = ThemedComponentProps & ComponentProps;
class TodayTaskScreen extends React.Component<Props, State> {
  private _patient: PatientModel;
  private _beginDate: Date;
  private _endDate: Date;
  private _reqParam: RequestTaskDataModel;
  private isUpdating = false;

  constructor(props) {
    super(props);

    const today = new Date();
    this._endDate = today;

    this.state = {
      data: undefined,
      uploadOk: true,
      isLoading: true,
      downDataFailed: false,
      recentUpdateTime: undefined
    };
  }
  componentDidMount() {
    this.updateData();
  }

  componentWillMount() {
    this._patient = GLOBAL.curPatient; // this.props.navigation.getParam("patient", undefined);
    this.setNavigationParams();
  }

  private setNavigationParams() {
    this.props.navigation.setParams({
      onRightPress: undefined,
      rightIcon: undefined
    });
  }

  private updateData = () => {
    if (this.isUpdating) return;
    this.isUpdating = true;
    this.setState({ isLoading: true });
    const that = this;
    this.updateDataPromise()
      .then(result => {
        const today = this._reqParam.day;
        that.setState({
          data: result
            .map(item => {
              if (item.task_type != 3) {
                if (item.task_type == 1) {
                  if (UTILS.getAnytimePoint(true) != item.task_detail.point) {
                    const frm_time = moment(item.task_detail.from_time);
                    const ft = GLOBAL.serverPoints[item.task_detail.point];
                    const pTime = moment(`${today} ${ft.to_time}`);
                    if (pTime >= frm_time) {
                      return item;
                    }
                  }
                }
                else {
                  const frm_time = moment(item.task_detail.from_time);
                  const pTime = moment(`${today} ${item.task_detail.time}`);
                  if (pTime >= frm_time) {
                    return item;
                  }
                  // return item;
                }

              }
            })
            .filter(e => e),
          isLoading: false,
          downDataFailed: false
        });
        this.isUpdating = false;
      })
      .catch(error => {
        UTILS.showToast(Strings.common.str_opFailed);
        that.setState({ isLoading: false, downDataFailed: true });
        this.isUpdating = false;
      });
  };
  private updateDataPromise = (): Promise<TaskDataModel[]> => {
    const that = this;

    this._reqParam = { day: UTILS.getFormattedDate(undefined, 0) };
    const reqParam = this._reqParam;

    if (this._patient) {
      reqParam.patient_id = this._patient.id;
    }

    return new Promise(function (resolve, reject) {
      // const dataHelper = GLOBAL.isOffline ? database.tasksHelper : httpHelper;
      const dataHelper = database.tasksHelper;
      if (__DEV__) {
        console.log(reqParam);
      }
      dataHelper
        .downloadTasks(reqParam)
        .then(responseJson => {
          console.log(responseJson)
          if (responseJson.result) resolve(responseJson.result);
          else resolve(undefined);
        })
        .catch(exception => reject(exception));
    });
  };

  private onItemSelect = (item: TaskDataModel) => {
    if (item.record) {
      this.props.navigation.navigate("Monitor ResultB", {
        patient: this._patient,
        monitor: item.record,
        onGoBack: this.onGoBack
      });
    } else {
      const taskPatient = {
        ...this._patient,
        record: {
          id: undefined,
          patient_id: this._patient.id,
          point: UTILS.getPointId(item),
          value: undefined,
          time: undefined
        },
        task_type: item.task_type,
        task_value: item.task_value,
        task_detail: item.task_detail
      };

      this.props.navigation.navigate("Monitor GlucoseB", {
        taskPatient: taskPatient,
        onGoBack: this.onGoBack
      });
    }
  };
  private onGoBack = (beUpdate: boolean) => {
    if (beUpdate) {
      this.updateData();
    }
  };
  onDateChange = (date: Date) => {
    this._endDate = date;
    this._beginDate = UTILS.getFirstDateofMonth(date);
    this.updateData();
  };
  render() {
    return this.state.isLoading ? (
      <View style={commonStyles.progressBar}>
        <ProgressBar />
      </View>
    ) : (
      <View style={commonStyles.container}>
        <TodayTask
          data={this.state.data}
          downDataFailed={this.state.downDataFailed}
          onItemSelect={this.onItemSelect}
          recentUpdateTime={this.state.recentUpdateTime}
        />
      </View>
    );
  }
}
export const TodayTaskContainer = withStyles(TodayTaskScreen, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  }
}));
