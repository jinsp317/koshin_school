import React from "react";
import { View, Alert } from "react-native";
import { NavigationScreenProps, NavigationParams } from "react-navigation";
import { GlucoseChart } from "./glucoseChart.component";
import { PatientModel, GlucoseMonitorModel, RequestGlucoseMonitorModel } from "@src/core/model";
import { httpHelper } from "@src/core/utils/httpHelper";
import commonStyle from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import GestureRecognizer from "@src/components/common/mySwipeGestureRecognizer";
import * as UTILS from "@src/core/app_utils";
import { database } from "@src/core/utils/database";
import GLOBAL from "@src/core/globals";
import { SwapIcon } from "@src/assets/icons";
import { ThemedComponentProps, withStyles, ThemeType } from "@src/core/react-native-ui-kitten";

interface State {
  isLoading: boolean;
  pointKindsIdx: number;
  timeKindsIdx: number;
  dataMeasure: GlucoseMonitorModel[];
  beginTime: string;
  endTime: string;
}

const MAX_RECORDS = 100;
interface ComponentProps {
  navigation: NavigationParams;
  onKindChange: (kind: number) => void;
}
type Props = ThemedComponentProps & ComponentProps;

class GlucoseChartScreen extends React.Component<Props, State> {
  private _requestParams: RequestGlucoseMonitorModel | undefined;
  private _pointKindsIdx: number;
  private _timeKindsIdx: number;
  private isUpdating = false;

  constructor(props: Props) {
    super(props);
    this._requestParams = {};
    this._pointKindsIdx = 0;
    this._timeKindsIdx = 0;

    this.state = {
      isLoading: true,
      pointKindsIdx: 0,
      timeKindsIdx: 0,
      dataMeasure: undefined,
      beginTime: undefined,
      endTime: undefined
    };
  }
  componentDidMount() {
    this.setState({ isLoading: true });
    this._requestParams.patient_id = GLOBAL.curPatient.id;
    this.setRequsetTime();
    this.setRequestPoints();
    this.updateData();
  }
  componentWillReceiveProps(nextProps) {
    // console.log(this.state.endTime + 1);
  }
  componentWillMount() { }

  public onTopRightPress = () => {
    this.props.onKindChange(1);
  };
  private updateData = () => {
    if (this.isUpdating) return;
    this.isUpdating = true;
    // let dataHelper = GLOBAL.isOffline ? database.recordsHelper : httpHelper;
    const dataHelper = database.recordsHelper;
    // if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) dataHelper = httpHelper;
    if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) {
      this._requestParams.hospital_id = GLOBAL.curHospitalId;
    }

