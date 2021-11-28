import Strings from "@src/assets/strings";
import React from "react";
import { View } from "react-native";
import { NavigationParams } from "react-navigation";
import { InhospitalModel, RequestInhospitalModel, PatientModel, HospitalModel } from "@src/core/model";
import { InhospitalLog } from "./inhospitalLog.component";

// import { httpHelper } from "@src/core/utils/httpHelper";
import { database } from "@src/core/utils/database";
import commonStyle from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { ThemedComponentProps, ThemeType, withStyles } from "@src/core/react-native-ui-kitten";
import { EventRegister } from 'react-native-event-listeners';

enum UpdateKind {
  ADD2ZERO = 0,
  ADD2FOOTER = 1,
  ADD2HEADER = 2
}
interface State {
  data: InhospitalModel[] | undefined;
  isLoading: boolean;
  downDataFailed: boolean;
  recentUpdateTime: string;
}
interface ComponentProps {
  navigation: NavigationParams;
}
type Props = ThemedComponentProps & ComponentProps;

class InhospitalLogScreen extends React.Component<Props, State> {
  private _seedInfo: PatientModel;
  private _endDate: Date;
  private _reqParam: RequestInhospitalModel;
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
    database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
      this.updateData();
    });

  }
  componentWillReceiveProps(nextProps) {
    // if (this._seedInfo === nextProps.seedInfo) return;
    // this._seedInfo = nextProps.seedInfo;
    // this.updateData();
  }
  componentWillMount() {
    EventRegister.addEventListener(GLOBAL.sync_success, () => {
      database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
        this.updateData();
      });
    });
  }
  componentWillUnmount() {
    EventRegister.removeAllListeners();
  }
  private onRefresh = () => {
    this.setState({ isLoading: true });
    this.updateData();
  };

  /**
   * kind 0:replace, 1 add to footer, 2 add to header
   */
  private updateData = (kind: UpdateKind = UpdateKind.ADD2ZERO) => {
    if (this.isUpdating) return;
    this.isUpdating = true;
    if (kind == UpdateKind.ADD2ZERO) this.setState({ isLoading: true });
    const that = this;
    this.updateDataPromise(kind).then(data => {
      if (data) {
        let new_data: InhospitalModel[] = [];

        if (kind == UpdateKind.ADD2ZERO) {
          new_data = data;
        } else if (kind == UpdateKind.ADD2FOOTER) {
          new_data = that.state.data.concat(data);
        } else if (kind == UpdateKind.ADD2HEADER) {
          new_data = data.concat(that.state.data);
        }

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
      .catch(() => {
        UTILS.showToast(Strings.common.str_opFailed);
        that.setState({ isLoading: false, downDataFailed: true });
        this.isUpdating = false;
      });
  };
  private updateDataPromise = (kind: UpdateKind): Promise<InhospitalModel[]> => {

    this._reqParam = {};
    const reqParam = this._reqParam;

    if (this._seedInfo) {
      reqParam.patient_id = this._seedInfo.id;
    }
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
      database.patientsHelper.downloadInhosptials(reqParam)
        .then(responseJson => {
          if (responseJson.result) resolve(responseJson.result);
          else resolve(undefined);
        })
        .catch(exception => reject(exception));
    });
  };

  private onItemSelect = () => { };
  private onSubItemSelect = (item: InhospitalModel) => {
    this.props.navigation.navigate("Patient ChangeDepartLog", {
      seedInfo: item
    });
  };

  render() {
    return this.state.isLoading ? (
      <View style={commonStyle.progressBar}>
        <ProgressBar />
      </View>
    ) : (
        <View style={commonStyle.container}>
          <InhospitalLog
            seedInfo={this._seedInfo}
            data={this.state.data}
            downDataFailed={this.state.downDataFailed}
            onItemSelect={this.onItemSelect}
            onSubItemSelect={this.onSubItemSelect}
            onRefresh={this.onRefresh}
            recentUpdateTime={this.state.recentUpdateTime}
          />
        </View>
      );
  }
}

export const InhospitalLogContainer = withStyles(InhospitalLogScreen, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  }
}));
