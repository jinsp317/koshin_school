import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { PatientModel, MANAGE_KIND, ConsultModel, VisitModel } from "@src/core/model";
import { VisitManage } from "./visitManage.component";

import { httpHelper } from "@src/core/utils/httpHelper";
import commonStyles from "@src/containers/styles/common";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import RNFetchBlob from "rn-fetch-blob";
import { database } from '@src/core/utils/database';


interface State {
  isLoading: boolean;
}
interface ComponentProps {
  kind?: MANAGE_KIND;
}

type Props = NavigationScreenProps & ComponentProps;
export class VisitManageScreen extends React.Component<Props, State> {
  private _manageKind = MANAGE_KIND.ADD;
  private _data: VisitModel;

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

  private onSave = (data: VisitModel) => {
    this.uploadToServer(data);
    // this.uploadData(data);
  };

  private uploadData = (data: VisitModel) => {
    const formData = new FormData();
    if (data.id) formData.append("id", data.id);
    if (data.patient_id) formData.append("patient_id", data.patient_id);
    if (data.department_id) formData.append("department_id", data.department_id);
    if (data.doctor_id) formData.append("doctor_id", data.doctor_id);
    if (data.from_time) formData.append("from_time", data.from_time);
    if (data.to_time) formData.append("to_time", data.to_time);
    if (data.memo) formData.append("memo", data.memo);
    if (data.image_file) {
      formData.append("image", "visit_image");
      formData.append("image_file", data.image_file);
    }

    this.setState({ isLoading: true });

    httpHelper
      .manageVisit(formData, this._manageKind)
      .then(response => {
        if (response.success) {
          UTILS.showToast(Strings.message.op_success);
          const { navigation } = this.props;
          navigation.goBack(null);
        } else {
          UTILS.showToast(Strings.message.op_fail);
        }
        this.setState({ isLoading: false });
      })
      .catch(ex => {
        this.setState({ isLoading: false });
        UTILS.showToast(Strings.message.connectServer_fail, ToastAndroid.SHORT);
      });
  };
  uploadToServer = (data: VisitModel) => {

    const formData = [];
    formData.push({ name: "token", data: GLOBAL.token });
    if (data.id) formData.push({ name: "id", type: "", data: data.id.toString() });
    if (data.patient_id) formData.push({ name: "patient_id", data: data.patient_id.toString() });
    if (data.department_id) {
      formData.push({
        name: "department_id",
        data: data.department_id.toString()
      });
    }
    if (data.doctor_id) formData.push({ name: "doctor_id", data: data.doctor_id.toString() });
    if (data.from_time) formData.push({ name: "from_time", data: data.from_time });
    if (data.to_time) formData.push({ name: "to_time", data: data.to_time });
    if (data.memo) formData.push({ name: "memo", data: data.memo });
    if (data.image_file) {
      formData.push({ name: "image", data: "visit_image" });
      formData.push({
        name: "image_file",
        filename: "image.png",
        type: "image/png",
        data: data.image_file
      });
      this.setState({ isLoading: true });
      RNFetchBlob.fetch(
        "POST",
        `http://${GLOBAL.server_ip}/api/visit`,
        {
          "Content-Type": "multipart/form-data"
        },
        formData
      ).then(resp => {
        const tempMSG = resp.data;

        if (resp.data && JSON.parse(resp.data).success) {
          UTILS.showToast(Strings.message.op_success);
          const { navigation } = this.props;
          navigation.goBack();
        } else {
          UTILS.showToast(Strings.message.op_fail);
        }
        this.setState({ isLoading: false });

        // tempMSG = tempMSG.replace(/^"|"$/g, "");

        // Alert.alert(tempMSG);
      })
        .catch(err => {
          this.setState({ isLoading: false });
          UTILS.showToast(Strings.message.connectServer_fail, ToastAndroid.SHORT);
        });
    } else {
      database.patientsHelper.storeVisit(data).then(() => {
        UTILS.showToast(Strings.message.op_success);
        const { navigation } = this.props;
        navigation.goBack();
        this.setState({ isLoading: false });
      }).catch((err) => {
        this.setState({ isLoading: false });
        UTILS.showToast(Strings.message.connectServer_fail, ToastAndroid.SHORT);
      });
    }



  };
  render() {
    return (
      <View style={commonStyles.container}>
        <VisitManage
          isLoading={this.state.isLoading}
          kind={this._manageKind}
          onSave={this.onSave}
          navigation={this.props.navigation}
          visitData={this._data}
        />
      </View>
    );
  }
}
