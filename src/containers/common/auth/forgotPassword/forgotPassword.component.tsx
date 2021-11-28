import React from "react";
import { View } from "react-native";
import { ThemedComponentProps, ThemeType, withStyles } from "@src/core/react-native-ui-kitten/theme";
import { Button, Text } from "@src/core/react-native-ui-kitten/ui";
import {
  ForgotPasswordForm,
  ForgotPasswordFormData
} from "@src/components/auth";
import {
  ScrollableAvoidKeyboard,
  ImageOverlay,
  textStyle
} from "@src/components/common";
import { ImageSource } from "@src/assets/images";
import Strings from "@src/assets/strings";

interface ComponentProps {
  onResetPress: (formData: ForgotPasswordFormData) => void;
}

export type ForgotPasswordProps = ThemedComponentProps & ComponentProps;

interface State {
  formData: ForgotPasswordFormData | undefined;
}

class ForgotPasswordComponent extends React.Component<
  ForgotPasswordProps,
  State
> {
  public state: State = {
    formData: undefined
  };

  private onFormDataChange = (formData: ForgotPasswordFormData) => {
    this.setState({ formData });
  };

  private onResetPasswordButtonPress = () => {
    this.props.onResetPress(this.state.formData);
  };

  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <ScrollableAvoidKeyboard>
        <View style={themedStyle.container}>
          <Text
            style={themedStyle.forgotPasswordLabel}
            appearance="alternative"
            category="h4"
          >
            Forgot Password
          </Text>
          <Text style={themedStyle.enterEmailLabel} appearance="alternative">
            Please enter your email address
          </Text>
          <ForgotPasswordForm
            style={themedStyle.formContainer}
            onDataChange={this.onFormDataChange}
          />
          <Button
            style={themedStyle.resetButton}
            textStyle={textStyle.button}
            size="giant"
            disabled={!this.state.formData}
            onPress={this.onResetPasswordButtonPress}
          >
            {Strings.common.str_ok}
          </Button>
        </View>
      </ScrollableAvoidKeyboard>
    );
  }
}

export const ForgotPassword = withStyles(
  ForgotPasswordComponent,
  (theme: ThemeType) => ({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 24
    },
    formContainer: {
      flex: 1,
      justifyContent: "space-between",
      marginTop: 24
    },
    forgotPasswordLabel: {
      alignSelf: "center",
      marginTop: 24,
      color: theme["color-primary-500"],
      ...textStyle.headline
    },
    enterEmailLabel: {
      alignSelf: "center",
      marginTop: 64,
      color: theme["color-primary-500"],
      ...textStyle.subtitle
    },
    resetButton: {}
  })
);