    dataHelper
      .getGlucoseMonitorsRecordCount(this._requestParams)
      .then(responseJson => {
        let noData = true;
        if (responseJson.count && responseJson.count > 0) {
          this._requestParams.from = Math.max(responseJson.count - MAX_RECORDS, 0);
          this._requestParams.count = MAX_RECORDS;
          noData = false;
        }
        this.updateDataProc(noData);
        this.isUpdating = false;
      })
      .catch(exception => {
        this.setState({ isLoading: false });
        this.isUpdating = false;
      });
  };
  private updateDataProc = (noData: boolean) => {
    const that = this;
    if (noData) {
      this.setState({
        isLoading: false,
        pointKindsIdx: this._pointKindsIdx,
        timeKindsIdx: this._timeKindsIdx,
        dataMeasure: undefined,
        beginTime: this._requestParams.begin_time,
        endTime: this._requestParams.end_time
      });
    } else {
      // let dataHelper = GLOBAL.isOffline ? database.recordsHelper : httpHelper;
      const dataHelper = database.recordsHelper;
      // if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) dataHelper = httpHelper;
      dataHelper.downloadGlucoseMonitors(this._requestParams)
        .then(responseJson => {
          if (responseJson.result) {
            const data: GlucoseMonitorModel[] = responseJson.result;
            const beginTime = that._requestParams.begin_time
              ? that._requestParams.begin_time
              : UTILS.getMinMaxDateFromData(data, true);
            const endTime = that._requestParams.end_time
              ? that._requestParams.end_time
              : UTILS.getMinMaxDateFromData(data, false);
            that.setState({
              isLoading: false,
              pointKindsIdx: that._pointKindsIdx,
              timeKindsIdx: that._timeKindsIdx,
              dataMeasure: data,
              beginTime: beginTime,
              endTime: endTime
            });
          }
        })
        .catch(exception => that.setState({ isLoading: false }));
    }
  };
  private setRequestPoints = () => {
    switch (this._pointKindsIdx) {
      case 0:
        this._requestParams.points = undefined;
        break;
      case 1:
        this._requestParams.points = [2, 4, 5];
        break;
      case 2:
        this._requestParams.points = [3, 5, 7];
        break;
    }
  };
  private setRequsetTime = () => {
    switch (this._timeKindsIdx) {
      case 0:
        this._requestParams.begin_time = undefined;
        this._requestParams.end_time = undefined;
        break;
      case 1: // today
        this._requestParams.begin_time = UTILS.getBeginEndTimeString(undefined, true);
        this._requestParams.end_time = UTILS.getBeginEndTimeString(undefined, false);
        break;
      case 2: // yesterday
        const yesterday = UTILS.modifyDate(undefined, 1, false, 0);
        this._requestParams.begin_time = UTILS.getBeginEndTimeString(yesterday, true);
        this._requestParams.end_time = UTILS.getBeginEndTimeString(yesterday, false);
        break;
      case 3: // the before yesterday
        const yesterday2 = UTILS.modifyDate(undefined, 2, false, 0);
        this._requestParams.begin_time = UTILS.getBeginEndTimeString(yesterday2, true);
        this._requestParams.end_time = UTILS.getBeginEndTimeString(undefined, false);
        break;
    }
  };
  private onPointKindsChange = (index: number) => {
    this.setState({ isLoading: true });
    this._pointKindsIdx = index;
    this._requestParams.from = undefined;
    this._requestParams.count = undefined;

    this.setRequestPoints();
    this.updateData();
  };

  private onTimeKindsChange = (index: number) => {
    this._timeKindsIdx = index;
    this.setState({ isLoading: true });
    this._requestParams.from = undefined;
    this._requestParams.count = undefined;

    this.setRequsetTime();

    this.updateData();
  };
  private onChangeCustomPoints = (points: number[]) => {
    this._requestParams.points = points;
    this.updateData();
  };
  private onSwipe = (gestureState, dir: number) => {
    this.procSwipe(dir); // 0 left, 1 right
  };
  /**
   * dir: 0 left, 1 right
   */
  private procSwipe = (dir: number) => { };
  public render(): React.ReactNode {
    return this.state.isLoading ? (
      <View style={commonStyle.progressBar}>
        <ProgressBar />
      </View>
    ) : (
        <GestureRecognizer
          onSwipeLeft={gestureState => this.onSwipe(gestureState, 0)}
          onSwipeRight={gestureState => this.onSwipe(gestureState, 1)}
          config={{
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80
          }}
          style={{
            flex: 1
          }}
        >
          <GlucoseChart
            dataMeasure={this.state.dataMeasure}
            pointKindsIdx={this.state.pointKindsIdx}
            onPointKindsChange={this.onPointKindsChange}
            timeKindsIdx={this.state.timeKindsIdx}
            onTimeKindsChange={this.onTimeKindsChange}
            beginTime={this.state.beginTime}
            endTime={this.state.endTime}
            onSwipe={(dir: number) => this.onSwipe(undefined, dir)}
            onChangeCustomPoints={this.onChangeCustomPoints}
          />
        </GestureRecognizer>
      );
  }
}
export const GlucoseChartContainer = withStyles(GlucoseChartScreen, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  }
}));
