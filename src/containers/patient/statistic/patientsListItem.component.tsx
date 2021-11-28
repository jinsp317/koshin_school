import React, { useState, useEffect } from "react";
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
import { PatientMonitorRawModel } from "@src/core/model";

import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import moment from 'moment';
import { UserSummary } from '../../../core/model/monitor.model';
interface ComponentProps {
  data: PatientMonitorRawModel;
  udata: UserSummary;
  kind: boolean;
}

type Props = ThemedComponentProps & ComponentProps;
function PatientListItem(props: Props) {
  const { themedStyle, data, udata, ...restProps } = props;
  return (
    <View
      style={themedStyle.row}
      key={props.kind ? data.id : udata.id}>
      <View style={themedStyle.col}>
        <View style={themedStyle.subCol}>
          <Text style={themedStyle.textMain1}>
            {props.kind ? ` ${data.bed_number}床` : `${udata.nick ? udata.nick : ''}`}
          </Text>
        </View>
        <View>
          <Text style={themedStyle.textParagraph}>
            {props.kind ? `${data.department_name}` : ``}
          </Text>
        </View>
      </View>
      <View style={[themedStyle.col]}>
        <View style={themedStyle.subCol}>
          <Text style={themedStyle.textName}>
            {props.kind ? data.name : udata.name}
          </Text>
        </View>
        <View>
          <Text style={themedStyle.textParagraph}>
            {props.kind ? data.patient_number : udata.department_name}
          </Text>
        </View>
      </View>
      <View style={themedStyle.col}>
        <View style={themedStyle.subCol}>
          <Text style={[themedStyle.textParagraph, { textAlign: 'center' }]}>
            {props.kind ? `${data.record_obj ? data.record_obj : 0} / ${data.advice.filter(_it => _it == 1).length}` : udata.months}
          </Text>
        </View>
      </View>
      <View style={themedStyle.col}>
        <View style={themedStyle.subCol}>
          <Text style={[themedStyle.textParagraph, { textAlign: 'center' }]}>
            {props.kind ? moment(data.in_date).format('YY.MM.DD') : udata.todays}
          </Text>
        </View>
        <View>
          <Text style={[themedStyle.textParagraph, { textAlign: 'center' }]}>
            {props.kind ? data.record_all : ''}
          </Text>
        </View>
      </View>

    </View>
  );
}

export const PatientsListItem = withStyles(
  PatientListItem,
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
