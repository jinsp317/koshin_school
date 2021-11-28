import Strings from "@src/assets/strings";
import React from "react";
import {
  ThemeProvider,
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Text, CheckBox } from "@src/core/react-native-ui-kitten/ui";
import { SignInForm2, SignInForm2Data } from "./signInForm2";
import { ScrollableAvoidKeyboard, textStyle } from "@src/components/common";
import { View, Image, Alert, EmitterSubscription, NativeModules, DeviceEventEmitter } from "react-native";
import { themes } from "@src/core/themes";
import { imageIsensLogo } from "@src/assets/images";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import { UserModel } from '@src/core/model';
const BluetoothChat = NativeModules.BluetoothIOModule;
const { EventOnDataRx, EventOnStateChange, EventOnBluetoothStateChange } = BluetoothChat.getConstants();

/*
bluetooth server에 대한 로그인 모듈을 새로 구성한다.
1. login 
*/
interface ComponentProps {
  onSignInPress: (formData: SignInForm2Data) => void;
  onSaveInfoChanged: (isSave: boolean) => void;
  onCheckVersionPress: () => void;
  onForgotPasswordPress: () => void;
  onConfigPress: () => void;
  onBlueToothPress: () => void;
  onSetWifiPress: () => void;
  onSaveUsingBluetooth: (bUsing: boolean) => void;
  defFormData: SignInForm2Data;
  usingBluetoothServer: boolean;
  bluetoothCommState: boolean;
  isSaveInfo: boolean;
  users: UserModel[];
  signMode: number;
}

export type SignIn2Props = ThemedComponentProps & ComponentProps;

interface State {
  formData: SignInForm2Data | undefined;
  usingBluetoothServer: boolean;
  bluetoothCommState: boolean;
  savePswd: boolean;
}

class SignIn2Component extends React.Component<SignIn2Props> {
  private onDeviceFoundEvent: EmitterSubscription;
  private onStatusChangeEvent: EmitterSubscription;
  private onDataReadEvent: EmitterSubscription;
  private dataListener: EmitterSubscription;
  constructor(props: SignIn2Props) {
    super(props);
    this.state = {
      formData: props.defFormData,
      usingBluetoothServer: props.usingBluetoothServer,
      bluetoothCommState: props.bluetoothCommState,
      savePswd: props.isSaveInfo
    };
    this.dataListener = undefined;
  }
  public state: State = {
    formData: undefined,
    savePswd: false
  };

  private onSignInButtonPress = () => {
    const data = this.state.formData ? this.state.formData : this.props.defFormData;

    if (data) {
      if (!data.username) {
        UTILS.alert(Strings.menu.signin_input_user);
        return;
      }
      if (!data.password) {
        UTILS.alert(Strings.menu.signin_input_password);
        return;
      }
    } else {
      UTILS.alert(Strings.menu.signin_input_userInfo);
      return;
    }
    this.props.onSignInPress(this.state.formData);
  };

  private onCheckVersionPress = () => {
    this.props.onCheckVersionPress();
  };

  private onForgotPasswordButtonPress = () => {
    this.props.onForgotPasswordPress();
  };

  private onSavePassworddButtonPress = (savePswd: boolean) => {
    this.setState({ savePswd });
    this.props.onSaveInfoChanged(savePswd);
  };

  private onFormDataChange = (formData: SignInForm2Data) => {
    this.setState({ formData });
  };

