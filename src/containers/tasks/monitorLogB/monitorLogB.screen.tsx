import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { GlucoseMonitorModel, RequestGlucoseMonitorModel, PatientModel, HospitalModel } from "@src/core/model";
import { MonitorLogB } from "./monitorLogB.component";
import commonStyles from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { database } from "@src/core/utils/database";
import { EventRegister } from "react-native-event-listeners";

enum UpdateKind {
  ADD2ZERO = 0,
  ADD2FOOTER = 1,
  ADD2HEADER = 2
}
interface State {
  data: GlucoseMonitorModel[] | undefined;
  isLoading: boolean;
  downDataFailed: boolean;
  recentUpdateTime: string;
  uploadOk: boolean;
  downAllData: boolean;
  showFooterLabel: boolean;
}
interface ComponentProps {
  //pid?: number | undefined;
}

type Props = NavigationScreenProps & ComponentProps;
export class MonitorLogBScreen extends React.Component<Props, State> {
  private _beginDate: Date;
  private _endDate: Date;
  readonly _recordsPerPage = 1000;
  private _recordCount: number;
  private _curPage: number;
  private _pageCount: number;
  private _reqParam: RequestGlucoseMonitorModel;
  private syncListener: any;
  private _hospitalInfo: HospitalModel;

