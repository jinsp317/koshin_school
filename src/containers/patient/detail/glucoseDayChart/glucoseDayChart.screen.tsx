import React from "react";
import { View, Alert } from "react-native";
import { NavigationScreenProps, NavigationParams } from "react-navigation";
import { GlucoseDayChart } from "./glucoseDayChart.component";
import {
  PatientModel,
  GlucoseMonitorModel,
  RequestGlucoseMonitorModel,
  MonitorDayModel
} from "@src/core/model";
import commonStyle from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import GestureRecognizer from "@src/components/common/mySwipeGestureRecognizer";
import * as UTILS from "@src/core/app_utils";
import { database } from "@src/core/utils/database";
import GLOBAL from "@src/core/globals";
import { ThemedComponentProps, withStyles, ThemeType } from "@src/core/react-native-ui-kitten";

interface State {
  isLoading: boolean;
  dataMeasures: GlucoseMonitorModel[][];
  monitorDays: MonitorDayModel[];
}

interface ComponentProps {
  navigation: NavigationParams;
  onKindChange: (kind: number) => void;
}
type Props = ThemedComponentProps & ComponentProps;

class GlucoseDayChartScreen extends React.Component<Props, State> {
  private _requestParams: RequestGlucoseMonitorModel | undefined;
  private _monitorDays: MonitorDayModel[];
  private isUpdating = false;

  constructor(props: Props) {
    super(props);
    this._requestParams = {};
    this.state = {
      isLoading: true,
      dataMeasures: undefined,
      monitorDays: []
    };
    this._monitorDays = [];
  }
  componentDidMount() {
    this.setState({ isLoading: true });
    const hospital_id = GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId ? GLOBAL.curHospitalId : undefined;

    // let dataHelper = GLOBAL.isOffline ? database.recordsHelper : httpHelper;
    const dataHelper = database.recordsHelper;
    // if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) dataHelper = httpHelper;
    dataHelper
      .getHasMonitorDays(GLOBAL.curPatient.id, 7, hospital_id)
      .then(responseJson => {
        if (responseJson.result) {
          this.setState(
            {
              isLoading: false,
              monitorDays: responseJson.result
            },
            () => {
              this._monitorDays = this.state.monitorDays.map(item => {
                item.checked = true;
                return item;
              });
              this.setRequestParams();
              this.updateData();
            }
          );
        }
      })
      .catch(exception => {
        this._monitorDays = [];
        this.setState({ isLoading: false });
        this.setRequestParams();
        this.updateData();
      });
  }
  componentWillMount() { }

  public onTopRightPress = () => {
    this.props.onKindChange(0);
  };
  private setRequestParams = () => {
    this._requestParams.patient_id = GLOBAL.curPatient.id;
    if (this.state.monitorDays.length > 0) {
      this._requestParams.begin_time = UTILS.getBeginEndTimeString(
        this.state.monitorDays[0].date,
        true
      );
    } else {
      this._requestParams.begin_time = UTILS.getBeginEndTimeString(undefined, true);
    }
    if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) {
      this._requestParams.hospital_id = GLOBAL.curHospitalId;
    }
  };
  private updateData = () => {
    this.setState({ isLoading: true });
    // let dataHelper = GLOBAL.isOffline ? database.recordsHelper : httpHelper;
    const dataHelper = database.recordsHelper;
    // if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) dataHelper = httpHelper;
    dataHelper
      .downloadGlucoseMonitors(this._requestParams)
      .then(responseJson => {
        if (responseJson.result) {
          this.setState({
            isLoading: false,
            dataMeasures: this.groupByDayData(responseJson.result)
          });
        }
      })
      .catch(exception => this.setState({ isLoading: false }));
  };
  private groupByDayData(data: GlucoseMonitorModel[]) {
    // 1주일 날자별로 자료배치
    const groupArray: GlucoseMonitorModel[][] = [];
    this._monitorDays.forEach((aDay, i) => {
      if (aDay.checked) {
        let aDayData: GlucoseMonitorModel[] = [];
        aDayData = data.filter((item) => UTILS.isTimeInDay(item.time, aDay.date));
        // data.forEach(item => {
        //   if (UTILS.isTimeInDay(item.time, aDay.date)) {
        //     aDayData.push(item);
        //   }
        // });
        groupArray.push(aDayData);
      }
    });
    return groupArray;
  }
  private onSwipe = (gestureState, dir: number) => {
    this.procSwipe(dir); // 0 left, 1 right
  };
  private onChangeMonitorDays = (monitorDayIds: boolean[]) => {
    monitorDayIds.forEach((checked, index) => {
      this._monitorDays[index].checked = checked;
    });
    this.updateData();
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
          <GlucoseDayChart
            dataMeasures={this.state.dataMeasures}
            onSwipe={(dir: number) => this.onSwipe(undefined, dir)}
            monitorDays={this._monitorDays}
            onChangeMonitorDays={this.onChangeMonitorDays}
          />
        </GestureRecognizer>
      );
  }
}
export const GlucoseDayChartContainer = withStyles(GlucoseDayChartScreen, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  }
}));
