import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { FPMDataModel, FreePatientModel, RequestFPMParamsModel, HospitalModel } from "@src/core/model";
import { TaskFreeMeasureHistory } from "./taskFreeMeasureHistory.component";
import commonStyle from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import { database } from "@src/core/utils/database";
import { EventRegister } from "react-native-event-listeners";

enum UpdateKind {
  ADD2ZERO = 0,
  ADD2FOOTER = 1,
  ADD2HEADER = 2
}
interface State {
  data: FPMDataModel[] | undefined;
  uploadOk: boolean;
  isLoading: boolean;
  downAllData: boolean;
  downDataFailed: boolean;
  recentUpdateTime: string;
  showFooterLabel: boolean;
  curUserIndex: number;
}
interface ComponentProps {
  fpInfo?: FreePatientModel | undefined;
}

type Props = NavigationScreenProps & ComponentProps;
export class TaskFreeMeasureHistoryScreen extends React.Component<Props, State> {
  private _fpInfo: FreePatientModel;
  private _beginDate: Date;
  private _endDate: Date;
  private _userId: number;
  readonly _recordsPerPage = 100;
  private _recordCount: number;
  private _curPage: number;
  private _pageCount: number;
  private _reqFPMParam: RequestFPMParamsModel;
  private _userData: string[];
  private isUpdating = false;
  private syncListener: any;
  private _hospitalInfo: HospitalModel;

