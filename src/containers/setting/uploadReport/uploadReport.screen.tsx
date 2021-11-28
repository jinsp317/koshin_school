import React from "react";
import { NavigationScreenProps } from "react-navigation";
import { httpHelper } from "@src/core/utils/httpHelper";
import GLOBAL from "@src/core/globals";
import { UploadReport } from "./uploadReport.component";

export class UploadReportScreen extends React.Component<NavigationScreenProps> {
  private onSignOutPress = () => {
    GLOBAL.isSignOut = true;
    httpHelper
      .logout()
      .then(responseJson => {
        if (responseJson.success) {
          this.props.navigation.navigate("FirstNavigator");
        } else {
          if (__DEV__) console.info("failed to logout");
          this.props.navigation.navigate("FirstNavigator");
        }
      })
      .catch(exception => {
        if (__DEV__) console.error(exception);
        this.props.navigation.navigate("FirstNavigator");
      });
  };

  public render(): React.ReactNode {
    return <UploadReport onSignOutPress={this.onSignOutPress} />;
  }
}