  constructor(props: NavigationScreenProps) {
    super(props);

    const today = new Date();
    this._endDate = today;
    this._beginDate = UTILS.getBeginEndTime(today, true);
    this._reqParam = { departments: [] };

    this.state = {
      data: [],
      uploadOk: true,
      isLoading: true,
      downAllData: false,
      downDataFailed: false,
      recentUpdateTime: undefined,
      showFooterLabel: false
    };
  }
  componentDidMount() {
    database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
      this._hospitalInfo = _hItem;
      this.updateData();
    });
    
  }

  componentWillMount() {
    const date = this.props.navigation.getParam("date", undefined);
    if (date) {
      this._beginDate = date;
      this._endDate = date;
    }
    this.setNavigationParams();
    EventRegister.addEventListener(GLOBAL.sync_success, data => {
      if (this.state.isLoading) return;
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this._hospitalInfo = _hItem;
        this.onRefresh();
      });
      // this.onRefresh();
    });
  }
  componentWillUnmount() {
    EventRegister.removeAllListeners();
  }
  private setNavigationParams() {
    const onRightPress = this.onTopRightPress;
    this.props.navigation.setParams({
      onRightPress
      //rightIcon: SwapIcon
    });
  }

  onTopRightPress = () => {
    this.props.navigation.goBack(null);
  };

  private onRefresh = () => {
    this.setState({ isLoading: true });
    this.updateData(UpdateKind.ADD2ZERO);
  };

  private onEndReached = () => {
    if (!this.state.downAllData) {
      this._curPage++;
      this.updateData(UpdateKind.ADD2ZERO);
    }
  };

  /**
   * kind 0:replace, 1 add to footer, 2 add to header
   */
  private updateData = (kind: UpdateKind = UpdateKind.ADD2ZERO) => {
    if (kind == UpdateKind.ADD2ZERO) this.setState({ isLoading: true });
    const that = this;
    let showFooterLabel = this.state.showFooterLabel;

    this.updateDataPromise(kind)
      .then(fpms => {
        if (fpms) {
          let new_data: GlucoseMonitorModel[] = [];

          if (kind === UpdateKind.ADD2ZERO) {
            new_data = fpms;
            showFooterLabel = false;
          } else if (kind === UpdateKind.ADD2FOOTER) {
            new_data = that.state.data.concat(fpms);
            showFooterLabel = true;
          } else if (kind === UpdateKind.ADD2HEADER) {
            new_data = fpms.concat(that.state.data);
          }

          const downAllData = kind === UpdateKind.ADD2ZERO ? false : that.state.downAllData;

          that.setState({
            recentUpdateTime: that._reqParam.end_time,
            downAllData,
            showFooterLabel,
            data: new_data,
            isLoading: false,
            downDataFailed: false
          });
        } else {
          if (kind === UpdateKind.ADD2ZERO) {
            showFooterLabel = false;
            that.setState({
              recentUpdateTime: that._reqParam.end_time,
              downAllData: true,
              showFooterLabel,
              isLoading: false,
              downDataFailed: false,
              data: []
            });
          } else {
            that.setState({
              recentUpdateTime: that._reqParam.end_time,
              downAllData: true,
              showFooterLabel,
              isLoading: false,
              downDataFailed: false
            });
          }
        }
      })
      .catch(error => {
        UTILS.showToast(Strings.common.str_opFailed);
        that.setState({ isLoading: false, downDataFailed: true });
        if (kind == UpdateKind.ADD2FOOTER) that._curPage--;
      });
  };
  private updateDataPromise = (kind: UpdateKind): Promise<GlucoseMonitorModel[]> => {
    const that = this;

    const reqParam = { ...this._reqParam };
    if (this._beginDate) reqParam.begin_time = UTILS.getBeginEndTimeString(this._beginDate, true);
    if (this._endDate) reqParam.end_time = UTILS.getBeginEndTimeString(this._endDate, false);

    if (kind === UpdateKind.ADD2FOOTER) {
      reqParam.end_time = this.state.recentUpdateTime;
    } else {
    }
    // if (kind == UpdateKind.ADD2HEADER) {
    //   reqParam.begin_time = this.state.recentUpdateTime;
    //   reqParam.end_time = `${UTILS.getFormattedDate(this._endDate, 0)} ${UTILS.getFormattedDate(new Date(), 2)}`;
    // }

    //my patients
    if (GLOBAL.isFilterMyCharge) {
      if (GLOBAL.curUser.job_position_type === 1) reqParam.doctor_id = GLOBAL.curUser.id;
      if (GLOBAL.curUser.job_position_type === 2) reqParam.nurse_id = GLOBAL.curUser.id;
    }
    if (GLOBAL.isFilterPatients) {
      reqParam.patients = GLOBAL.filterPaitentIds;
    }
    //departments
    reqParam.departments = [];
    GLOBAL.totalDepartments.forEach(e => {
      if (e.checked) reqParam.departments.push(e.id);
    });

    return new Promise(function (resolve, reject) {
      //const dataHelper = GLOBAL.isOffline ? database.recordsHelper : httpHelper;
      const dataHelper = database.recordsHelper;
      dataHelper.getGlucoseMonitorsRecordCount(reqParam)
        .then((responseJson) => {
          that._recordCount = responseJson.count;
          that._pageCount = parseInt((that._recordCount / that._recordsPerPage).toString(), 0) + 1;

          if (that._recordCount && that._recordCount > 0) {
            if (kind === UpdateKind.ADD2ZERO) {
              that._curPage = 0;
              reqParam.from = 0;
              reqParam.count = that._recordsPerPage;
            } else if (kind === UpdateKind.ADD2FOOTER) {
              if (that._curPage < that._pageCount) {
                reqParam.from = that._recordsPerPage * that._curPage;
                reqParam.count = that._recordsPerPage;
              } else {
                //갱신자료가 더 없는 경우
                resolve(undefined);
              }
            } else if (kind === UpdateKind.ADD2HEADER) {
              if (that._curPage < that._pageCount) {
                //add all recent data
                //reqFPMParam.from = 0;
                //reqFPMParam.count = that._recordsPerPage;
              } else {
                //갱신자료가 더 없는 경우
                resolve(undefined);
              }
            }

            dataHelper.downloadGlucoseMonitors(reqParam)
              .then(responseJson => {
                if (responseJson.result) resolve(responseJson.result);
                else resolve(undefined);
              })
              .catch(exception => reject(exception));
          } else {
            resolve(undefined);
          }
        })
        .catch(exception => reject(exception));
    });
  };
  private onItemSelect = (monitor: GlucoseMonitorModel) => {
    const patient = { ...monitor, name: monitor.patient_name };
    const moniters = this.state.data;
    const records = moniters.filter(_it => _it.patient_id == monitor.patient_id && _it.point == monitor.point);
    this.props.navigation.navigate("Monitor Result", {
      patient: patient,
      monitor: monitor,
      curMoniters: records,
      onGoBack: this.onGoBack
    });
  };

  private onGoBack = (beUpdate: boolean) => {
    if (beUpdate) {
      this.updateData();
    }
  };
  private onDateChange = (date: Date) => {
    this._endDate = date;
    this._beginDate = date;
    this.updateData();
  };
  private onDepartmentChange = (id: number) => {
    this._reqParam.department_id = id;
    this.updateData();
  };

  render() {
    return this.state.isLoading && GLOBAL.SHOW_LOADING ? (
      <View style={commonStyles.progressBar}>
        <ProgressBar />
      </View>
    ) : (
        <View style={commonStyles.container}>
          <MonitorLogB
            hospitalInfo={this._hospitalInfo}
            data={this.state.data}
            downAllData={this.state.downAllData}
            showFooterLabel={this.state.showFooterLabel}
            downDataFailed={this.state.downDataFailed}
            onItemSelect={this.onItemSelect}
            onDateChange={this.onDateChange}
            endDate={this._endDate}
            onEndReached={this.onEndReached}
            onRefresh={this.onRefresh}
            recentUpdateTime={this.state.recentUpdateTime}
            onDepartmentChange={this.onDepartmentChange}
            departmentIndex={0}
          />
        </View>
      );
  }
}
