import React from "react";
import { View, Text, ImageProps, TouchableOpacity, TouchableOpacityProps } from "react-native";

import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  StyleType
} from "@src/core/react-native-ui-kitten/theme";
import Strings from "@src/assets/strings";
import { PatientInfoIconOutline } from "@src/assets/icons";
import { textStyle } from "@src/components/common";
import { GlucoseMonitorModel, TaskDataModel } from "@src/core/model";

import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";
import { ProfileSetting } from "@src/components/social";
import { themes } from "@src/core/themes";
interface ComponentProps {
  data: TaskDataModel;
  onItemPress: (item: any) => void;
}

type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  private renderRightIcon = (style: StyleType): React.ReactElement<ImageProps> => {
    const { themedStyle } = this.props;

    return PatientInfoIconOutline({ ...style });
  };

  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    const value = data.record ? Strings.patient.str_completed : Strings.patient.str_incompleted;
    const valueColor = data.record
      ? themes["App Theme"]["color-primary-500"]
      : themes["App Theme"]["color-warning-500"];

    const taskName = UTILS.getTaskName(data);
    return (
      <View style={{ backgroundColor: "white" }}>
        <Section style={themedStyle.section} onPress={() => this.props.onItemPress(data)}>
          <ProfileSetting
            style={themedStyle.profileStyle}
            //            hintStyle={{ color: "blue" }}
            valueStyle={{ color: valueColor }}
            hint={taskName}
            value={value}
          />
        </Section>
      </View>
    );
  }
}
interface SectionProps extends TouchableOpacityProps {
  children?: React.ReactNode;
}

const Section = (props?: SectionProps): React.ReactElement<TouchableOpacityProps> => {
  return <TouchableOpacity activeOpacity={0.65} {...props} />;
};

export const ListItem = withStyles(MyComponent, (theme: ThemeType) => ({
  section: {
    paddingVertical: 0,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme["border-basic-color-2"]
  },
  profileStyle: {
    backgoundColor: "red"
    // paddingVertical: 6
  }
}));
