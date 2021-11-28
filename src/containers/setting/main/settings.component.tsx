import Strings from "@src/assets/strings";
import React from "react";
import { View, TouchableOpacity, TouchableOpacityProps } from "react-native";
import {
  ThemeType,
  withStyles,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { Toggle, Text, Button } from "@src/core/react-native-ui-kitten/ui";
import { ContainerView, textStyle } from "@src/components/common";
import { ProfileSetting } from "@src/components/social";
import GLOBAL from "@src/core/globals";

interface ComponentProps {
  onItemPress: (index: number) => void;
  onSignOutPress: () => void;
  onSwitchUserPress: () => void;
  isSynWait: boolean;
}
interface State {
  curHospitalMode: number;
}
export type SettingsProps = ThemedComponentProps & ComponentProps;

class SettingsComponent extends React.Component<SettingsProps> {
  public state: State = {
    curHospitalMode: GLOBAL.curHospitalMode
  };
  private onEditProfilePress = () => {
    // TODO: //aaa
    // FIXME: ddd
    // this.props.onEditProfilePress();
  };

  private onSignOutPress = () => {
    this.props.onSignOutPress();
  };

  private onSwitchUserPress = () => {
    this.props.onSwitchUserPress();
  };

  private onSwitchMode = () => {
    GLOBAL.curHospitalMode = GLOBAL.curHospitalMode == 0 ? 1 : 0;
    this.setState({ curHospitalMode: GLOBAL.curHospitalMode });
    this.props.onItemPress(9);
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <ContainerView style={themedStyle.container}>
        <View style={themedStyle.infoSection}>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(0)}>
            <ProfileSetting
              hideRightIcon={true}
              style={themedStyle.profileSetting}
              hint={Strings.common.str_name}
              value={`${GLOBAL.curUser.name} (${GLOBAL.curUser.nick})`}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(1)}>
            <ProfileSetting
              style={themedStyle.profileSetting}
              hint={Strings.menu.setting_password}
              value={""}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(2)}>
            <ProfileSetting
              style={themedStyle.profileSetting}
              showLeftIcons={GLOBAL.versionUp}
              hint={Strings.menu.setting_checkVersion}
              value={GLOBAL.versionInfo.name}
            />
          </Section>
          {
            (!this.props.isSynWait) && (
              <Section style={themedStyle.section} onPress={() => this.props.onItemPress(10)}>
                <ProfileSetting
                  style={themedStyle.profileSetting}
                  hint={Strings.menu.setting_checkSyn}
                  value={'重新加载数据'}
                />
              </Section>
            )
          }
          <Section style={themedStyle.section} onPress={() => {
            // if (this.props.isSynWait) return;
            this.props.onItemPress(3);
          }}>
            <ProfileSetting
              style={themedStyle.profileSetting}
              hint={Strings.menu.setting_shareApp}
              value={""}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(5)}>
            <ProfileSetting
              style={themedStyle.profileSetting}
              hint={Strings.menu.setting_pairDevice}
              value={""}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(6)}>
            <ProfileSetting
              style={themedStyle.profileSetting}
              hint={Strings.menu.setting_help}
              value={""}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(7)}>
            <ProfileSetting
              style={themedStyle.profileSetting}
              hint={Strings.menu.setting_configEnv}
              value={""}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(4)}>
            <ProfileSetting
              style={themedStyle.profileSetting}
              hint={Strings.menu.setting_quailityTest}
              value={""}
            />
          </Section>
          <Section style={themedStyle.section} onPress={() => this.props.onItemPress(9)}>
            <ProfileSetting
              style={themedStyle.profileSetting}
              hint={Strings.menu.setting_customMenu}
              value={""}
            />
          </Section>

          {/**

          <Section
            style={themedStyle.section}
            onPress={() => this.props.onItemPress(8)}
          >
            <ProfileSetting
              style={themedStyle.profileSetting}
              hint={Strings.menu.setting_consultReport}
              value={""}
            />
          </Section>
          */}

          <Section style={[themedStyle.section, themedStyle.soundEnabledSection]}>
            <Button status="danger" style={{ width: 150 }} onPress={this.onSignOutPress}>
              {Strings.common.str_signOut}
            </Button>
            <Button status="warning" style={{ width: 150 }} onPress={this.onSwitchUserPress}>
              {Strings.common.str_switchAccount}
            </Button>
          </Section>
        </View>
      </ContainerView>
    );
  }
}

interface SectionProps extends TouchableOpacityProps {
  children?: React.ReactNode;
}

const Section = (props?: SectionProps): React.ReactElement<TouchableOpacityProps> => {
  return <TouchableOpacity activeOpacity={0.65} {...props} />;
};

export const Settings = withStyles(SettingsComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  },
  section: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme["border-basic-color-2"]
  },
  notificationSection: {
    paddingTop: 0
  },
  soundEnabledSection: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingTop: 10
  }
}));
