import React from "react";
import { NavigationScreenProps } from "react-navigation";
import { SwitchUser } from "./switchUser.component";
import { httpHelper } from "@src/core/utils/httpHelper";
import GLOBAL from "@src/core/globals";

export class SwitchUserScreen extends React.Component<NavigationScreenProps> {
  private onItemPress = () => {
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

  private onSignOutPress = () => {
    GLOBAL.isOtherLogin = true;
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
        if (__DEV__) console.info(exception);
        this.props.navigation.navigate("FirstNavigator");
      });
  };

  public render(): React.ReactNode {
    return <SwitchUser onItemPress={this.onItemPress} onSignOutPress={this.onSignOutPress} />;
  }
}
