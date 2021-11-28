import React from "react";
import { View, Text, ImageProps } from "react-native";

import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  StyleType
} from "@src/core/react-native-ui-kitten/theme";
import Strings from "@src/assets/strings";
import { textStyle } from "@src/components/common";
import { PatientModel, WarningLogModel, HospitalModel } from "@src/core/model";

import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
interface ComponentProps {
  data: WarningLogModel;
  hospitalInfo: HospitalModel;
}

type Props = ThemedComponentProps & ComponentProps;

class PatientsListItemComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    const glucoseValue =
      data.value > 0 ? UTILS.glucoseConvMMol(data.value) : data.warning_kind === 1 ? "HI" : "LO";
    return (
      <View style={themedStyle.row} key={data.id}>
        <View style={[themedStyle.col, { width: "15%" }]}>
          <View style={themedStyle.subCol}>
            <Text style={themedStyle.textMain1}>{` ${data.bed_number}床`}</Text>
          </View>
          <View>
            <Text
              style={[
                themedStyle.textParagraph,
                {
                  color:
                    data.value > 0
                      ? UTILS.getMonitorValueColor(data, this.props.hospitalInfo)
                      : data.warning_kind === 1
                        ? GLOBAL.GLUCOSE_HIGH_COLOR
                        : GLOBAL.GLUCOSE_LOW_COLOR
                }
              ]}
            >
              {GLOBAL.WARNINGTYPES[data.warning_kind]}
            </Text>
          </View>
        </View>
        <View style={[themedStyle.col, { width: "30%" }]}>
          <View style={themedStyle.subCol}>
            <Text style={themedStyle.textMain}>{data.bed_number}</Text>
          </View>
          <View>
            <Text style={themedStyle.textParagraph}>
              {UTILS.getShortTime(data.warning_time, 0)}
            </Text>
          </View>
        </View>
        <View style={[themedStyle.col, { width: "25%" }]}>
          <View style={themedStyle.subCol}>
            <Text style={themedStyle.textName}>{data.patient_name}</Text>
          </View>
          <View>
            <Text style={themedStyle.textParagraph}>{GLOBAL.COMMON_POINTS[data.point]}</Text>
          </View>
        </View>
        <View style={[themedStyle.col, { width: "30%" }]}>
          <View style={themedStyle.subCol}>
            <Text style={themedStyle.textParagraph}>
              {`${data.department_name ? data.department_name : "  -"} ${
                data.doctor_name ? data.doctor_name : "  -"
                }`}
            </Text>
          </View>
          <View>
            <Text style={[themedStyle.textParagraph, { color: UTILS.getGlucoseColor(data.value, this.props.hospitalInfo) }]}>
              {glucoseValue}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

export const MyListItem = withStyles(PatientsListItemComponent, (theme: ThemeType) => ({
  container: {
    justifyContent: "center",
    flexDirection: "column",
    padding: 0,
    paddingVerticalBottom: 0
    //backgroundColor: theme['background-basic-color-4'],
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
    borderRadius: 0,
    width: "100%"
  },
  subCol: {
    paddingBottom: 3
  },
  col: {
    frex: 1,
    paddingVertical: 0,
    justifyContent: "space-between"
    //      alignItems: "center",
    //width: "25%"
  },
  textMain: {
    ...textStyle.subtitle,
    fontSize: 18,
    color: theme["color-basic-900"]
  },
  textMain1: {
    ...textStyle.subtitle,
    fontSize: 18,
    color: theme["color-primary-500"]
  },
  textName: {
    ...textStyle.subtitle,
    fontSize: 18,
    color: theme["color-warning-500"]
  },
  textSubtitle: {
    ...textStyle.subtitle,
    fontSize: 16,
    color: theme["color-basic-900"]
  },
  textParagraph: {
    ...textStyle.paragraph,
    fontSize: 16,
    color: theme["text-hint-color"]
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
