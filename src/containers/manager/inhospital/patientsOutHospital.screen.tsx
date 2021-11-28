import Strings from "@src/assets/strings";
import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ToastAndroid,
  Alert,
  BackHandler
} from "react-native";
import { NavigationScreenProps } from "react-navigation";
import {
  PatientModel,
  RequestPatientModel,
  PatientFindModel,
  MANAGE_KIND
} from "@src/core/model";
import { PatientsOutHospital } from "./patientsOutHospital.component";

import { httpHelper } from "@src/core/utils/httpHelper";
import commonStyle from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { PersonAddIconFill } from "@src/assets/icons";
import { PatientsOutHospitalAddModal } from "./patientsOutHospitalAdd.modal";
import Modal from "react-native-modal";
import BackgroundJob from "react-native-background-job";
interface State {
  data: PatientModel[] | undefined;
  isLoading: boolean;
  isModalVisible: boolean;
}
interface ComponentProps {
  pInfo?: PatientModel | undefined;
}

type Props = NavigationScreenProps & ComponentProps;
export class PatientsOutHospitalScreen extends React.Component<Props, State> {
  private addModalId: string;
  private _keyword: string;
  private isUpdating = false;

  constructor(props: NavigationScreenProps) {
    super(props);
    this.state = {
      data: [],
      isLoading: false,
      isModalVisible: false
    };
  }

  componentDidMount() {
    // this.updateData();
  }
  onTopRightPress = () => {
    // this.setState({ isModalVisible: true });
    const xpath = "Inhospital Manage";
    // if (GLOBAL.curUser) {
    //   database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    // }
    this.props.navigation.navigate(xpath, {
      kind: MANAGE_KIND.ADD
    });
  };

  private procModalClose = () => {
    this.addModalId = undefined;
  };
  private procModalOK = (findInfo: PatientFindModel) => {
    this.setState({ isModalVisible: false });

    // this.updateData();
  };

  componentWillMount() {
    this.setNavigationParams();
  }

  private setNavigationParams() {
    const onRightPress = this.onTopRightPress;
    this.props.navigation.setParams({
      onRightPress,
      rightIcon: PersonAddIconFill
    });
  }
  private onGoBack = (beUpdate: boolean) => {
    if (beUpdate) {
      // this.setState({ isLoading: true });
      this.props.navigation.goBack();
      // this.updateData();
    }
  };
  private updateData = () => {
    if (this.isUpdating) return;
    this.isUpdating = true;
    const that = this;
    this.setState({ isLoading: true });

    const reqParam: RequestPatientModel = { patient: { is_in: 0 } };
    if (this._keyword) {
      reqParam.patient.name = this._keyword;
      // reqParam.patient.mobile = this._keyword;
    }
    BackgroundJob.cancelAll();

    httpHelper.downloadPatients(reqParam)
      .then(responseJson => {
        if (responseJson.result) {
          this.setState({ data: responseJson.result, isLoading: false });
          this.isUpdating = false;
          // GLOBAL.startBackgroundJobs();
        } else {
          this.setState({ data: [], isLoading: false });
          this.isUpdating = false;
        }
        GLOBAL.startBackgroundJobs();
      })
      .catch(exception => {
        this.setState({ data: [], isLoading: false });
        GLOBAL.startBackgroundJobs();
      });
    this.isUpdating = false;
  };

  private onItemSelect = (item: PatientModel) => {
    GLOBAL.curPatient = item;
    this.props.navigation.navigate("Inhospital Manage", {
      kind: MANAGE_KIND.IN,
      onGoBack: this.onGoBack,
    });
  };
  private onSearchPPress = (keyword: string) => {
    this._keyword = keyword;
    this.updateData();
  };

  render() {
    return this.state.isLoading ? (
      <View style={commonStyle.progressBar}>
        <ProgressBar />
      </View>
    ) : (
        <View style={commonStyle.container}>
          <Modal
            isVisible={this.state.isModalVisible}
            onBackdropPress={() => this.setState({ isModalVisible: false })}
            onSwipeComplete={() => this.setState({ isModalVisible: false })}
            onBackButtonPress={() => this.setState({ isModalVisible: false })}
            swipeDirection="left"
          >
            <PatientsOutHospitalAddModal
              onOK={this.procModalOK}
              onRequestClose={this.procModalClose}
            />
          </Modal>
          <PatientsOutHospital
            data={this.state.data}
            onItemSelect={this.onItemSelect}
            onSearchPress={this.onSearchPPress}
          />
        </View>
      );
  }
}
