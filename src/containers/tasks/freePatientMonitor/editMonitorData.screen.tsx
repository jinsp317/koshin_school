import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import {
  GlucoseMonitorModel,
  RequestGlucoseMonitorModel,
  PatientModel,
  MANAGE_KIND,
  FPMDataModel
} from "@src/core/model";
import { EditMonitorData } from "./editMonitorData.component";
import commonStyles from "@src/containers/styles/common";
import * as UTILS from "@src/core/app_utils";
import { database } from "@src/core/utils/database";

interface State {
  isLoading: boolean;
}
interface ComponentProps {
  kind?: MANAGE_KIND;
}

type Props = NavigationScreenProps & ComponentProps;
export class EditMonitorDataScreen extends React.Component<Props, State> {
  private _data: FPMDataModel;
  constructor(props: NavigationScreenProps) {
    super(props);
    this.state = {
      isLoading: false
    };
  }
  componentWillMount() {
    this._data = this.props.navigation.getParam("data", MANAGE_KIND.ADD);
  }
  componentDidMount() {
    this.updateData();
  }

  private updateData = () => {};

  private onSave = (data: FPMDataModel, kind: MANAGE_KIND) => {
    const formData = new FormData();
    if (data.id) formData.append("id", data.id);
    if (data.value) formData.append("value", data.value);
    if (data.time) formData.append("time", data.time);
    if (data.point >= 0) formData.append("point", data.point);
    if (data.memo) formData.append("memo", data.memo);

    if (data.name) formData.append("name", data.name);
    if (data.cert_num) formData.append("cert_num", data.cert_num);
    if (data.cert_kind >= 0) formData.append("cert_kind", data.cert_kind);
    if (data.address) formData.append("address", data.address);
    if (data.temperature) formData.append("temperature", data.temperature);
    if (data.pressure_high) formData.append("pressure_high", data.pressure_high);
    if (data.pressure_low) formData.append("pressure_low", data.pressure_low);

    // const dataHelper = GLOBAL.isOffline ? database.freeMeasuresHelper : httpHelper;
    const dataHelper = database.freeMeasuresHelper;
    dataHelper
      .manageFreePatientMeasure(formData, kind)
      .then(response => {
        if (response.success) {
          UTILS.showToast(Strings.message.op_success);
          // if (kind === MANAGE_KIND.DEL)
          const { navigation } = this.props;
          navigation.goBack();
          navigation.state.params.onGoBack({ beUpdate: true });
        } else {
          UTILS.showToast(Strings.message.op_fail);
          this.setState({ isLoading: false });
        }
      })
      .catch(ex => {
        this.setState({ isLoading: false });
        UTILS.showToast(Strings.message.connectServer_fail, ToastAndroid.SHORT);
      });
  };

  render() {
    return (
      <View style={commonStyles.container}>
        <EditMonitorData onSave={this.onSave} pInfo={this._data} isLoading={this.state.isLoading} />
      </View>
    );
  }
}
