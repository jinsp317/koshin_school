import React from "react";
import { NavigationScreenProps } from "react-navigation";
import { httpHelper } from "@src/core/utils/httpHelper";
import GLOBAL from "@src/core/globals";
import { ChangePassword } from "./changePassword.component";
import { MANAGE_KIND } from "@src/core/model";
import Strings from "@src/assets/strings";
import * as UTILS from "@src/core/app_utils";
export class ChangePasswordScreen extends React.Component<
  NavigationScreenProps
  > {
  private onSavePress = (newPassword: string) => {
    const formdata = new FormData();
    formdata.append("id", GLOBAL.curUser.id);
    formdata.append("name", GLOBAL.curUser.name);
    formdata.append("password", newPassword);

    httpHelper
      .manageUser(formdata, MANAGE_KIND.MODIFY)
      .then(responseJson => {
        if (responseJson.success) {
          UTILS.showToast(Strings.common.str_opSuccess);
          GLOBAL.curUser.password = newPassword;
          this.props.navigation.goBack(null);
        } else {
          UTILS.showToast(Strings.common.str_opFailed);
        }
      })
      .catch(exception => {
        if (__DEV__) console.error(exception);
        UTILS.showToast(Strings.common.str_opFailed);
      });
  };

  public render(): React.ReactNode {
    return <ChangePassword onSavePress={this.onSavePress} />;
  }
}
