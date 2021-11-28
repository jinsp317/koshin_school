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
import { PatientModel } from "@src/core/model";

import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
interface ComponentProps {
  data: PatientModel;
  onPressItem?: (item: PatientModel) => void;
}

type Props = ThemedComponentProps & ComponentProps;

class PatientsListItemComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    return (
      <View style={themedStyle.row} key={data.id}>
        <View style={[themedStyle.col, { width: "22%" }]}>
          <Text style={themedStyle.textParagraph}>{` ${data.name}`}</Text>
        </View>
        <View style={[themedStyle.col, { width: "38%" }]}>
          <Text style={themedStyle.textParagraph}>{` ${data.mobile}`}</Text>
        </View>
        <View style={[themedStyle.col, { width: "10%" }]}>
          <Text style={themedStyle.textParagraph}>{` ${
            GLOBAL.SEXS[data.gender]
          }`}</Text>
        </View>
        <View style={[themedStyle.col, { width: "10%" }]}>
          <Text style={themedStyle.textParagraph}>{` ${data.age}`}</Text>
        </View>
        <View
          style={[themedStyle.col, { width: "20%", alignItems: "flex-end" }]}
        >
          <TouchableOpacity onPress={() => this.props.onPressItem(data)}>
            <Text style={themedStyle.textButton}>{` [办理]`}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export const PatientsOutHospitalListItem = withStyles(
  PatientsListItemComponent,
  (theme: ThemeType) => ({
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
      fontSize: 18,
      color: theme["text-hint-color"]
    },
    textButton: {
      ...textStyle.paragraph,
      fontSize: 16,
      color: theme["color-primary-500"]
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
  })
);