  constructor(props: NavigationScreenProps) {
    super(props);
    this._userData = ["所有账户", ...UTILS.getSingleArrFromMultiArr(GLOBAL.myUsers, "name")];
    let curSearchUserIndex = 0;
    GLOBAL.myUsers.forEach((e, i) => {
      if (e.id === GLOBAL.curUser.id) {
        curSearchUserIndex = i + 1;
      }
    });
    this._userId = GLOBAL.curUser.id;

    this._fpInfo = undefined;

    const today = new Date();
    this._endDate = today;
    this._beginDate = UTILS.getBeginDate(this._endDate, GLOBAL.curFPMLogBeginTimeIndex);

    this._recordCount = 0;
    this._curPage = 0;
    this._pageCount = 0;
    this._reqFPMParam = {};

    this.state = {
      data: [],
      uploadOk: true,
      isLoading: true,
      downAllData: false,
      downDataFailed: false,
      recentUpdateTime: undefined,
      showFooterLabel: false,
      curUserIndex: curSearchUserIndex
    };
  }
  componentDidMount() {
    GLOBAL.curRouteName = this.props.navigation.state.routeName;
    asyncStorageHelper.setSessionInfos();

    this._fpInfo = this.props.navigation.getParam("fpInfo");
    database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
      this._hospitalInfo = _hItem;
      this.updateData();
    });

  }
  componentWillReceiveProps(nextProps) {
    if (this._fpInfo === nextProps.fpInfo) return;

    this._fpInfo = nextProps.fpInfo;
    this.updateData();
  }
  onBeginDateChange = (index: number) => {
    this._beginDate = UTILS.getBeginDate(this._endDate, index);
    this.updateData();
  };
  onEndDateChange = (date: Date) => {
    this._endDate = date;
    this._beginDate = UTILS.getBeginDate(this._endDate, GLOBAL.curFPMLogBeginTimeIndex);
    this.updateData();
  };
  onUserChange = (userId: number) => {
    this._userId = userId;
    GLOBAL.myUsers.forEach((e, i) => {
      if (e.id === this._userId) {
        this.setState({ curUserIndex: i + 1 });
      }
    });
    this.updateData();
  };
  componentWillMount() {
    EventRegister.addEventListener(GLOBAL.sync_success, data => {
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this._hospitalInfo = _hItem;
        this.updateData(UpdateKind.ADD2HEADER);
      });
      // this.updateData(UpdateKind.ADD2HEADER);
    });
  }
  componentWillUnmount() {
    EventRegister.removeAllListeners();
    // this.syncListener && EventRegister.removeEventListener(this.syncListener);
  }
  private onRefresh = () => {
    this.setState({ isLoading: true });
    this.updateData(UpdateKind.ADD2HEADER);
  };

  private onEndReached = () => {
    if (!this.state.downAllData) {
      this._curPage++;
      this.updateData(UpdateKind.ADD2FOOTER);
    }
  };
  /**
   * kind 0:replace, 1 add to footer, 2 add to header
   */
  private updateData = (kind: UpdateKind = UpdateKind.ADD2ZERO) => {
    if (this.isUpdating) return;
    this.isUpdating = true;
    if (kind == UpdateKind.ADD2ZERO) this.setState({ isLoading: true });
    const that = this;
    let showFooterLabel = this.state.showFooterLabel;

    this.updateDataPromise(kind)
      .then(fpms => {
        if (fpms) {
          let new_data: FPMDataModel[] = [];

          if (kind == UpdateKind.ADD2ZERO) {
            new_data = fpms;
            showFooterLabel = false;
          } else if (kind == UpdateKind.ADD2FOOTER) {
            new_data = that.state.data.concat(fpms);
            showFooterLabel = true;
          } else if (kind == UpdateKind.ADD2HEADER) {
            new_data = fpms.concat(that.state.data);
          }

          const downAllData = kind == UpdateKind.ADD2ZERO ? false : that.state.downAllData;

          that.setState({
            recentUpdateTime: that._reqFPMParam.end_time,
            downAllData,
            showFooterLabel,
            data: new_data,
            isLoading: false,
            downDataFailed: false
          });
        } else {
          if (kind == UpdateKind.ADD2ZERO) {
            showFooterLabel = false;
            that.setState({
              recentUpdateTime: that._reqFPMParam.end_time,
              downAllData: true,
              showFooterLabel,
              isLoading: false,
              downDataFailed: false,
              data: []
            });
          } else {
            that.setState({
              recentUpdateTime: that._reqFPMParam.end_time,
              downAllData: true,
              showFooterLabel,
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
        if (kind == UpdateKind.ADD2FOOTER) that._curPage--;
        this.isUpdating = false;
      });
  };
  private updateDataPromise = (kind: UpdateKind): Promise<FPMDataModel[]> => {
    const that = this;

    this._reqFPMParam = {};
    const reqFPMParam = this._reqFPMParam;

    if (this._fpInfo) {
      reqFPMParam.free_patient = this._fpInfo;
    }
    if (this._beginDate) {
      reqFPMParam.begin_time = UTILS.getBeginEndTimeString(this._beginDate, true);
    }
    if (this._userId) {
      reqFPMParam.user_id = this._userId;
    }

    if (kind == UpdateKind.ADD2FOOTER) {
      reqFPMParam.end_time = this.state.recentUpdateTime;
    } else {
      if (this._endDate) {
        reqFPMParam.end_time = `${UTILS.getFormattedDate(
          this._endDate,
          0
        )} ${UTILS.getFormattedDate(new Date(), 2)}`;
      }
    }
    if (kind == UpdateKind.ADD2HEADER) {
      reqFPMParam.begin_time = this.state.recentUpdateTime;
      reqFPMParam.end_time = `${UTILS.getFormattedDate(this._endDate, 0)} ${UTILS.getFormattedDate(
        new Date(),
        2
      )}`;
    }
    return new Promise(function (resolve, reject) {
      // const dataHelper = GLOBAL.isOffline ? database.freeMeasuresHelper : httpHelper;
      const dataHelper = database.freeMeasuresHelper;
      dataHelper
        .getFPMRecordCount(reqFPMParam)
        .then(responseJson => {
          that._recordCount = responseJson.count;
          that._pageCount = parseInt((that._recordCount / that._recordsPerPage).toString(), 0) + 1;

          if (that._recordCount && that._recordCount > 0) {
            if (kind == UpdateKind.ADD2ZERO) {
              that._curPage = 0;
              reqFPMParam.from = 0;
              reqFPMParam.count = that._recordsPerPage;
            } else if (kind == UpdateKind.ADD2FOOTER) {
              if (that._curPage < that._pageCount) {
                reqFPMParam.from = that._recordsPerPage * that._curPage;
                reqFPMParam.count = that._recordsPerPage;
              } else {
                // 갱신자료가 더 없는 경우
                resolve(undefined);
              }
            } else if (kind == UpdateKind.ADD2HEADER) {
              if (that._curPage < that._pageCount) {
                // add all recent data
                // reqFPMParam.from = 0;
                // reqFPMParam.count = that._recordsPerPage;
              } else {
                // 갱신자료가 더 없는 경우
                resolve(undefined);
              }
            }

            dataHelper
              .downloadFreePatientMeasure(reqFPMParam)
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
  private onGoBack = (beUpdate: boolean) => {
    if (beUpdate) {
      this.updateData();
    }
  };
  private onItemSelect = (item: FPMDataModel) => {
    this.props.navigation.navigate("Task FreeMeasureEdit", {
      data: item,
      onGoBack: this.onGoBack
    });
  };
  render() {
    return this.state.isLoading && GLOBAL.SHOW_LOADING ? (
      <View style={commonStyle.progressBar}>
        <ProgressBar />
      </View>
    ) : (
        <View style={commonStyle.container}>
          <TaskFreeMeasureHistory
            data={this.state.data}
            downAllData={this.state.downAllData}
            showFooterLabel={this.state.showFooterLabel}
            downDataFailed={this.state.downDataFailed}
            onItemSelect={this.onItemSelect}
            onTimeBandListChange={this.onBeginDateChange}
            onEndDateChange={this.onEndDateChange}
            onUserChange={this.onUserChange}
            endDate={this._endDate}
            onEndReached={this.onEndReached}
            onRefresh={this.onRefresh}
            recentUpdateTime={this.state.recentUpdateTime}
            userData={this._userData}
            hospitalInfo={this._hospitalInfo}
            curUserIndex={this.state.curUserIndex}
          />
        </View>
      );
  }
}
