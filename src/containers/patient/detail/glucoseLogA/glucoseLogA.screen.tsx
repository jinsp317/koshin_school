import Strings from "@src/assets/strings";
import React from "react";
import { View } from "react-native";
import { NavigationParams } from "react-navigation";
import {
  GlucoseMonitorModel,
  RequestGlucoseMonitorModel,
  PatientModel,
  GlucoseValuesOneDayModel,
  TaskDataModel,
  HospitalModel
} from "@src/core/model";
import { GlucoseLogA } from "./glucoseLogA.component";
import commonStyles from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import moment from "moment";
import { ThemeType, withStyles, ThemedComponentProps } from "@src/core/react-native-ui-kitten";
import { DetailLogModal } from "@src/containers/common/detailLog.modal";
import Modal from "react-native-modal";
import { database } from "@src/core/utils/database";
import { EventRegister } from "react-native-event-listeners";

enum UpdateKind {
  ADD2ZERO = 0,
  ADD2FOOTER = 1,
  ADD2HEADER = 2
}
interface State {
  data: GlucoseValuesOneDayModel[] | undefined;
  isLoading: boolean;
  downDataFailed: boolean;
  recentUpdateTime: string;
  showMonitorDetailModal: boolean;
  curMonitors: GlucoseMonitorModel[];
}
interface ComponentProps {
  navigation: NavigationParams;
  onKindChange: (kind: number) => void;
}
type Props = ThemedComponentProps & ComponentProps;

class GlucoseLogAScreen extends React.Component<Props, State> {
  private _hospitalInfo: HospitalModel;
  private _seedInfo: PatientModel;
  private _endDate: Date;
  private _beginDate: Date;
  private _reqParam: RequestGlucoseMonitorModel;
  private isUpdating = false;
  private focusListener: any;
  private blurListener: any;

