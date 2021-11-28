import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableOpacityProps,
  ToastAndroid
} from "react-native";
import { ThemeType, withStyles, ThemedComponentProps } from "@src/core/react-native-ui-kitten/theme";
import { Toggle, Text, Button } from "@src/core/react-native-ui-kitten/ui";
import {
  ContainerView,
  textStyle,
  ValidationInput
} from "@src/components/common";
import { ProfileSetting } from "@src/components/social";
import GLOBAL from "@src/core/globals";
import { StringValidator } from "@src/core/validators";
import * as UTILS from "@src/core/app_utils";

interface ComponentProps {
  onSavePress: (newPassword: string) => void;
}
interface State {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export type SettingsProps = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<SettingsProps, State> {
  public state: State = {
    oldPassword: undefined,
    newPassword: undefined,
    confirmPassword: undefined
  };

  private onSavePress = () => {
    const { oldPassword, newPassword, confirmPassword } = this.state;
    if (!newPassword || !confirmPassword) {
      UTILS.showToast(Strings.message.warning_invalidPassword);
      return;
    }
    if (newPassword !== confirmPassword) {
      UTILS.showToast(Strings.message.warning_nomatchNewPassword);
      return;
    }
    if (newPassword.length < 5) {
      UTILS.showToast(Strings.message.warning_invalidPassword);
      return;
    }
    if (oldPassword !== GLOBAL.curUser.password) {
      UTILS.showToast(Strings.message.warning_errorPassword);
    }
    this.props.onSavePress(this.state.newPassword);
  };
  private onNewPasswordChange = (value: string) => {
    this.setState({ newPassword: value });
  };
  private onOldPasswordChange = (value: string) => {
    this.setState({ oldPassword: value });
  };
  private onConfirmPasswordChange = (value: string) => {
    this.setState({ confirmPassword: value });
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <ContainerView style={themedStyle.container}>
        <ValidationInput
          placeholder={Strings.message.input_oldPassword}
          validator={StringValidator}
          onChangeText={this.onOldPasswordChange}
          value={this.state.oldPassword}
          maxLength={20}
        />
        <ValidationInput
          placeholder={Strings.message.input_newPassword}
          validator={StringValidator}
          onChangeText={this.onNewPasswordChange}
          value={this.state.newPassword}
          maxLength={20}
        />
        <ValidationInput
          placeholder={Strings.message.input_confirmPassword}
          validator={StringValidator}
          onChangeText={this.onConfirmPasswordChange}
          value={this.state.confirmPassword}
          maxLength={20}
        />
        <View style={{ height: 10 }}></View>
        <Button size="giant" onPress={this.onSavePress}>
          {Strings.common.str_changePassword}
        </Button>
      </ContainerView>
    );
  }
}

export const ChangePassword = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"],
    padding: 8
  }
}));
