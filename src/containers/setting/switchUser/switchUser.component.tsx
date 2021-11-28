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
import * as UTILS from "@src/core/app_utils";

interface ComponentProps {
  onItemPress: () => void;
  onSignOutPress: () => void;
}
interface State {
  curHospitalMode: number;
}
export type SettingsProps = ThemedComponentProps & ComponentProps;

class SettingsComponent extends React.Component<SettingsProps> {
  private _users: any[];

  public state: State = {
    curHospitalMode: GLOBAL.curHospitalMode
  };
  private onItemPress = (index: number) => {
    const user = this._users[index];
    GLOBAL.switchUser = {
      id: user.id,
      nick: user.nick,
      password: user.password
    };
    this.props.onItemPress();
  };
  private onOtherLoginPress = () => {
    this.props.onSignOutPress();
  };

  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const curItemIndex = UTILS.getIndexFromId(
      GLOBAL.totalDepartments,
      GLOBAL.curUser.department_id
    );
    //doctor or nurse in same department
    if (GLOBAL.curUser.job_position_type === 1 || GLOBAL.curUser.job_position_type === 2)
      this._users = GLOBAL.myUsers
        .map(e => {
          if (e.job_position_type === GLOBAL.curUser.job_position_type) return e;
        })
        .filter(e => e);
    else this._users = GLOBAL.myUsers;

    return (
      <ContainerView style={themedStyle.container}>
        <View style={themedStyle.infoSection}>
          {this._users.map((user, index) => {
            if (user.id === GLOBAL.curUser.id) return;
            return (
              <Section
                key={index}
                style={themedStyle.section}
                onPress={() => this.onItemPress(index)}
              >
                <ProfileSetting
                  style={themedStyle.profileSetting}
                  hint={`${user.name}`}
                  value={user.nick}
                />
              </Section>
            );
          })}

          <Section style={[themedStyle.section, themedStyle.soundEnabledSection]}>
            <Button size="giant" style={{ flex: 1 }} onPress={this.onOtherLoginPress}>
              {Strings.common.str_otherLogin}
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

export const SwitchUser = withStyles(SettingsComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  },
  section: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme["border-basic-color-2"]
  }
}));