  constructor(props) {
    super(props);

    const today = new Date();
    // this._endDate = this._endDate = UTILS.getLastDateofMonth(today);
    // this._beginDate = UTILS.getFirstDateofMonth(today);
    this._endDate = today;
    this._beginDate = UTILS.getBeforeOneMonth(today);
    this.state = {
      data: [],
      isLoading: true,
      downDataFailed: false,
      recentUpdateTime: undefined,
      showMonitorDetailModal: false,
      curMonitors: []
    };
  }
  componentDidMount() {
    this._seedInfo = GLOBAL.curPatient;
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this._hospitalInfo = _hItem;
        this.updateData(UpdateKind.ADD2HEADER);
      });
      EventRegister.addEventListener(GLOBAL.sync_success, () => {
        database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
          this._hospitalInfo = _hItem;
          this.updateData(UpdateKind.ADD2HEADER);
        });
      });
    });
    this.blurListener = this.props.navigation.addListener('didBlur', () => {
      EventRegister.removeAllListeners();
    });
    // this.props.navigation.getParam("seedInfo");

  }
  componentWillReceiveProps(nextProps) {
    // if (this._seedInfo === nextProps.seedInfo) return;
    // this._seedInfo = nextProps.seedInfo;
    // this.updateData();
  }

  componentWillUnmount() {
    this.focusListener && this.focusListener.remove();
    this.blurListener && this.blurListener.remove();
    EventRegister.removeAllListeners();
    //  this.syncListener && EventRegister.removeEventListener(this.syncListener);
  }
  public onRefresh = () => {
    this.setState({ isLoading: true });
    this.updateData(UpdateKind.ADD2HEADER);
  };
  public onTopRightPress = () => {
    this.props.onKindChange(1);
  };
  /**
   * kind 0:replace, 1 add to footer, 2 add to header
   */
  private updateData = (kind: UpdateKind = UpdateKind.ADD2ZERO) => {
    if (this.isUpdating) return;
    this.isUpdating = true;
    if (kind === UpdateKind.ADD2ZERO) this.setState({ isLoading: true });
    const that = this;
    this.updateDataPromise(kind)
      .then(data => {
        if (data) {
          let new_data: GlucoseValuesOneDayModel[] = [];

          // if (kind === UpdateKind.ADD2ZERO) {
          new_data = data;
          // } else if (kind === UpdateKind.ADD2FOOTER) {
          //   new_data = that.state.data.concat(data);
          // } else if (kind === UpdateKind.ADD2HEADER) {
          //   new_data = data.concat(that.state.data);
          // }

          that.setState({
            recentUpdateTime: that._reqParam.end_time,
            data: new_data,
            isLoading: false,
            downDataFailed: false
          });
        } else {
          if (kind === UpdateKind.ADD2ZERO) {
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
      .catch(() => {
        UTILS.showToast(Strings.common.str_opFailed);
        that.setState({ isLoading: false, downDataFailed: true });
        this.isUpdating = false;
      });
  };
  private updateDataPromise = (kind: UpdateKind): Promise<GlucoseValuesOneDayModel[]> => {
    const that = this;

    this._reqParam = {};
    const reqParam = this._reqParam;

    if (this._seedInfo) {
      reqParam.patient_id = this._seedInfo.id;
    }
    if (this._beginDate) reqParam.begin_time = UTILS.getBeginEndTimeString(this._beginDate, true);
    if (this._endDate) {
      reqParam.end_time = UTILS.getBeginEndTimeString(this._endDate, false);
    }

    if (kind == UpdateKind.ADD2HEADER) {
      // reqParam.begin_time = this.state.recentUpdateTime;
      // reqParam.end_time = `${UTILS.getFormattedDate(this._endDate, 0)} ${UTILS.getFormattedDate(
      //  new Date(),
      //  2
      // )}`;
    }
    if (GLOBAL.curUser.hospital_id !== GLOBAL.curHospitalId) {
      reqParam.hospital_id = GLOBAL.curHospitalId;
    }

    return new Promise(function (resolve, reject) {
      // let dataHelper = GLOBAL.isOffline ? database.recordsHelper : httpHelper;
      const dataHelper = database.recordsHelper;
      // if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) dataHelper = httpHelper;
      dataHelper
        .downloadGlucoseMonitors(reqParam)
        .then(responseJson => {
          if (responseJson.result) resolve(that.getGlucoseOneDays(responseJson.result));
          else resolve(undefined);
        })
        .catch(exception => reject(exception));
    });
  };

  private getGlucoseOneDays = (data: GlucoseMonitorModel[]) => {
    // if (data.length <= 0) return [];

    // const days = moment(this._endDate).daysInMonth();
    const days = 30;
    let dataOneMonth: GlucoseValuesOneDayModel[] = Array(days).fill(undefined);

    let i = 29;
    dataOneMonth = dataOneMonth.map(() => ({
      date: UTILS.getAddedDateString(this._beginDate, i--),
      monitors: GLOBAL.COMMON_POINTS.map(() => {
        return [];
      })
    }));
    i = 0;
    data.forEach(element => {
      const mm = moment(element.time).toDate();
      if (this._seedInfo) {
        element.target_after_max = this._seedInfo.target_after_max;
        element.target_after_min = this._seedInfo.target_after_min;
        element.target_before_max = this._seedInfo.target_before_max;
        element.target_before_min = this._seedInfo.target_before_min;
      }
      if (element.delete_user_id !== -2) {
        for (i = 0; i < 30; i++) {
          if (mm.getDate() === UTILS.getBeforeDate(this._endDate, i).getDate()) {
            dataOneMonth[i].monitors[element.point].push(element);
            break;
          }
        }
      }
    });

    return dataOneMonth;
  };

  private onItemSelect = () => { };
  private onItemCellSelect = (
    rowIndex: number,
    point: number,
    monitors: GlucoseMonitorModel[],
    cellIndex: number,
    hasTask: boolean
  ) => {
    if (monitors?.length > 0 && cellIndex < monitors.length) {
      const patient = GLOBAL.curPatient;
      this.props.navigation.navigate("Monitor ResultB", {
        patient: patient,
        monitor: monitors[cellIndex],
        curMoniters: monitors,
        onGoBack: this.onGoBack
      });
    }
  }
  private onCellSelect = (
    rowIndex: number,
    point: number,
    monitors: GlucoseMonitorModel[],
    hasTask: boolean
  ) => {
    // UTILS.alert("!!!" + UTILS.getAddedDate(this._beginDate, 29 - rowIndex));
    const patient = GLOBAL.curPatient;
    if (!monitors || monitors.length === 0) {
      this.setState({ curMonitors: [] });
      const taskPatient: TaskDataModel = {
        ...patient,
        record: {
          id: undefined,
          patient_id: patient.id,
          point: point,
          value: undefined,
          time: UTILS.getAddedDate(this._beginDate, 29 - rowIndex)
        },
        task_type: hasTask ? 1 : undefined,
        task_detail: { id: undefined, point: point }
      };

      if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) {
        // UTILS.showToast(Strings.message.warning_noPrivillage);
        return;
      }

      this.props.navigation.navigate("Monitor GlucoseB", {
        taskPatient: taskPatient,
        onGoBack: this.onGoBack
      });
    } else {
      if (monitors.length > 1) {
        this.setState({
          curMonitors: [...monitors]
        });
        this.setState({ showMonitorDetailModal: true });
      } else {
        this.setState({ curMonitors: [] });

        if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) {
          // UTILS.showToast(Strings.message.warning_noPrivillage);
          return;
        }
        this.props.navigation.navigate("Monitor ResultB", {
          patient: patient,
          monitor: monitors[0],
          curMoniters: monitors,
          onGoBack: this.onGoBack
        });
      }
    }
  };
  private onDateChange = (date: Date) => {
    // UTILS.showToast(date.toString());
    // this._endDate = UTILS.getLastDateofMonth(date);
    // this._beginDate = UTILS.getFirstDateofMonth(date);
    this._endDate = date;
    this._beginDate = UTILS.getBeforeOneMonth(date);

    this.updateData();
  };
  private onShowChange = () => {
    this.props.onKindChange(1);
  };
  private onGoBack = (beUpdate: boolean) => {
    if (beUpdate) {
      // this.updateData(UpdateKind.ADD2HEADER);
    }
  };

  private onSelectOneMonitor = (index: number) => {
    this.setState({ showMonitorDetailModal: false });

    const monitor = this.state.curMonitors[index];

    if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) {
      // UTILS.showToast(Strings.message.warning_noPrivillage);
      return;
    }
    this.props.navigation.navigate("Monitor ResultB", {
      patient: GLOBAL.curPatient,
      monitor: monitor,
      onGoBack: this.onGoBack
    });

    this.setState({ curMonitors: [] });
  };
  render() {
    return this.state.isLoading ? (
      <View style={commonStyles.progressBar}>
        <ProgressBar />
      </View>
    ) : (
      <View style={commonStyles.container}>
        <Modal
          isVisible={this.state.showMonitorDetailModal}
          onBackdropPress={() => this.setState({ showMonitorDetailModal: false })}
          onSwipeComplete={() => this.setState({ showMonitorDetailModal: false })}
          onBackButtonPress={() => this.setState({ showMonitorDetailModal: false })}
          swipeDirection="left"
          style={{ justifyContent: "flex-end", margin: 0 }}
        >
          <DetailLogModal
            hospitalInfo={this._hospitalInfo}
            onOK={this.onSelectOneMonitor}
            monitors={this.state.curMonitors} />
        </Modal>
        <GlucoseLogA
          seedInfo={this._seedInfo}
          data={this.state.data}
          hospitalInfo={this._hospitalInfo}
          downDataFailed={this.state.downDataFailed}
          onItemSelect={this.onItemSelect}
          onCellSelect={this.onCellSelect}
          onItemCellSelect={this.onItemCellSelect}
          onRefresh={this.onRefresh}
          recentUpdateTime={this.state.recentUpdateTime}
          onDateChange={this.onDateChange}
          endDate={this._endDate}
          onShowChange={this.onShowChange}
        />
      </View>
    );
  }
}
export const GlucoseLogAContainer = withStyles(GlucoseLogAScreen, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  }
}));
