import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import {
  GlucoseMonitorModel,
  RequestGlucoseMonitorModel,
  PatientModel,
  MANAGE_KIND
} from "@src/core/model";
import { AddPatient } from "./addPatient.component";
import { database } from "@src/core/utils/database";
import { httpHelper } from "@src/core/utils/httpHelper";
import commonStyles from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { AppSync } from "@src/core/appSync";

interface State {
  isLoading: boolean;
}
interface ComponentProps {
  kind?: MANAGE_KIND;
}

type Props = NavigationScreenProps & ComponentProps;
export class AddPatientScreen extends React.Component<Props, State> {
  private _manageKind = MANAGE_KIND.ADD;
  constructor(props: NavigationScreenProps) {
    super(props);
    this.state = { isLoading: false };
  }
  componentWillMount() {
    this._manageKind = this.props.navigation.getParam("kind", MANAGE_KIND.ADD);
  }
  componentDidMount() {
    this.updateData();
  }

  private updateData = () => { };

  private onSave = (pInfo: PatientModel) => {
    this.uploadData(pInfo);
  };

  private uploadData = (pInfo: PatientModel) => {
    // let formData = new FormData();
    // if (this._manageKind == MANAGE_KIND.DEL) {
    //   formData.append("id", pInfo.id);
    // } else {
    //   if (this._manageKind != MANAGE_KIND.ADD) formData.append("id", pInfo.id);
    //   formData.append("name", pInfo.name);
    //   formData.append("is_in", pInfo.is_in);
    //   formData.append("gender", pInfo.gender);
    //   formData.append("birthday", pInfo.birthday);
    //   formData.append("mobile", pInfo.mobile);
    //   formData.append("department_id", pInfo.department_id);
    //   if (pInfo.doctor_id == undefined) formData.append("doctor_id", "");
    //   else formData.append("doctor_id", pInfo.doctor_id);
    //   if (pInfo.nurse_id == undefined) formData.append("nurse_id", "");
    //   else formData.append("nurse_id", pInfo.nurse_id);

    //   pInfo.patient_number && formData.append("patient_number", pInfo.patient_number);
    //   pInfo.bed_number && formData.append("bed_number", pInfo.bed_number);
    //   pInfo.in_date && formData.append("in_date", pInfo.in_date);
    //   if (this._manageKind != MANAGE_KIND.ADD) formData.append("out_date", pInfo.out_date);
    // }

    // if (GLOBAL.isOffline) {
    //   UTILS.alert(Strings.message.alert_isOffline);
    //   return;
    // }

    this.setState({ isLoading: true });
    database.patientsHelper.updateData(pInfo, this._manageKind).then(async (response) => {
      if (response.success) {
        UTILS.showToast(Strings.message.op_success);
        const { navigation } = this.props;
        navigation.goBack(null);
        navigation.state.params.onGoBack({ beUpdate: true });
      } else {
        if (response.message === "SAME_ID") UTILS.showToast("住院号重复");
        else UTILS.showToast(Strings.message.op_fail);
      }
      this.setState({ isLoading: false });
    }).catch(ex => {
      this.setState({ isLoading: false });
      UTILS.showToast(Strings.message.connectServer_fail, ToastAndroid.SHORT);
    });
    // }


  };

  render() {
    return (
      <View style={commonStyles.container}>
        <AddPatient
          isLoading={this.state.isLoading}
          kind={this._manageKind}
          onSave={this.onSave}
          navigation={this.props.navigation}
          pInfo={this._manageKind == MANAGE_KIND.ADD ? undefined : GLOBAL.curPatient}
        />
      </View>
    );
  }
}
