import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, Alert, ToastAndroid, ActivityIndicator } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { TestGlucose } from "./testGlucose.component";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import * as UTILS from "@src/core/app_utils";
import { TestRangeModel } from "@src/core/model";
import { httpHelper } from "@src/core/utils/httpHelper";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import BackgroundJob from "react-native-background-job";

interface State {
  isReady: boolean;
  uploadOk: boolean;
  pauseMeasure: boolean;
  needInit: boolean;
  errorDevice: boolean;
}

export class TestGlucoseScreen extends React.Component<NavigationScreenProps, State> {
  private focusListener: any;
  constructor(props, ctx) {
    super(props, ctx);

    this.state = {
      isReady: true,
      uploadOk: true,
      pauseMeasure: false,
      needInit: false,
      errorDevice: false
    };
  }
  // ** for use baidu ocr*/
  componentDidMount() {
    BackgroundJob.cancelAll();
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      // The screen is focused
      // Call any action
      // console.log("focus screen");
      const errorDevice =
        GLOBAL.curDevice.type > 0 ? false : GLOBAL.curDevice.id == undefined ? true : false;
      this.setState({ errorDevice });
    });
  }
  componentWillUnmount() {
    this.focusListener && this.focusListener.remove();
    GLOBAL.startBackgroundJobs();
  }
  componentWillReceiveProps(nextProps: NavigationScreenProps) { }
  componentWillMount() {
    this.setNavigationParams();
  }

  private setNavigationParams() { }

  private onSavePress = (glucoseVal: number) => {
    const route = this.props.navigation.state.routeName === "Daily Test Glucose"
      ? "Daily Test Result"
      : "Test Result";
    if (GLOBAL.isOffline) this.goReuslt(route, glucoseVal);
    else {
      httpHelper
        .downloadTestRange()
        .then(response => {
          if (response.result) {
            GLOBAL.curTestRange = response.result;
            asyncStorageHelper.setCommonInfos();
          } else {
          }
          this.goReuslt(route, glucoseVal);
        })
        .catch(e => {
          this.goReuslt(route, glucoseVal);
        });
    }

    return;
  };
  private goReuslt = (route: string, value: number) => {
    this.props.navigation.replace(route, { value: value });
  };
  private onProcNeedInit = (needInit: boolean) => {
    this.setState({ needInit });
  };

  render() {
    return (
      <View style={commonStyles.container}>
        <TestGlucose
          errorDevice={this.state.errorDevice}
          isLoading={!this.state.isReady}
          onSavePress={this.onSavePress}
          pauseMeasure={this.state.pauseMeasure}
          needInit={this.state.needInit}
          onNeedInit={this.onProcNeedInit}
        />
      </View>
    );
  }
}
