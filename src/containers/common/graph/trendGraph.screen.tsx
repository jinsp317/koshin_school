import React from "react";
import { View, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { TrendGraph } from "./trendGraph.component";
import { FreePatientMeasureModel, FreePatientModel, RequestFPMParamsModel } from "@src/core/model";
import { httpHelper } from "@src/core/utils/httpHelper";
import commonStyles from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import GestureRecognizer from "@src/components/common/mySwipeGestureRecognizer";
import * as UTILS from "@src/core/app_utils";
import { database } from "@src/core/utils/database";

interface ComponentProps {
  fpInfo: FreePatientModel;
}

interface State {
  isLoading: boolean;
  showKind: number;
  dataMeasure: FreePatientMeasureModel[];
  beginTime: string;
  endTime: string;
}

type Props = NavigationScreenProps & ComponentProps;
export class TrendGraphScreen extends React.Component<Props, State> {
  private _requestFPMParams: RequestFPMParamsModel | undefined;
  private _tabIndex: number;
  constructor(props: Props) {
    super(props);
    this._requestFPMParams = undefined;
    this._tabIndex = 0;
    this.state = {
      isLoading: true,
      showKind: 0,
      dataMeasure: undefined,
      beginTime: undefined,
      endTime: undefined
    };
  }
  componentDidMount() {
    this.setState({ isLoading: true });
    const fpInfo: FreePatientModel = this.props.navigation.getParam("fpInfo", undefined);
    this._requestFPMParams = fpInfo ? { free_patient: fpInfo } : undefined;
    this.setRequsetTime();
    httpHelper
      .getFPMRecordCount(this._requestFPMParams)
      .then(responseJson => {
        let noData = true;
        if (responseJson.count && responseJson.count > 0) {
          this._requestFPMParams.from = Math.max(responseJson.count - 20, 0);
          this._requestFPMParams.count = 20;
          noData = false;
        }
        this.refreshData(noData);
      })
      .catch(exception => this.setState({ isLoading: false }));
  }
  componentWillReceiveProps(nextProps) {
    if (__DEV__) console.info(this.state.endTime + 1);
  }

  private refreshData = (noData: boolean) => {
    const that = this;
    if (noData) {
      this.setState({
        isLoading: false,
        showKind: this._tabIndex,
        dataMeasure: undefined,
        beginTime: this._requestFPMParams.begin_time,
        endTime: this._requestFPMParams.end_time
      });
    } else {
      // const dataHelper = GLOBAL.isOffline ? database.freeMeasuresHelper : httpHelper;
      const dataHelper = database.freeMeasuresHelper;
      dataHelper
        .downloadFreePatientMeasure(this._requestFPMParams)
        .then(responseJson => {
          if (responseJson.result) {
            that.setState({
              isLoading: false,
              showKind: that._tabIndex,
              dataMeasure: responseJson.result,
              beginTime: that._requestFPMParams.begin_time,
              endTime: that._requestFPMParams.end_time
            });
          }
        })
        .catch(exception => that.setState({ isLoading: false }));
    }
  };
  private setRequsetTime = (eDate: Date = undefined) => {
    if (eDate) {
      this._requestFPMParams.end_time = UTILS.getBeginEndTimeString(eDate, false);
    }
    if (!this._requestFPMParams.end_time) {
      this._requestFPMParams.end_time = UTILS.getBeginEndTimeString(new Date(), false);
    }

    const newEndDate = UTILS.createDate(this._requestFPMParams.end_time);
    let newBeginDate: Date;
    if (this._tabIndex == 0) {
      newBeginDate = UTILS.modifyDate(newEndDate, 7, false, 0); // pre 1 week
    } else {
      newBeginDate = UTILS.modifyDate(newEndDate, 1, false, 1); // pre 1 month
    }
    this._requestFPMParams.begin_time = UTILS.getBeginEndTimeString(newBeginDate, true);
  };
  private handleTabPress = (showKind: number) => {
    this.setState({ isLoading: true });
    this._tabIndex = showKind;
    this._requestFPMParams.from = undefined;
    this._requestFPMParams.count = undefined;
    this.setRequsetTime();

    httpHelper
      .getFPMRecordCount(this._requestFPMParams)
      .then(responseJson => {
        let noData = true;
        if (responseJson.count && responseJson.count > 0) {
          this._requestFPMParams.from = Math.max(responseJson.count - 20, 0);
          this._requestFPMParams.count = 20;
          noData = false;
        }
        this.refreshData(noData);
      })
      .catch(exception => this.setState({ isLoading: false }));
  };

  private handleDateChange = (date: Date) => {
    if (typeof date == "string") date = UTILS.createDate(date);
    if (UTILS.isFutureTime(undefined, date)) return;

    this.setState({ isLoading: true });
    this._requestFPMParams.from = undefined;
    this._requestFPMParams.count = undefined;

    this.setRequsetTime(date);

    httpHelper
      .getFPMRecordCount(this._requestFPMParams)
      .then(responseJson => {
        let noData = true;
        if (responseJson.count && responseJson.count > 0) {
          this._requestFPMParams.from = Math.max(responseJson.count - 20, 0);
          this._requestFPMParams.count = 20;
          noData = false;
        }
        this.refreshData(noData);
      })
      .catch(exception => this.setState({ isLoading: false }));
  };
  private onSwipe = (gestureState, dir: number) => {
    this.procSwipe(dir); // 0 left, 1 right
  };
  /**
   * dir: 0 left, 1 right
   */
  private procSwipe = (dir: number) => {
    const endDate = UTILS.createDate(this.state.endTime);
    const days = this.state.showKind == 0 ? 7 : 30;
    if (dir == 1) endDate.setDate(endDate.getDate() - days);
    else endDate.setDate(endDate.getDate() + days);

    this.handleDateChange(endDate);
  };
  public render(): React.ReactNode {
    return this.state.isLoading ? (
      <View style={commonStyles.progressBar}>
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
          <TrendGraph
            showKind={this.state.showKind}
            dataMeasure={this.state.dataMeasure}
            handleTabPress={this.handleTabPress}
            handleDateChange={this.handleDateChange}
            beginTime={this.state.beginTime}
            endTime={this.state.endTime}
            onSwipe={(dir: number) => this.onSwipe(undefined, dir)}
          />
        </GestureRecognizer>
      );
  }
}
