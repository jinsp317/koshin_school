import Strings from "@src/assets/strings";
import React from "react";
import { View, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { ThemeType, withStyles, ThemedComponentProps } from "@src/core/react-native-ui-kitten/theme";
import { Toggle, Text, Button } from "@src/core/react-native-ui-kitten/ui";
import { ContainerView, textStyle } from "@src/components/common";
import { ProfileSetting } from "@src/components/social";
import GLOBAL from "@src/core/globals";

interface ComponentProps {
  onSignOutPress: () => void;
}
interface State {
  curHospitalMode: number;
}
export type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  public state: State = {
    curHospitalMode: GLOBAL.curHospitalMode
  };
  private onSignOutPress = () => {
    this.props.onSignOutPress();
  };

  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <ContainerView style={themedStyle.container}>
        <Text>Upload Report</Text>
      </ContainerView>
    );
  }
}

export const UploadReport = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  }
}));
