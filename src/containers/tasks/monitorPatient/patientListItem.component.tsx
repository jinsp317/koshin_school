import React from "react";
import { ImageProps, View, Alert } from "react-native";
import {
  StyleType,
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { ListItem, ListItemProps, Text } from "@src/core/react-native-ui-kitten/ui";
import { textStyle } from "@src/components/common";
import { ThemeContext, ThemeKey } from "@src/core/themes";
import { MonitorPatientModel, HospitalModel } from "@src/core/model";
import {
  PersonIconFill,
  StateEatIconFill,
  StateDoubleIconFill,
  StateReserveIconFill,
  PeopleIconFill,
  MyPatientIcon
} from "@src/assets/icons";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";

interface ComponentProps {
  data: MonitorPatientModel;
  hospitalInfo: HospitalModel;
}

export type TasksListItemProps = ThemedComponentProps & ListItemProps & ComponentProps;
function patientListItem(props: TasksListItemProps) {
  const { style, themedStyle, data, ...restProps } = props;
  const isMyPatient = GLOBAL.curUser.id === data.doctor_id || GLOBAL.curUser.id === data.nurse_id;
  const notice_meal = data.notice && data.notice.type === 0 ? data.notice : undefined;
  const notice_double = data.notice && data.notice.type === 1 ? data.notice : undefined;
  const notice_reserve = data.notice && data.notice.type === 2 ? data.notice : undefined;
  let advice = data.apoints == null ? '' : data.apoints;
  if (data.atimes != null && data.atimes != '') {
    if (advice) advice += ',';
    advice += `  ${GLOBAL.COMMON_POINTS[9]}(${data.atimes})`
  }
  const glucoseVal = UTILS.getGlucoseValueLabel(data, "");
  const monitor = data.record;
  return (
    <ListItem {...restProps} style={[themedStyle.container, style]}>
      <View style={themedStyle.header}>
        <View style={{ flexDirection: "row" }}>
          <Text style={themedStyle.title1} category="h6">
            {data.bed_number ? data.bed_number + "床 " : " - 床 "}
          </Text>
          <Text style={themedStyle.title1} category="h6">
            {data.name}
          </Text>
        </View>
        {isMyPatient && UTILS.renderIconElement(MyPatientIcon, commonStyles.iconMark)}
      </View>

      {notice_meal ? (
        <View style={themedStyle.row}>
          {UTILS.renderIconElement(StateEatIconFill, commonStyles.iconMark)}
          <Text style={[themedStyle.content, { paddingLeft: 6 }]} category="p1">
            {UTILS.getMinuteString(notice_meal.notice)}
          </Text>
        </View>
      ) : (
          <View style={themedStyle.row}>
            <Text style={themedStyle.content} category="p1">
              {monitor ? `${GLOBAL.COMMON_POINTS[monitor.point]}` : "24小时内未测量"}
            </Text>
            {monitor && (
              UTILS.renderGlucoseItem(data.record, props.hospitalInfo, 16)
              // <Text style={UTILS.getGlucoseValueStyle(data.record, props.hospitalInfo, 16)}>{glucoseVal}</Text>
            )}
            <Text style={[themedStyle.content, { marginLeft: 5 }]} category="p1">
              {monitor ? `${UTILS.getFormattedDate(monitor.time, 6)}  ` : ""}
            </Text>
          </View>
        )}
      <View style={themedStyle.row}>
        <Text style={[themedStyle.content, { color: "black" }]}>{data.department_name}</Text>
      </View>
      {notice_double && (
        <View style={themedStyle.row}>
          {UTILS.renderIconElement(StateDoubleIconFill, commonStyles.iconMark)}
          <Text style={[themedStyle.content, { paddingLeft: 6 }]} category="p1">
            {UTILS.getMinuteString(notice_double.notice)}
          </Text>
        </View>
      )}
      {notice_reserve && (
        <View style={themedStyle.row}>
          {UTILS.renderIconElement(StateDoubleIconFill, commonStyles.iconMark)}
          <Text style={[themedStyle.content, { paddingLeft: 6 }]} category="p1">
            {UTILS.getMinuteString(notice_reserve.notice)}
          </Text>
        </View>
      )}
      {advice.length > 0 && (
        <View style={themedStyle.row}>
          <Text style={themedStyle.content} category="p1">
            {advice}
          </Text>
        </View>
      )}
    </ListItem>
  );

}


export const PatientListItem = withStyles(patientListItem, (theme: ThemeType) => ({
  container: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderColor: theme["mycolor-lightgray"]
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3
  },
  title: {
    marginRight: 6,
    color: theme["color-primary-500"],
    ...textStyle.subtitle
  },
  title1: {
    marginRight: 6,
    color: theme["color-basic-800"],
    ...textStyle.subtitle
  },
  content: {
    marginRight: 3,
    ...textStyle.paragraph,
    color: theme["text-tint-color"]
  }
}));
