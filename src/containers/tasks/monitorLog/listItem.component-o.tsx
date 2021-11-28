import React from "react";
import { View, Text, ImageProps, TouchableOpacity } from "react-native";

import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  StyleType
} from "@src/core/react-native-ui-kitten/theme";
import Strings from "@src/assets/strings";
import { textStyle } from "@src/components/common";
import {
  GlucoseValuesOneDayModel,
  PatientMonitorModel,
  MonitorsOnePointModel,
  GlucoseMonitorModel,
  MonitorModel
} from "@src/core/model";

import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";
import { StarIconFill } from "@src/assets/icons";
interface ComponentProps {
  kind: number;
  index: number;
  data: PatientMonitorModel;
  onItemPress: (item: PatientMonitorModel) => void;
  onCellPress: (point: number, cell: GlucoseMonitorModel, hasTask: boolean) => void;
}

type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  private onCellPress = (point: number, cell: GlucoseMonitorModel, hasTask: boolean) => {
    this.props.onCellPress(point, cell, hasTask);
  };

  private getValuesString = (monitors: GlucoseMonitorModel[]) => {
    let result = undefined;
    monitors.forEach((monitor, index) => {
      if (index === 0) result = `${UTILS.getGlucoseValueString(monitor)}`;
      else result += ` ${UTILS.getGlucoseValueString(monitor)}`;
    });
    return result;
  };
  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    const headerHeight = 50;
    const rowHeight = 40;
    const cellWidth = 60;
    const FIXED_W = 120;
    return (
      <View style={themedStyle.row}>
        {this.props.kind == 0 ? (
          <View style={{ width: FIXED_W, flexDirection: "row" }}>
            <View style={[themedStyle.col, { width: cellWidth, height: rowHeight }]}>
              <Text style={commonStyles.textSubtitle}>{data.bed_number}</Text>
            </View>
            <View style={[themedStyle.col, { alignItems: "baseline" }]}>
              <TouchableOpacity onPress={() => this.props.onItemPress(data)}>
                <Text
                  style={[commonStyles.textParagraph_s, { flexWrap: "nowrap" }]}
                  numberOfLines={1}
                >
                  {data.name}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
            <View style={{ flexDirection: "row", height: rowHeight }}>
              {data.point_monitors.map((val, index) => {
                /*포인트별 측정값*/
                let gluVal =
                  val.monitors.length > 0
                    ? val.monitors.length === 1
                      ? UTILS.getGlucoseValueString(val.monitors[0])
                      : UTILS.getGlucoseValueString(val.monitors[0]) + "..."
                    : undefined;

                const textStyle =
                  val.monitors.length > 0
                    ? UTILS.getGlucoseValueStyle(val.monitors[0])
                    : themedStyle.cellText;

                const hasAdvice = !gluVal && data.advice[index] === 1 ? true : false;
                if (!gluVal) gluVal = "-";
                const item = gluVal ? val.monitors[0] : undefined;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => this.onCellPress(index, item, hasAdvice)}
                  >
                    <View
                      style={[themedStyle.col, { width: cellWidth, height: rowHeight }]}
                      key={index}
                    >
                      <Text style={textStyle} numberOfLines={2}>
                        {!hasAdvice
                          ? gluVal
                          : UTILS.renderIconElement(StarIconFill, commonStyles.iconTask)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
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
    paddingVertical: 5,
    paddingHorizontal: 0,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 0,
    width: "100%"
  },
  col: {
    frex: 1,
    paddingVertical: 0,
    paddingHorizontal: 2,
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
  },
  cellText: {
    fontSize: 18
    //    color: theme["text-hint-color"]
  }
}));
