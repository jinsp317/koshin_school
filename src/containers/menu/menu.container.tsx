import React from "react";
import { NavigationScreenProps } from "react-navigation";
import { Menu } from "./menu.component";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import Strings from "@src/assets/strings";
import { database } from "@src/core/utils/database";
export class MenuContainer extends React.Component<NavigationScreenProps> {
  private onTabSelect = (index: number) => {
    if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) {
      if (__DEV__) {
        console.info("GLOBAL.curUser.hospital_id=", GLOBAL.curUser.hospital_id);
        console.info("GLOBAL.curHospitalId=", GLOBAL.curHospitalId);
      }

      if (index > 0) {
        UTILS.showToast(Strings.message.warning_noPrivillage);
        return;
      }
    }

    const { navigation } = this.props;
    const { [index]: selectedRoute } = navigation.state.routes;
    // const xpath = "MainNavigator";
    if (GLOBAL.curUser) {
      database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: selectedRoute.routeName });
    }
    navigation.navigate(selectedRoute.routeName);
  };

  public render(): React.ReactNode {
    return (
      <Menu selectedIndex={this.props.navigation.state.index} onTabSelect={this.onTabSelect} />
    );
  }
}
