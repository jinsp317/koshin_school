import Strings from "@src/assets/strings";
import React from "react";
import { View, ImageSourcePropType, Alert, ScrollView } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import ImageButton from "@src/components/common/imageButton";
import {
  ThemeProvider,
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Text, Input, InputProps } from "@src/core/react-native-ui-kitten/ui";
import { textStyle } from "@src/components/common";
import { themes } from "@src/core/themes";
import { CloudDownloadIconFill, WifiIconFill } from "@src/assets/icons";
import GLOBAL from "@src/core/globals";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import { httpHelper } from "@src/core/utils/httpHelper";
import * as UTILS from "@src/core/app_utils";
interface State {
  cloudClicked: boolean;
  hospital_num: string;
  server_ip: string;
  // lan_server_ip: string;
}
export type SetAppInfoProps = ThemedComponentProps & NavigationScreenProps;
class SetAppInfoScreenComponent extends React.Component<SetAppInfoProps, State> {
  constructor(props: SetAppInfoProps) {
    super(props);
    this.state = {
      cloudClicked: GLOBAL.server_mode === 0,
      hospital_num: GLOBAL.hospital_num.toString(),
      server_ip: GLOBAL.lan_server_ip
      /*,
      lan_server_ip: GLOBAL.lan_server_ip*/
    };
  }
  componentDidMount() {
    if (asyncStorageHelper.getConfigInfos()) {
      if (__DEV__) console.info(GLOBAL.server_mode);
      this.setState({ cloudClicked: GLOBAL.server_mode == 0, hospital_num: GLOBAL.hospital_num.toString(), server_ip: GLOBAL.lan_server_ip });
    }
  }
  private onCloudPress = () => {
    GLOBAL.server_mode = 0;
    this.setState({ cloudClicked: true });
    asyncStorageHelper.setConfigInfos();
  };
  private onLanPress = () => {
    GLOBAL.server_mode = 1;
    this.setState({ cloudClicked: false });
    asyncStorageHelper.setConfigInfos();
  };
  private onModifyPress = () => {
    GLOBAL.server_mode = this.state.cloudClicked ? 0 : 1;
    if (this.state.cloudClicked) {
      if (this.state.hospital_num) {
        GLOBAL.hospital_num = Number(this.state.hospital_num);
        asyncStorageHelper.setConfigInfos().then(this.postProcModify);
      }
    } else {
      /*
      if (this.state.lan_server_ip) {
        GLOBAL.lan_server_ip = this.state.lan_server_ip;
        asyncStorageHelper.setConfigInfos().then(this.postProcModify);
      }
      */
      if (this.state.server_ip) {
        GLOBAL.lan_server_ip = this.state.server_ip;
        asyncStorageHelper.setConfigInfos().then(this.postProcModify);
      }
    }
  };

  private postProcModify = () => {
    GLOBAL.server_ip = GLOBAL.server_mode === 0 ? GLOBAL.cloud_server_ip : GLOBAL.lan_server_ip;

    httpHelper.setServerURL(GLOBAL.server_ip);
    UTILS.showToast(Strings.common.str_opSuccess);
  };

  private getImgSrc = (isEnabled: boolean, isCloud: boolean) => {
    let imgSrc: ImageSourcePropType;
    if (isEnabled) {
      if (isCloud) imgSrc = require("@src/assets/icons/app/cloud_enabled.png");
      else imgSrc = require("@src/assets/icons/app/lan_disabled.png");
    } else {
      if (isCloud) imgSrc = require("@src/assets/icons/app/cloud_disabled.png");
      else imgSrc = require("@src/assets/icons/app/lan_enabled.png");
    }
    return imgSrc;
  };

  private onHospitalNumChange = (value: string) => {
    this.setState({ hospital_num: value });
  };
  private onServerIpChange = (value: string) => {
    this.setState({ server_ip: value });
    // this.setState({ lan_server_ip: value });
  };
  private renderConfigInfo = () => {
    const { themedStyle } = this.props;
    if (this.state.cloudClicked) {
      return (
        <View style={themedStyle.inputConfigContainer}>
          {/**
          <Input
            placeholder={Strings.menu.config_inputHospitalNum}
            icon={CloudDownloadIconFill}
            value={this.state.hospital_num}
            onChangeText={this.onHospitalNumChange}
            keyboardType={"numeric"}
          />
   */}

          <View style={{ flexDirection: "row" }}>
            <Button
              size="giant"
              onPress={this.onModifyPress}
              style={themedStyle.modifyBtn}

            /// appearance="outline"
            >
              {Strings.common.str_modify}
            </Button>
          </View>
        </View>
      );
    } else {
      return (
        <View style={themedStyle.inputConfigContainer}>
          <Input
            placeholder={Strings.menu.config_inputLanAddress}
            icon={WifiIconFill}
            value={this.state.server_ip}
            // value={this.state.lan_server_ip}
            onChangeText={this.onServerIpChange}
            keyboardType={"numeric"}
          />
          <View style={{ flexDirection: "row" }}>
            <Button
              size="giant"
              onPress={this.onModifyPress}
              style={themedStyle.modifyBtn}
            // appearance="outline"
            >
              {Strings.common.str_modify}
            </Button>
          </View>
        </View>
      );
    }
  };
  public render(): React.ReactNode {
    const btnSize: number = 100;
    const { themedStyle, ...restProps } = this.props;
    return (
      <ThemeProvider theme={{ ...this.props.theme, ...themes["App Theme"] }}>
        <ScrollView keyboardShouldPersistTaps="always" keyboardDismissMode={"interactive"}>
          <View style={themedStyle.container}>
            <ImageButton onPress={this.onCloudPress}
              imgSrc={this.getImgSrc(this.state.cloudClicked, true)}
              width={btnSize}
              height={btnSize}
            />
            <Text style={themedStyle.textCaption}>{Strings.menu.config_cloudVersion}</Text>
            <ImageButton
              onPress={this.onLanPress}
              imgSrc={this.getImgSrc(this.state.cloudClicked, false)}
              width={btnSize}
              height={btnSize}
            />
            <Text style={themedStyle.textCaption}>{Strings.menu.config_lanVersion}</Text>
            {this.renderConfigInfo()}
          </View>
        </ScrollView>
      </ThemeProvider>
    );
  }
}

export const SetAppInfoScreen = withStyles(SetAppInfoScreenComponent, (theme: ThemeType) => {
  return {
    container: {
      zIndex: 1,
      justifyContent: "space-between",
      alignItems: "center",
      padding: 24,
      marginTop: 20
    },
    inputConfigContainer: {
      // flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: 20
    },
    modifyBtn: {
      flex: 1,
      marginVertical: 15,
      // width: 80,
      // borderRadius: 10,
      borderWidth: 1
    },
    textCaption: {
      color: themes["color-primary-400"],
      marginVertical: 15,
      ...textStyle.subtitle
    }
  };
});
