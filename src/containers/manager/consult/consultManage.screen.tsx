import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { PatientModel, MANAGE_KIND, ConsultModel } from "@src/core/model";
import { ConsultManage } from "./consultManage.component";
import commonStyles from "@src/containers/styles/common";
import * as UTILS from "@src/core/app_utils";
import { database } from '../../../core/utils/database';

interface State {
  isLoading: boolean;
}
interface ComponentProps {
  kind?: MANAGE_KIND;
}

type Props = NavigationScreenProps & ComponentProps;
export class ConsultManageScreen extends React.Component<Props, State> {
  private _manageKind = MANAGE_KIND.ADD;
  private _data: ConsultModel;

  constructor(props: NavigationScreenProps) {
    super(props);
    this.state = { isLoading: false };
  }
  componentWillMount() {
    this._manageKind = this.props.navigation.getParam("kind", MANAGE_KIND.ADD);
    this._data = this.props.navigation.getParam("data", undefined);
  }
  componentWillReceiveProps(nextProps: Props) {
    // this._manageKind = nextProps.kind;
  }
  componentDidMount() {
    this.updateData();
  }

  private updateData = () => { };

  private onSave = (consultData: ConsultModel) => {
    this.uploadData(consultData);
  };

  private uploadData = (consultData: ConsultModel) => {
    const formData = new FormData();
    if (consultData.patient_id) formData.append("patient_id", consultData.patient_id);
    if (consultData.requester_id) {
      consultData.members = [
        { user_id: consultData.requester_id, department_id: consultData.department_id }
      ];
      formData.append("members", JSON.stringify(consultData.members));
    }
    if (consultData.request_time) formData.append("request_time", consultData.request_time);
    if (consultData.consult_time) formData.append("consult_time", consultData.consult_time);

    this.setState({ isLoading: true });
    database.consultRecordHelper.manageConsult(consultData, this._manageKind).then(response => {
      if (response.success) {
        UTILS.showToast(Strings.message.op_success);
        const { navigation } = this.props;
        navigation.goBack(null);
      } else {
        UTILS.showToast(Strings.message.op_fail);
      }
      this.setState({ isLoading: false });
    }).catch(e => {
      this.setState({ isLoading: false });
      UTILS.showToast(Strings.message.connectServer_fail, ToastAndroid.SHORT);
    })
    // httpHelper.manageConsult(formData, this._manageKind)
    //   .then(response => {

    //   })
    //   .catch(ex => {

    //   });
  };

  render() {
    return (
      <View style={commonStyles.container}>
        <ConsultManage
          isLoading={this.state.isLoading}
          kind={this._manageKind}
          onSave={this.onSave}
          navigation={this.props.navigation}
          consultData={this._data}
        />
      </View>
    );
  }
}
