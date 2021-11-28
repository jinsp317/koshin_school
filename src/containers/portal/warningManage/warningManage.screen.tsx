import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert, BackHandler } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { WarningLogModel, HospitalModel } from "@src/core/model";
import { WarningManage } from "./warningManage.component";
import commonStyle from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { ArrowIosBackFill, SearchIconFill } from "@src/assets/icons";
import { database } from "@src/core/utils/database";
enum UpdateKind {
  ADD2ZERO = 0,
  ADD2FOOTER = 1,
  ADD2HEADER = 2
}
interface State {
  data: WarningLogModel[] | undefined;
  isLoading: boolean;
}
interface ComponentProps { }

type Props = NavigationScreenProps & ComponentProps;
export class WarningManageScreen extends React.Component<Props, State> {
  private isUpdating = false;
  private _hospitalInfo: HospitalModel;
  constructor(props: NavigationScreenProps) {
    super(props);

    this.state = {
      data: [],
      isLoading: true
    };
  }

  componentDidMount() {
    database.getHospitalModel(GLOBAL.curHospitalId).then(_hItem => {
      this._hospitalInfo = _hItem;
      this.updateData();
    });

  }
  componentWillMount() {
    //this.setNavigationParams();
  }
  componentWillReceiveProps(nextProps) {
    this.updateData();
  }

  onTopRightPress = () => { };

  private setNavigationParams() {
    const onRightPress = this.onTopRightPress;
    this.props.navigation.setParams({
      onRightPress,
      rightIcon: SearchIconFill
    });
  }

  private updateData = () => {
    if (this.isUpdating) return;
    this.isUpdating = true;
    this.setState({ isLoading: true });
    const fromTime = UTILS.modifyDate(undefined, 1, false, 0);

    this.updateDataPromise(fromTime)
      .then(data => {
        if (data) {
          this.setState({ data, isLoading: false });
        } else this.setState({ data: [], isLoading: false });
        this.isUpdating = false;
      })
      .catch(e => {
        this.setState({ data: [], isLoading: false });
        this.isUpdating = false;
      });
  };
  private updateDataPromise = (fromTime: Date): Promise<WarningLogModel[]> => {
    return new Promise(function (resolve, reject) {
      database.getWarningLogs(UTILS.getFormattedDate(fromTime, 1))
        .then(result => {
          if (result) resolve(result);
          else resolve(undefined);
        })
        .catch(exception => reject(exception));
    });
  };

  private onItemSelect = (item: WarningLogModel) => { };
  private onGoBack = (beUpdate: boolean) => {
    if (beUpdate) {
      this.updateData();
    }
  };
  render() {
    return this.state.isLoading ? (
      <View style={commonStyle.progressBar}>
        <ProgressBar />
      </View>
    ) : (
        <View style={commonStyle.container}>
          <WarningManage data={this.state.data} onItemSelect={this.onItemSelect} hospitalInfo={this._hospitalInfo} />
        </View>
      );
  }
}
