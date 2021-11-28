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
import { TaskDataModel, HospitalModel } from "@src/core/model";
import {
  PersonIconFill,
  StateEatIconFill,
  StateReserveIconFill,
  StateDoubleIconFill,
  PeopleIconFill,
  MyPatientIcon
} from "@src/assets/icons";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";

interface ComponentProps {
  data: TaskDataModel;
  hospitalInfo: HospitalModel;
  completed: boolean;
}

export type TasksListItemProps = ThemedComponentProps & ListItemProps & ComponentProps;

class MyListItemComponent extends React.Component<TasksListItemProps> {
  public render(): React.ReactNode {
    const { style, themedStyle, data, ...restProps } = this.props;
    let notice_meal;
    let notice_double;
    let notice_reserve;

    if (!this.props.completed) {
      notice_meal = data.notice && data.notice.type === 0 ? data.notice : undefined;
      notice_double = data.notice && data.notice.type === 1 ? data.notice : undefined;
      notice_reserve = data.notice && data.notice.type === 2 ? data.notice : undefined;
    }

    const glucoseVal = UTILS.getGlucoseValueLabel(data, "");

    return (
      <ThemeContext.Consumer>
        {({ currentTheme }) => (
          <ListItem {...restProps} style={[themedStyle.container, style]}>
            <View style={themedStyle.header}>
              <View style={{ flexDirection: "row" }}>
                <Text style={themedStyle.title1} category="h6">
                  {data.bed_number ? data.bed_number + "床 " : " - 床 "}
                </Text>
              </View>
              {UTILS.isMyPatient(data) &&
                UTILS.renderIconElement(MyPatientIcon, commonStyles.iconMark)}
            </View>
            <View style={themedStyle.row}>
              <Text style={themedStyle.content} category="p1">
                {data.name}
              </Text>
              <Text style={themedStyle.content} category="p1">
                {GLOBAL.SEXS[data.gender]}
              </Text>
              <Text style={themedStyle.content} category="p1">
                {data.age && " " + data.age + "岁"}
              </Text>
            </View>
            <View style={themedStyle.row}>
              <Text style={themedStyle.content} category="p1">
                {UTILS.getPointName(data)}
              </Text>
              {UTILS.renderGlucoseItem(data.record, this.props.hospitalInfo, 16)}
              {/* <Text style={UTILS.getGlucoseValueStyle(data.record, this.props.hospitalInfo, 16)}>{glucoseVal}</Text> */}
            </View>
            {notice_meal && (
              <View style={themedStyle.row}>
                {UTILS.renderIconElement(StateEatIconFill, commonStyles.iconMark)}
                <Text style={[themedStyle.content, { paddingLeft: 6 }]} category="p1">
                  {UTILS.getMinuteString(notice_meal.notice)}
                </Text>
              </View>
            )}
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
            <View style={themedStyle.row}>
              <Text style={themedStyle.content} category="p1">
                {data.department_name}
              </Text>
            </View>
          </ListItem>
        )}
      </ThemeContext.Consumer>
    );
  }
}

export const TaskListItem = withStyles(MyListItemComponent, (theme: ThemeType) => ({
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
