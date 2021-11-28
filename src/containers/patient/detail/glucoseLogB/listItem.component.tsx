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
import { GlucoseMonitorModel, HospitalModel } from "@src/core/model";

import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";
interface ComponentProps {
  data: GlucoseMonitorModel;
  hospitalInfo: HospitalModel;
  onItemPress?: (item: GlucoseMonitorModel) => void;
}

type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    return (
      <View style={themedStyle.row}>
        <View style={[themedStyle.col, { width: 100 }]}>
          <Text style={commonStyles.textParagraph}>
            {data.time ? UTILS.getFormattedDate(data.time, 6) : "-"}
          </Text>
        </View>
        <View style={[themedStyle.col, { width: 80 }]}>
          <Text style={commonStyles.textParagraph}>{GLOBAL.COMMON_POINTS[data.point]}</Text>
        </View>
        <View style={[themedStyle.col, { width: 80 }]}>
          {UTILS.renderGlucoseItem(data, this.props.hospitalInfo, 16)}
        </View>
        <View style={[themedStyle.col, { width: 80 }]}>
          <Text style={commonStyles.textParagraph}>{data.user_name}</Text>
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
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 0,
    width: "100%"
  },
  col: {
    frex: 1,
    paddingVertical: 0,
    justifyContent: "center",
    alignItems: "center"
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
