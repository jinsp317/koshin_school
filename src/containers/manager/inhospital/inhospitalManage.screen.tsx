import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import {  
  PatientModel,
  MANAGE_KIND,
  MonitorPatientModel
} from "@src/core/model";
import { InhospitalManage } from "./inhospitalManage.component";

import { httpHelper } from "@src/core/utils/httpHelper";
import { database } from "@src/core/utils/database";

import commonStyles from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { AppSync } from "@src/core/appSync";
import BackgroundJob from "react-native-background-job";
import { EventRegister } from "react-native-event-listeners";
interface State {
  isLoading: boolean;
}
interface ComponentProps {
  kind?: MANAGE_KIND;
}

type Props = NavigationScreenProps & ComponentProps;
export class InhospitalManageScreen extends React.Component<Props, State> {
  private _manageKind = MANAGE_KIND.ADD;
  private _isSpecial = false;
  private _isSaving = false;
  constructor(props: NavigationScreenProps) {
    super(props);
    this.state = { isLoading: false };
  }
  componentWillMount() {
    this._manageKind = this.props.navigation.getParam("kind", MANAGE_KIND.ADD);
    this._isSpecial = this.props.navigation.getParam("isSpecial", false);
    BackgroundJob.cancelAll();
  }
  componentWillReceiveProps(nextProps: Props) {
    // this._manageKind = nextProps.kind;
  }
  componentDidMount() {

    EventRegister.addEventListener(GLOBAL.sync_success, data => {
      if (this._isSaving) {
        const { navigation } = this.props;

        navigation.goBack();
        navigation.state.params.onGoBack({ beUpdate: true });

      }
    });
    // this.updateData();
  }
  componentWillUnmount() {
    GLOBAL.startBackgroundJobs();
  }
  // private updateData = () => { };

  private onSave = (pInfo: PatientModel) => {
    this.uploadData(pInfo);
  };

  private uploadData = (pInfo: PatientModel) => {
    this.setState({ isLoading: true });
    if (this._manageKind === MANAGE_KIND.OUT) {
      pInfo.is_in = 0;
      pInfo.out_date = UTILS.getFormattedDate(undefined, 1);
    }
    if (this._manageKind === MANAGE_KIND.IN) {
      pInfo.is_in = 1;
      pInfo.in_date = UTILS.getFormattedDate(undefined, 1);
      pInfo.nurse_id = pInfo.nurse_id === undefined ? 0 : pInfo.nurse_id;
      pInfo.doctor_id = pInfo.doctor_id === undefined ? 0 : pInfo.doctor_id;
    }
    if (this._manageKind === MANAGE_KIND.IN) {
      this._isSaving = false;
      const formData = new FormData();
      formData.append("patient_id", pInfo.id);
      formData.append("name", pInfo.name);
      formData.append("is_in", pInfo.is_in);
      formData.append("gender", pInfo.gender);
      formData.append("birthday", pInfo.birthday);
      formData.append("mobile", pInfo.mobile);
      formData.append("department_id", pInfo.department_id);
      if (pInfo.doctor_id == undefined) formData.append("doctor_id", "");
      else formData.append("doctor_id", pInfo.doctor_id);
      if (pInfo.nurse_id == undefined) formData.append("nurse_id", "");
      else formData.append("nurse_id", pInfo.nurse_id);
      pInfo.patient_number && formData.append("patient_number", pInfo.patient_number);
      pInfo.bed_number && formData.append("bed_number", pInfo.bed_number);
      pInfo.in_date && formData.append("in_date", pInfo.in_date);
      this.setState({ isLoading: true });
      httpHelper.managePatient(formData, MANAGE_KIND.IN).then((_res) => {
        this.setState({ isLoading: false });
        UTILS.showToast(Strings.message.op_success);
        AppSync.synchronize(false);
        this._isSaving = true;
      }).catch((_err) => {
        if (__DEV__) console.log(_err);
        this.setState({ isLoading: false });
        UTILS.showToast(Strings.message.connectServer_fail, ToastAndroid.SHORT);
      });
      // if (this._manageKind != MANAGE_KIND.ADD) formData.append("out_date", pInfo.out_date);

    } else {
      database.patientsHelper.updateData(pInfo, this._manageKind).then(async (response) => {
        if (response.success) {
          UTILS.showToast(Strings.message.op_success);
          const result: MonitorPatientModel = response.record;
          GLOBAL.curPatient = result;
          const date = new Date();
          GLOBAL.curPatient.age = date.getFullYear() - new Date(GLOBAL.curPatient.birthday).getFullYear();
          const { navigation } = this.props;
          if (this._isSpecial) {
            const { navigation } = this.props;
            // navigation.goBack(null);
            navigation.goBack();
            navigation.state.params.onGoBack({ beUpdate: true });
          } else navigation.navigate("Patients Screen", { beUpdate: true });
        } else {
          if (response.message.indexOf("SQLSTATE[45001]") === 0) UTILS.showToast("住院号重复");
          else UTILS.showToast(Strings.message.op_fail);
        }
        this.setState({ isLoading: false });
      }).catch(ex => {
        this.setState({ isLoading: false });
        UTILS.showToast(Strings.message.connectServer_fail, ToastAndroid.SHORT);
      });
    }

  };

  render() {
    return (
      <View style={commonStyles.container}>
        <InhospitalManage
          isLoading={this.state.isLoading}
          kind={this._manageKind}
          onSave={this.onSave}
          navigation={this.props.navigation}
          pInfo={this._manageKind === MANAGE_KIND.ADD ? undefined : { ...GLOBAL.curPatient }}
        />
      </View>
    );
  }
}
