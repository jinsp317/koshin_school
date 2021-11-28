import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { InhospitalModel, RequestInhospitalModel, ChangeDepartModel } from "@src/core/model";
import { ChangeDepartLog } from "./changeDepartLog.component";
import commonStyle from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { RequestChangeDepart } from "@src/core/model/changeDepart.model";
enum UpdateKind {
  ADD2ZERO = 0,
  ADD2FOOTER = 1,
  ADD2HEADER = 2
}
interface State {
  data: ChangeDepartModel[] | undefined;
  isLoading: boolean;
  downDataFailed: boolean;
  recentUpdateTime: string;
}
interface ComponentProps {
  // pid?: number | undefined;
}

type Props = NavigationScreenProps & ComponentProps;
export class ChangeDepartLogScreen extends React.Component<Props, State> {
  private _seedInfo: InhospitalModel;
  private _endDate: Date;
  private _reqParam: RequestChangeDepart;
  private isUpdating = false;

  constructor(props: NavigationScreenProps) {
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
    this._seedInfo = this.props.navigation.getParam("seedInfo");
    this.updateData();
  }
  componentWillReceiveProps(nextProps) {
    if (this._seedInfo === nextProps.seedInfo) return;
    this._seedInfo = nextProps.seedInfo;
    this.updateData();
  }
  private onRefresh = () => {
    this.updateData(UpdateKind.ADD2HEADER);
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
          let new_data: ChangeDepartModel[] = [];

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
      .catch(error => {
        UTILS.showToast(Strings.common.str_opFailed);
        that.setState({ isLoading: false, downDataFailed: true });
        this.isUpdating = false;
      });
  };
  private updateDataPromise = (kind: UpdateKind): Promise<ChangeDepartModel[]> => {
    const that = this;

    this._reqParam = {};
    const reqParam = this._reqParam;
    if (this._seedInfo) {
      reqParam.inhospital_id = this._seedInfo.id;
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
      const data: ChangeDepartModel[] = Array(2).fill({
        from_depart_name: "内科",
        from_time: "2019-10-10 12:03:03",
        from_user_name: "啊啊啊",
        to_depart_name: "内分泌",
        to_time: "2019-10-11 12:03:03",
        to_user_name: "啊啊啊"
      });

      resolve(data);
      /*
      httpHelper
        .downloadInhosptials(reqParam)
        .then(responseJson => {
          if (responseJson.results) resolve(responseJson.results);
          else resolve(undefined);
        })
        .catch(exception => reject(exception)); */
    });
  };
  render() {
    return this.state.isLoading ? (
      <View style={commonStyle.progressBar}>
        <ProgressBar />
      </View>
    ) : (
        <View style={commonStyle.container}>
          <ChangeDepartLog
            seedInfo={this._seedInfo}
            data={this.state.data}
            downDataFailed={this.state.downDataFailed}
            onItemSelect={() => { }}
            onRefresh={this.onRefresh}
            recentUpdateTime={this.state.recentUpdateTime}
          />
        </View>
      );
  }
}
