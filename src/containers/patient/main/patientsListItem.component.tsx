import React from "react";
import { View, Text, ImageProps } from "react-native";

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
  isYuannei?: boolean;
}

type Props = ThemedComponentProps & ComponentProps;

class PatientsListItemComponent extends React.Component<Props> {
  private renderRightIcon = (
    style: StyleType
  ): React.ReactElement<ImageProps> => {
    const { themedStyle } = this.props;

    return PatientInfoIconOutline({ ...style });
  };

  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    return (
      <View
        style={themedStyle.row}
        key={data.id}
        // ref={ref => (this.textInput = ref)}
        /*
    onLongPress={e => {

      this.textInput.measure(
        (ox, oy, width, height: number, px: number, py: number) => {
          {
            this.props.isYuannei &&
              Popover.show(
                menus1,
                { top: py < height ? py + height : py - height },
                py < height
              );
          }
          {
            !this.props.isYuannei &&
              Popover.show(
                menus2,
                { top: py < height ? py + height : py - height },
                py < height
              );
          }
        }
      );

    }} */
      >
        <View style={themedStyle.col}>
          <View style={themedStyle.subCol}>
            <Text style={themedStyle.textMain1}>
              {data.bed_number ? ` ${data.bed_number}床` : " - 床"}
            </Text>
          </View>
          <View>
            <Text style={themedStyle.textParagraph}>
              {this.props.isYuannei
                ? data.in_date
                  ? data.in_date.substr(0, 10)
                  : "  -"
                : data.out_date
                ? data.out_date.substr(0, 10)
                : "  -"}
            </Text>
          </View>
        </View>
        <View style={[themedStyle.col]}>
          <View style={themedStyle.subCol}>
            <Text style={themedStyle.textMain}>
              {data.patient_number ? " " + data.patient_number : " -"}
            </Text>
          </View>
          <View>
            <Text style={themedStyle.textParagraph}>
              {" " + data.department_name}
            </Text>
          </View>
        </View>
        <View style={themedStyle.col}>
          <View style={themedStyle.subCol}>
            <Text style={themedStyle.textName}>{data.name}</Text>
          </View>
          <View>
            <Text style={themedStyle.textParagraph}>
              {` ${
                data.gender == 0
                  ? Strings.common.str_male
                  : Strings.common.str_female
              }  ${data.age > 0 ? data.age : "  -"}`}
            </Text>
          </View>
        </View>
        <View style={themedStyle.col}>
          <View style={themedStyle.subCol}>
            <Text style={themedStyle.textParagraph}>
              {" "}
              {data.doctor_name ? data.doctor_name : "  -"}
            </Text>
          </View>
          <View>
            <Text style={themedStyle.textParagraph}>
              {" "}
              {data.nurse_name ? data.nurse_name : "  -"}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

export const PatientsListItem = withStyles(
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
      flex: 1,
      flexDirection: "row",
      backgroundColor: "white",
      paddingVertical: 8,
      height: 80,
      paddingHorizontal: 6,
      justifyContent: "space-between",
      borderRadius: 0,
      width: "100%"
    },
    subCol: {
      paddingBottom: 3
    },
    col: {
      flex: 1,
      paddingVertical: 0,
      justifyContent: "space-between",
      //      alignItems: "center",
      width: "25%"
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
  })
);
