import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps, NavigationParams } from "react-navigation";
import { DoctorsOrderModel, RequestDoctorsOrderModel, PatientModel } from "@src/core/model";
import { DoctorsOrderLog } from "./doctorsOrderLog.component";

import { database } from "@src/core/utils/database";
import commonStyles from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { element } from "prop-types";
import { ThemeType, withStyles, ThemedComponentProps } from "@src/core/react-native-ui-kitten";
enum UpdateKind {
  ADD2ZERO = 0,
  ADD2FOOTER = 1,
  ADD2HEADER = 2
}
interface State {
  data: DoctorsOrderModel[] | undefined;
  isLoading: boolean;
  downDataFailed: boolean;
  recentUpdateTime: string;
}
interface ComponentProps {
  navigation: NavigationParams;
}
type Props = ThemedComponentProps & ComponentProps;

class DoctorsOrderLogScreen extends React.Component<Props, State> {
  private _seedInfo: PatientModel;
  private _endDate: Date;
  private _beginDate: Date;
  private _reqParam: RequestDoctorsOrderModel;
  private focusListener: any;
  private isUpdating = false;

  constructor(props) {
    super(props);

    const today = new Date();
    this._endDate = today;

    this.state = {
      data: [],
      isLoading: true,
      downDataFailed: false,
      recentUpdateTime: undefined
    };
  }
  componentDidMount() {
    this._seedInfo = GLOBAL.curPatient; // this.props.navigation.getParam("seedInfo");
    this.updateData();
  }
  componentWillMount() {}
  private onRefresh = () => {
    this.updateData(); // UpdateKind.ADD2HEADER);
  };

  /**
   * kind 0:replace, 1 add to footer, 2 add to header
   */
  private updateData = (kind: UpdateKind = UpdateKind.ADD2ZERO) => {
    if (this.isUpdating) return;
    this.isUpdating = true;
    if (kind == UpdateKind.ADD2ZERO) this.setState({ isLoading: true });
    const that = this;
    this.updateDataPromise(kind)
      .then(data => {
        if (data) {
          let new_data: DoctorsOrderModel[] = [];

          // if (kind == UpdateKind.ADD2ZERO) {
            new_data = data;
          // } else if (kind == UpdateKind.ADD2FOOTER) {
          //   new_data = that.state.data.concat(data);
          // } else if (kind == UpdateKind.ADD2HEADER) {
          //   new_data = data.concat(that.state.data);
          // }

          that.setState({
            recentUpdateTime: that._reqParam.end_time,
            data: new_data,
            isLoading: false,
            downDataFailed: false
          });
        } else {
          if (kind == UpdateKind.ADD2ZERO) {
            that.setState({
              recentUpdateTime: that._reqParam.end_time,
              isLoading: false,
              downDataFailed: false,
              data: []
            });
          } else {
            that.setState({
              recentUpdateTime: that._reqParam.end_time,
              isLoading: false,
              downDataFailed: false
            });
          }
        }
        this.isUpdating = false;
      })
      .catch(error => {
        UTILS.showToast(Strings.common.str_opFailed);
        that.setState({ isLoading: false, downDataFailed: true });
        this.isUpdating = false;
      });
  };
  private updateDataPromise = (kind: UpdateKind): Promise<DoctorsOrderModel[]> => {
    const that = this;

    this._reqParam = {};
    const reqParam = this._reqParam;

    if (this._seedInfo) {
      reqParam.patient_id = this._seedInfo.id;
    }
    if (this._beginDate) reqParam.begin_time = UTILS.getBeginEndTimeString(this._beginDate, true);
    if (this._endDate) {
      reqParam.end_time = `${UTILS.getFormattedDate(this._endDate, 0)} ${UTILS.getFormattedDate(
        new Date(),
        2
      )}`;
    }

    if (kind == UpdateKind.ADD2HEADER) {
      reqParam.begin_time = this.state.recentUpdateTime;
      reqParam.end_time = `${UTILS.getFormattedDate(this._endDate, 0)} ${UTILS.getFormattedDate(
        new Date(),
        2
      )}`;
    }
    if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) {
      reqParam.hospital_id = GLOBAL.curHospitalId;
    }

    return new Promise(function (resolve, reject) {
      database.patientsHelper.downloadDoctorsOrders(reqParam)
        .then(responseJson => {
          if (responseJson) resolve(responseJson);
          else resolve(undefined);
        })
        .catch(exception => reject(exception));
    });
  };

  private onItemSelect = (item: DoctorsOrderModel) => { };
  onDateChange = (date: Date) => {
    this._endDate = UTILS.getLastDateofMonth(date);
    this._beginDate = UTILS.getFirstDateofMonth(date);

    this.updateData();
  };
  render() {
    // return this.state.isLoading ? (
    return this.state.isLoading ? (
      <View style={commonStyles.progressBar}>
        <ProgressBar />
      </View>
    ) : (
        <View style={commonStyles.container}>
          <DoctorsOrderLog
            seedInfo={this._seedInfo}
            data={this.state.data}
            downDataFailed={this.state.downDataFailed}
            onItemSelect={this.onItemSelect}
            onRefresh={this.onRefresh}
            recentUpdateTime={this.state.recentUpdateTime}
            onDateChange={this.onDateChange}
            endDate={this._endDate}
          />
        </View>
      );
  }
}

export const DoctorsOrderLogContainer = withStyles(DoctorsOrderLogScreen, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  }
}));
