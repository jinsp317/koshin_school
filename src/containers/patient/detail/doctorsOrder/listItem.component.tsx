import React from "react";
import { View, Text, ImageProps, TouchableOpacity } from "react-native";

import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  StyleType
} from "@src/core/react-native-ui-kitten/theme";
import Strings from "@src/assets/strings";
import { PatientInfoIconOutline } from "@src/assets/icons";
import { textStyle } from "@src/components/common";
import { DoctorsOrderModel } from "@src/core/model";

import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";
import { DayModel, DoctorsOrderPointModel } from "@src/core/model/doctorsOrder.model";
interface ComponentProps {
  data: DoctorsOrderModel;
  onItemPress: (item: DoctorsOrderModel) => void;
}

type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  private renderRightIcon = (style: StyleType): React.ReactElement<ImageProps> => {
    const { themedStyle } = this.props;

    return PatientInfoIconOutline({ ...style });
  };

  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    const days: DayModel[] = data.days; // ? JSON.parse(data.days) : [];
    const points: DoctorsOrderPointModel[] = data.points; // ? JSON.parse(data.points) : [];
    // const times: any[] = data.times;
    const monitorDays = 7;
    const everyday = monitorDays === days.length ? "每天" : undefined;
    return (
      <View style={themedStyle.row}>
        <View style={[themedStyle.col, { width: 130 }]}>
          <Text style={commonStyles.textParagraph}>
            {data.from_time ? UTILS.getShortTime(data.from_time, 0) : ""}
          </Text>
        </View>
        <View style={[themedStyle.col, { width: 130 }]}>
          <Text style={commonStyles.textParagraph}>
            {data.to_time ? UTILS.getShortTime(data.to_time, 0) : ""}
          </Text>
        </View>
        <View style={[themedStyle.col, { width: 260 }]}>
          <Text style={commonStyles.textParagraph_s}>
            {everyday
              ? everyday
              : days.map((val, index) => {
                return GLOBAL.WEEKDAYS[val.day] + " ";
              })}
          </Text>
          <Text style={commonStyles.textParagraph_s}>
            {points.map((val, index) => {
              return GLOBAL.COMMON_POINTS[val.point] + " ";
            })}
            {data.times}
          </Text>
        </View>
        <View style={[themedStyle.col, { width: 100 }]}>
          <Text style={commonStyles.textParagraph}>{data.user_name}</Text>
        </View>
        <View style={[themedStyle.col, { width: 100 }]}>
          <Text style={commonStyles.textWarning}>{`${data.state_name}`}</Text>
        </View>
      </View>
    );
  }
}

export const ListItem = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    justifyContent: "center",
    flexDirection: "column",
    padding: 0,
    paddingVerticalBottom: 0
    // backgroundColor: theme['background-basic-color-4'],
  },
  title: {
    marginTop: 1,
    ...textStyle.subtitle
  },
  row: {
    frex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 6,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 0,
    width: "100%"
  },
  col: {
    frex: 1,
    paddingVertical: 0,
    justifyContent: "space-between"
  },

  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  measure1: {
    padding: 30,
    borderWidth: 1
  }
}));
