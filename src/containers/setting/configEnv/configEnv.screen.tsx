import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { database } from "@src/core/utils/database";
import {
  GlucoseMonitorModel,
  RequestGlucoseMonitorModel,
  PatientModel,
  MANAGE_KIND
} from "@src/core/model";
import { ConfigEnv } from "./configEnv.component";
import commonStyles from "@src/containers/styles/common";
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
export class ConfigEnvScreen extends React.Component<Props, State> {
  constructor(props: NavigationScreenProps) {
    super(props);
    this.state = { isLoading: false };
  }
  componentWillMount() { }
  componentWillReceiveProps(nextProps: Props) { }
  componentDidMount() {
    this.updateData();
  }

  private updateData = () => { };

  private onSave = () => {
    asyncStorageHelper.setConfigAppEnv()
      .then(success => {
        success
          ? UTILS.showToast(Strings.common.str_opSuccess)
          : UTILS.showToast(Strings.common.str_opFailed);
        if (success) this.props.navigation.goBack(null);
      })
      .catch(e => {
        UTILS.showToast(Strings.common.str_opFailed);
      });
  };
  private onDailyTestPress = () => {
    const xpath = "Set DailyTest";
    if (GLOBAL.curUser) {
      database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    }
    this.props.navigation.navigate(xpath);
  };
  private uploadData = (pInfo: PatientModel) => { };

  render() {
    return (
      <View style={commonStyles.container}>
        <ConfigEnv
          onSave={this.onSave}
          navigation={this.props.navigation}
          onDailyTestPress={this.onDailyTestPress}
        />
      </View>
    );
  }
}