  private onConfigButtonPress = () => {
    this.props.onConfigPress();
  };
  private onBlueToothCheck = () => {
    this.props.onBlueToothPress();
  }
  private onUsingBluetoothServerPress = (bBluetooth: boolean) => {
    this.setState({ usingBluetoothServer: bBluetooth });
    this.props.onSaveUsingBluetooth(bBluetooth);
  }
  private onSetWifiButtonPress = () => {
    this.props.onSetWifiPress();
  }
  private onUserNameIconPress = () => {
    Alert.alert("hello my son");
  }
  private onPasswordIconPress = () => { }
  private onUserListItemPress = (nick: string) => {
    // Alert.alert(nick);
  }
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <ThemeProvider theme={{ ...this.props.theme, ...themes["App Theme"] }}>
        <ScrollableAvoidKeyboard
          style={themedStyle.container}
          contentContainerStyle={themedStyle.contentcontaner}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode={"interactive"}
        >
          <View style={themedStyle.headerBar}>
            <Button size="small" appearance="outline" status="primary"
              onPress={this.onConfigButtonPress}
              style={themedStyle.configButton}
            >
              {Strings.menu.signin_config_version}
            </Button>
          </View>
          <View style={themedStyle.headerContainer}>
            <Image source={imageIsensLogo.imageSource}
              style={{ width: 120, height: 90 }}
              resizeMode="stretch"
            />
            <Text style={themedStyle.signInLabel} category="h6">
              {Strings.common.app_subname}
            </Text>
          </View>
          <SignInForm2 style={themedStyle.formContainer}
            onForgotPasswordPress={this.onForgotPasswordButtonPress}
            onDataChange={this.onFormDataChange}
            defFormData={this.props.defFormData}
            onUserNameIconPress={this.onUserNameIconPress}
            onPasswordIconPress={this.onPasswordIconPress}
            onListItemPress={nick => this.onUserListItemPress(nick)}
            users={this.props.users}
            signinMode={this.props.signMode}
          />
          <Button style={themedStyle.signInButton}
            textStyle={textStyle.button}
            size="giant"
            disabled={this.state.usingBluetoothServer && !this.props.bluetoothCommState}
            // disabled={!this.state.formData}
            onPress={this.onSignInButtonPress}
          >
            {Strings.menu.signin_signin}
          </Button>
          <View style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between"
          }}
          >
            <CheckBox style={themedStyle.savePswdCheckBox}
              textStyle={themedStyle.savePswdCheckBoxText}
              checked={this.state.savePswd}
              onChange={this.onSavePassworddButtonPress}
              text={Strings.menu.signin_remember_password}
            />
            <Button style={themedStyle.savePswdCheckBox}
              textStyle={themedStyle.savePswdCheckBoxText}
              appearance="ghost"
              activeOpacity={0.75}
              onPress={this.onSetWifiButtonPress}
            >
              {Strings.menu.signin_set_wifi}
            </Button>
          </View>
          <View style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between"
          }}
          >
            <CheckBox style={themedStyle.savePswdCheckBox}
              textStyle={themedStyle.savePswdCheckBoxText}
              checked={this.state.usingBluetoothServer}
              onChange={this.onUsingBluetoothServerPress}
              text={Strings.menu.using_bluetooth_server}
            />
            <Button style={themedStyle.savePswdCheckBox}
              textStyle={themedStyle.signUpText}
              appearance="ghost"
              activeOpacity={0.75}
              onPress={this.onBlueToothCheck}
            >
              {`蓝牙设定 `}
            </Button>
          </View>
          <Button
            style={themedStyle.signUpButton}
            textStyle={themedStyle.signUpText}
            appearance="ghost"
            activeOpacity={0.75}
            onPress={this.onCheckVersionPress}
          >
            {`V ${GLOBAL.versionInfo.name}`}
          </Button>

        </ScrollableAvoidKeyboard>
      </ThemeProvider>
    );
  }
}

export const SignIn = withStyles(SignIn2Component, (theme: ThemeType) => {
  return {
    contentcontaner: {
      alignItems: "stretch"
    },
    container: {
      flex: 1
      // backgroundColor: '#ff2f00',//theme['background-basic-color-1']'',
    },
    headerContainer: {
      justifyContent: "center",
      alignItems: "center",
      minHeight: 136,
      backgroundColor: "white"
    },
    formContainer: {
      flex: 1,
      marginTop: 32,
      paddingHorizontal: 16
    },
    helloLabel: {
      color: theme["color-primary-default"],
      ...textStyle.headline
    },
    signInLabel: {
      marginTop: 20,
      color: theme["text-hint-color"],
      ...textStyle.subtitle
    },
    signInButton: {
      marginHorizontal: 16
    },
    signUpButton: {
      marginVertical: 6
      // width: 200,
    },
    signUpText: {
      color: theme["text-hint-color"],
      ...textStyle.subtitle
    },
    savePswdCheckBox: {
      color: theme["text-hint-color"],
      marginVertical: 2,
      marginHorizontal: 13
    },
    configButton: {
      marginHorizontal: 16,
      borderWidth: 1,
      borderRadius: 15
    },
    configText: {
      color: "white",
      ...textStyle.subtitle
    },
    headerBar: {
      paddingTop: 10,
      justifyContent: "center",
      alignItems: "flex-end",
      backgroundColor: "white"
    },
    savePswdCheckBoxText: {
      color: theme["text-hint-color"]
    }
  };
});
