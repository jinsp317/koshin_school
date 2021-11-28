import Strings from "@src/assets/strings";
import React from "react";
import { View } from "react-native";
import { NavigationParams } from "react-navigation";
import { GlucoseMonitorModel, RequestGlucoseMonitorModel, HospitalModel } from "@src/core/model";
import { GlucoseLogB } from "./glucoseLogB.component";
import commonStyles from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { withStyles, ThemeType, ThemedComponentProps } from "@src/core/react-native-ui-kitten";
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
  navigation: NavigationParams;
  onKindChange: (kind: number) => void;
}
type Props = ThemedComponentProps & ComponentProps;
class GlucoseLogBScreen extends React.Component<Props, State> {
  private _beginDate: Date;
  private _endDate: Date;
  readonly _recordsPerPage = 30;
  private _recordCount: number;
  private _curPage: number;
  private _pageCount: number;
  private _reqParam: RequestGlucoseMonitorModel;
  private isUpdating = false;
  private _hospitalInfo: HospitalModel;
  private focusListener: any;
  private blurListener: any;

  constructor(props) {
    super(props);

    const today = new Date();
    this._endDate = today;
    this._beginDate = UTILS.getBeginDate(this._endDate, GLOBAL.curFPMLogBeginTimeIndex);
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
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this._hospitalInfo = _hItem;
        this.updateData();
      });
      EventRegister.addEventListener(GLOBAL.sync_success, () => {
        database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
          this._hospitalInfo = _hItem;
          this.updateData(UpdateKind.ADD2HEADER);
        });

      });
    })
    this.blurListener = this.props.navigation.addListener('didBlur', () => {
      EventRegister.removeAllListeners();
    })

  }


  componentWillUnmount() {
    EventRegister.removeAllListeners();
    this.focusListener && this.focusListener.remove();
    this.blurListener && this.blurListener.remove();
    // this.syncListener && EventRegister.removeEventListener(this.syncListener);
  }

  public onTopRightPress = () => {
    this.props.onKindChange(0);
  };

  onTimeBandListChange = (index: number) => {
    this._beginDate = UTILS.getBeginDate(this._endDate, index);
    this.updateData();
  };
  onEndDateChange = (date: Date) => {
    this._endDate = date;
    this._beginDate = UTILS.getBeginDate(this._endDate, GLOBAL.curFPMLogBeginTimeIndex);
    this.updateData();
  };

  public onRefresh = () => {
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
    this.setState({ isLoading: true });
    const that = this;
    let showFooterLabel = this.state.showFooterLabel;

    this.updateDataPromise(kind)
      .then(fpms => {
        if (fpms) {
          let new_data: GlucoseMonitorModel[] = [];

          if (kind == UpdateKind.ADD2ZERO) {
            new_data = fpms;
            showFooterLabel = false;
          } else if (kind == UpdateKind.ADD2FOOTER) {
            new_data = that.state.data.concat(fpms);
            showFooterLabel = true;
          } else if (kind == UpdateKind.ADD2HEADER) {
            new_data = fpms.concat(that.state.data);
          }
          const rDate = new_data.filter(_it => _it.delete_user_id !== -2);
          const downAllData = kind == UpdateKind.ADD2ZERO ? false : that.state.downAllData;

          that.setState({
            recentUpdateTime: that._reqParam.end_time,
            downAllData,
            showFooterLabel,
            data: rDate,
            isLoading: false,
            downDataFailed: false
          });
        } else {
          if (kind == UpdateKind.ADD2ZERO) {
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
        this.isUpdating = false;
      })
      .catch(() => {
        UTILS.showToast(Strings.common.str_opFailed);
        that.setState({ isLoading: false, downDataFailed: true });
        if (kind === UpdateKind.ADD2FOOTER) that._curPage--;
        this.isUpdating = false;
      });
  };
  private updateDataPromise = (kind: UpdateKind): Promise<GlucoseMonitorModel[]> => {
    const that = this;

    this._reqParam = {};
    const reqParam = this._reqParam;

    if (GLOBAL.curPatient) {
      reqParam.patient_id = GLOBAL.curPatient.id;
    }
    if (this._beginDate) reqParam.begin_time = UTILS.getBeginEndTimeString(this._beginDate, true);

    if (kind == UpdateKind.ADD2FOOTER) {
      reqParam.end_time = this.state.recentUpdateTime;
    } else {
      if (this._endDate) {
        reqParam.end_time = `${UTILS.getFormattedDate(this._endDate, 0)} ${UTILS.getFormattedDate(
          new Date(),
          2
        )}`;
      }
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
      // let dataHelper = GLOBAL.isOffline ? database.recordsHelper : httpHelper;
      const dataHelper = database.recordsHelper;
      // if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) dataHelper = httpHelper;
      dataHelper
        .getGlucoseMonitorsRecordCount(reqParam)
        .then(responseJson => {
          that._recordCount = responseJson.count;
          that._pageCount = parseInt((that._recordCount / that._recordsPerPage).toString()) + 1;

          if (that._recordCount && that._recordCount > 0) {
            if (kind == UpdateKind.ADD2ZERO) {
              that._curPage = 0;
              reqParam.from = 0;
              reqParam.count = that._recordsPerPage;
            } else if (kind == UpdateKind.ADD2FOOTER) {
              if (that._curPage < that._pageCount) {
                reqParam.from = that._recordsPerPage * that._curPage;
                reqParam.count = that._recordsPerPage;
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
              .downloadGlucoseMonitors(reqParam)
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
  private onItemSelect = (item: GlucoseMonitorModel) => {
    if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) {
      UTILS.showToast(Strings.message.warning_noPrivillage);
      return;
    }
    this.props.navigation.navigate("Monitor ResultB", {
      patient: GLOBAL.curPatient,
      monitor: item,
      onGoBack: this.onGoBack
    });
  };
  onDateChange = (date: Date) => {
    this._endDate = date;
    this._beginDate = UTILS.getLastDateofMonth(date);
    this.updateData();
  };
  render() {
    return this.state.isLoading ? (
      <View style={commonStyles.progressBar}>
        <ProgressBar />
      </View>
    ) : (
        <View style={commonStyles.container}>
          <GlucoseLogB
            data={this.state.data}
            hospitalInfo={this._hospitalInfo}
            downAllData={this.state.downAllData}
            showFooterLabel={this.state.showFooterLabel}
            downDataFailed={this.state.downDataFailed}
            onItemSelect={this.onItemSelect}
            onTimeBandListChange={this.onTimeBandListChange}
            onEndDateChange={this.onEndDateChange}
            endDate={this._endDate}
            onEndReached={this.onEndReached}
            onRefresh={this.onRefresh}
            recentUpdateTime={this.state.recentUpdateTime}
          />
        </View>
      );
  }
}
export const GlucoseLogBContainer = withStyles(GlucoseLogBScreen, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  }
}));
