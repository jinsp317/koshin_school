import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { MANAGE_KIND, TestDataModel } from "@src/core/model";
import { TestResult } from "./testResult.component";

import { httpHelper } from "@src/core/utils/httpHelper";
import commonStyles from "@src/containers/styles/common";
import ProgressBar from "@src/components/common/progressBar.component";
import * as UTILS from "@src/core/app_utils";
import GLOBAL from "@src/core/globals";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";

interface State {
  isLoading: boolean;
}
interface ComponentProps {
  kind?: MANAGE_KIND;
}

type Props = NavigationScreenProps & ComponentProps;
export class TestResultScreen extends React.Component<Props, State> {
  constructor(props: NavigationScreenProps) {
    super(props);
    this.state = {
      isLoading: false
    };

    GLOBAL.curTestQuality.department_id = GLOBAL.curUser.department_id;
    GLOBAL.curTestQuality.user_id = GLOBAL.curUser.id;
    GLOBAL.curTestQuality.value = 0;
    GLOBAL.curTestQuality.result_type = 0;
    GLOBAL.curTestQuality.memo = undefined;
    GLOBAL.curTestQuality.use_number = 1;
    GLOBAL.curTestQuality.device_number = GLOBAL.curDevice.type === 0 ? GLOBAL.curDevice.name : GLOBAL.curDevice.otg_sn;
  }
  componentWillMount() {
    GLOBAL.curTestQuality.value = this.props.navigation.getParam("value", undefined);
    /*
    GLOBAL.curTestQuality.result_type =
      GLOBAL.curTestQuality.value > GLOBAL.curTestQuality.max ||
      GLOBAL.curTestQuality.value < GLOBAL.curTestQuality.min
        ? 0
        : 1;
      */
  }
  componentDidMount() {
    this.updateData();
  }

  private updateData = () => { };

  private onSave = (data: TestDataModel, kind: MANAGE_KIND) => {
    this.setState({ isLoading: true });

    GLOBAL.curTestQuality = { ...data };
    asyncStorageHelper.setTestQuality();

    let formData = new FormData();
    formData.append("department_id", data.department_id);
    formData.append("user_id", data.user_id);
    formData.append("device_number", data.device_number);
    formData.append("paper_number", data.paper_number);
    formData.append("liquid_number", data.liquid_number);
    formData.append("liquid_type", data.liquid_type);
    formData.append("min", data.min);
    formData.append("max", data.max);
    formData.append("value", data.value);
    const result_type = data.result_type == 1 ? 1 : 2;
    //UTILS.alert("" + result_type);
    formData.append("result_type", result_type);
    if (data.memo) formData.append("memo", data.memo);
    formData.append("use_number", data.use_number);

    formData.append("time", data.time);

    httpHelper
      .manageTestData(formData, kind)
      .then(response => {
        if (response.success) {
          UTILS.showToast(Strings.message.op_success);
          //if (kind === MANAGE_KIND.DEL)
          const { navigation } = this.props;

          if (navigation.state.routeName === "Daily Test Result") {
            const route = "MainNavigator";
            if (GLOBAL.curDailyTest.target_kind === 1) {
              if (data.result_type === 1) {
                if (GLOBAL.curUser) {
                  database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: route });
                }
                navigation.navigate(route);
              }
            } else {
              if (GLOBAL.curUser) {
                database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: route });
              }
              navigation.navigate(route);
            }
          } else {
            navigation.replace("Setting Container");
          }
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
        <TestResult
          onSave={this.onSave}
          data={{ ...GLOBAL.curTestQuality }}
          isLoading={this.state.isLoading}
        />
      </View>
    );
  }
}
