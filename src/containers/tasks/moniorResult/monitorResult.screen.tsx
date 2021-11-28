import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import {
  Notice
} from '@src/core/model/table.model';
import {
  GlucoseMonitorModel,
  RequestGlucoseMonitorModel,
  PatientMonitorModel,
  MANAGE_KIND,
  HospitalModel
} from "@src/core/model";
import { MonitorResult } from "./monitorResult.component";
import commonStyles from "@src/containers/styles/common";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { database } from "@src/core/utils/database";

import BackgroundJob from "react-native-background-job";
interface State {
  isLoading: boolean;
  tempMonitor: GlucoseMonitorModel;
  moniters: GlucoseMonitorModel[];
  state: number;
  value: number;
  cid: number;
}
interface ComponentProps {
  kind?: MANAGE_KIND;
}

type Props = NavigationScreenProps & ComponentProps;
export class MonitorResultScreen extends React.Component<Props, State> {
  private _patient: PatientMonitorModel;
  private _monitor: GlucoseMonitorModel;
  private _curMoniters: GlucoseMonitorModel[];
  private _hospitalInfo: HospitalModel;
  private _noticeShow: boolean;
  private _moniterId: number;

  constructor(props: NavigationScreenProps) {
    super(props);
    this._hospitalInfo = GLOBAL.curHospital;
    this._noticeShow = false;
    this._moniterId = 0;
    this.state = {
      isLoading: false,
      tempMonitor: undefined,
      state: -1,
      value: -1,
      cid: -1,
      moniters: [],
    };
  }
  componentWillMount() {
    this._patient = this.props.navigation.getParam("patient", undefined);
    this._monitor = this.props.navigation.getParam("monitor", undefined);
    this._curMoniters = this.props.navigation.getParam('curMoniters', undefined);
    this._noticeShow = true;
    /// this._noticeShow = this._patient.advice[this._monitor.point] == 1;
    this.setState({
      tempMonitor: this._monitor,
      moniters: this._curMoniters
    });

    BackgroundJob.cancelAll();

  }
  private onManualInput = (mId: number) => {
    this._moniterId = mId;
    const route = this.props.navigation.state.routeName === "Monitor Result"
      ? "Monitor ManualInputA"
      : "Monitor ManualInputB";

    this.props.navigation.navigate(route, {
      onGoBack: this.onGoBack
    });
  };

  private onGoBack = (monitor: GlucoseMonitorModel) => {
    this.setState({
      cid: this._moniterId,
      state: monitor.state,
      value: monitor.value
    });

  };
  componentWillUnmount() {
    GLOBAL.startBackgroundJobs();
  }
  private onSave = async (monitor: GlucoseMonitorModel, Notice: Notice, Notice1: Notice,  kind: MANAGE_KIND, otherRecs: GlucoseMonitorModel[], finish: boolean) => {

    const dataHelper = database.recordsHelper;
    if (Notice.id > 0) {
      await database.noticeHelper.update(Notice);
    }
    if (Notice.id === 0) {
      await database.noticeHelper.store(Notice);
    }
    if (Notice1.id > 0) {
      await database.noticeHelper.update(Notice1);
    }
    if (Notice1.id === 0) {
      await database.noticeHelper.store(Notice1);
    }
    if (otherRecs.length > 0) {
      otherRecs.forEach( async _rec => {
        if (_rec.flag === 0) {
          await dataHelper.manageGlucoseMonitor(_rec, MANAGE_KIND.DEL);
        } else {
          await dataHelper.manageGlucoseMonitor(_rec, MANAGE_KIND.MODIFY);
        }
      })
    }

    dataHelper.manageGlucoseMonitor(monitor, kind).then(response => {
      if (response.success) {
        if (finish) {
          UTILS.showToast(Strings.message.op_success);
          const { navigation } = this.props;
          navigation.goBack();
          navigation.state.params.onGoBack({ beUpdate: true });
        }
      } else {
        UTILS.showToast(Strings.message.op_fail);
        this.setState({ isLoading: false, tempMonitor: undefined });
      }
    }).catch(ex => {
      this.setState({ isLoading: false, tempMonitor: undefined });
      UTILS.showToast(Strings.message.connectServer_fail, ToastAndroid.SHORT);
    });
  }

  render() {
    return (
      <View style={commonStyles.container}>
        <MonitorResult
          hospitalInfo={this._hospitalInfo}
          curMoniters={this._curMoniters}
          onSave={this.onSave}
          noticeShow={this._noticeShow}
          patient={this._patient}
          monitor={this._monitor}
          isLoading={this.state.isLoading}
          onManualInput={this.onManualInput}
          cid={this.state.cid}
          state={this.state.state}
          value={this.state.value}
          tempMonitor={this.state.tempMonitor}
        />
      </View>
    );
  }
}
