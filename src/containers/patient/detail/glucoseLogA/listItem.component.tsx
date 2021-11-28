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
import { GlucoseValuesOneDayModel, GlucoseMonitorModel, HospitalModel } from "@src/core/model";

import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";
interface ComponentProps {
  kind: number;
  index: number;
  hospitalInfo: HospitalModel;
  data: GlucoseValuesOneDayModel;
  onItemPress: (item: GlucoseValuesOneDayModel) => void;
  onCellPress: (point: number, monitors: GlucoseMonitorModel[], hasTask: boolean) => void;
  onItemCellPress: (point: number, monitors: GlucoseMonitorModel[], cellIndex: number, hasTask: boolean) => void;
}

type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  private onCellPress = (point: number, monitors: GlucoseMonitorModel[], hasTask: boolean) => {
    this.props.onCellPress(point, monitors, hasTask);
  };
  private getRowHeight = (dayd: GlucoseValuesOneDayModel): number => {
    let size = 0;
    const height = GLOBAL.recordMultiHeight;
    // const height = props.fontSize * 1.5;
    size = dayd.monitors.reduce((prev, curr) => prev < curr.length ? curr.filter(_it => _it.flag === 1).length : prev, 0);
    // for (const item of monitors) {
    //   if (item.monitors.length > size) size = item.monitors.length;
    // }

    return size > 1 ? (size + 1) * height : GLOBAL.recordNormalHeight;
  }
  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    const rowHeight = this.getRowHeight(data);

    return (
      <View style={themedStyle.row}>
        {this.props.kind == 0 ? (
          <View style={{ width: 150, flexDirection: "row" }}>
            <View style={[themedStyle.col, { width: 50, height: rowHeight }]}>
              <Text style={themedStyle.cellText} numberOfLines={2}>
                {data.date}
              </Text>
            </View>
          </View>
        ) : (
          data.monitors.map((monitors, index) => {
            if (monitors.length <= 1) {
              const gluVal = monitors.length == 1 ? UTILS.getGlucoseValueString(monitors[0]) : '-';
              const textStyle = monitors.length > 0 ? UTILS.getGlucoseValueStyle(monitors[0], this.props.hospitalInfo) : themedStyle.cellText;
              return (
                <TouchableOpacity key={index} onPress={() => this.onCellPress(index, monitors, false)}
                >
                  <View style={[themedStyle.col, { width: 60, height: rowHeight }]} key={index}>
                    <Text style={textStyle}>{monitors.length > 0 ? gluVal : "-"}</Text>
                  </View>
                </TouchableOpacity>
              );
            } else {
              return (
                <View style={[themedStyle.col, { width: 60, height: rowHeight }]} key={index}>
                  {
                    monitors.map((_item, idx) => {
                      return (
                        <TouchableOpacity key={idx} onPress={() => this.props.onItemCellPress(index, monitors, idx, false)}
                        >
                          <View style={{ marginTop: 2 }}>
                            {UTILS.renderGlucoseItem(_item, this.props.hospitalInfo, GLOBAL.fontSize['sm'])}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  }
                </View>
              )

            }

          })
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
    paddingVertical: 5,
    paddingHorizontal: 6,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 0
    // width: "100%"
  },
  col: {
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
  },
  cellText: {
    fontSize: 18
    //    color: theme["text-hint-color"]
  }
}));
