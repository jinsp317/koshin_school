import React, { useMemo, memo } from "react";
import { View, Text, ImageProps, TouchableOpacity, FlatList } from "react-native";

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
  MonitorModel,
  HospitalModel
} from "@src/core/model";

import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";
import { StarIconFill, StateDoubleIconFill } from "@src/assets/icons";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCoffee, faUtensils, faUnlink } from '@fortawesome/free-solid-svg-icons'

interface ComponentProps {
  kind: number;
  index: number;
  data: PatientMonitorModel;
  fontSize: number;
  hospitalInfo: HospitalModel;
  onItemPress: (item: PatientMonitorModel) => void;
  onCellPress: (point: number, cell: GlucoseMonitorModel, hasTask: boolean) => void;
}

type Props = ThemedComponentProps & ComponentProps;
function moniterLogItem(props: Props) {
  const onCellPress = (point: number, cell: GlucoseMonitorModel, hasTask: boolean) => {
    
    props.onCellPress(point, cell, hasTask);
  }
  const getRowHeight = (monitors: MonitorsOnePointModel[]): number => {
    let size = 0;
    const height = GLOBAL.recordMultiHeight;
    // const height = props.fontSize * 1.5;
    size = monitors.reduce((prev, curr) => prev < curr.monitors.length ? curr.monitors.filter(_it => _it.flag === 1).length : prev, 0);
    // for (const item of monitors) {
    //   if (item.monitors.length > size) size = item.monitors.length;
    // }

    return size > 1 ? (size + 1) * height : GLOBAL.recordNormalHeight;
  }
  // const headerHeight = 50;
  //  const rowHeight = 40;
  const cellWidth = 60;
  const FIXED_W = 120;
  const data = props.data;
  const rowHeight = useMemo(() => getRowHeight(data.point_monitors), data.point_monitors);
  const themedStyle = props.themedStyle;
  return (
    <View style={themedStyle.row} key={props.index}>
      {props.kind === 0 ? (
        <View style={{ width: FIXED_W, flexDirection: "row", height: rowHeight }}>
          <View style={[themedStyle.col, { width: cellWidth }]}>
            <Text style={[commonStyles.textSubtitle, { fontSize: props.fontSize }]}>{data.bed_number}</Text>
          </View>
          <View style={[themedStyle.col, { alignItems: "baseline" }]}>
            <TouchableOpacity onPress={() => props.onItemPress(data)}>
              <Text style={[commonStyles.textParagraph_s, { flexWrap: "nowrap", fontSize: props.fontSize }]}
                numberOfLines={1}>
                {data.name}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: "row", height: rowHeight }}>
          {data.point_monitors.map((val, index) => {
            let gluVal = '';
            const renderItems = val.monitors.filter(_it => _it.flag === 1);
            const textStyle = renderItems.length > 0 ?
              UTILS.getGlucoseValueStyle(renderItems[0], props.hospitalInfo, props.fontSize) : themedStyle.cellText;
            const hasAdvice = renderItems.length === 0 && data.advice && data.advice[index] === 1 ? true : false;
            if (renderItems.length === 0) gluVal = '-';
            const item = gluVal ? renderItems[0] : undefined;
            if (!hasAdvice && renderItems.length === 0) {
              return (
                <TouchableOpacity key={index} onPress={() => onCellPress(index, item, hasAdvice)}>
                  <View style={[themedStyle.col, { width: cellWidth }]}
                    key={index}
                  >
                    <Text style={textStyle} numberOfLines={2}>
                      {gluVal}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            } else if (hasAdvice) {
              return (
                <TouchableOpacity key={index} onPress={() => onCellPress(index, item, hasAdvice)}>
                  <View style={[themedStyle.col, { width: cellWidth }]}
                    key={index}
                  >
                    <Text style={textStyle} numberOfLines={2}>
                      {UTILS.renderIconElement(StarIconFill, commonStyles.iconTask)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            } else {
              return (
                <View style={[themedStyle.col, { width: cellWidth }]}
                  key={index}
                >
                  {
                    renderItems.map((_item, idx) => {
                      const cellStyle = renderItems.length > 0 ? UTILS.getGlucoseValueStyle(_item, props.hospitalInfo, props.fontSize) : textStyle;
                      const notice_obj = _item.notice_obj;
                      const eated = _item.eat_time ? true : false;
                      let alarm = false;
                      if (notice_obj != null) {
                        const notices = notice_obj.split(',');
                        if (notices.length > 0) {
                          alarm = true;
                        }
                      }
                      return (
                        <TouchableOpacity style={themedStyle.cell} key={idx} onPress={() => onCellPress(index, _item, hasAdvice)}>
                          {UTILS.renderGlucoseItem(_item, props.hospitalInfo, props.fontSize)}
                          {alarm && (
                            UTILS.renderIconElement(StateDoubleIconFill, commonStyles.iconMark)
                          )}
                        </TouchableOpacity>
                      );
                    })
                  }
                </View>
              )
            }
          })}
        </View>
      )
      }
    </View>
  );
}

export const ListItem = withStyles(moniterLogItem, (theme: ThemeType) => ({
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
    paddingHorizontal: 0,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 0,
    width: "100%"
  },
  col: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 2,
    justifyContent: "center",
    alignItems: "center"
  },
  cell: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  icon: {
    color: 'seagreen',
    marginRight: 2
  },
  measure1: {
    padding: 30,
    borderWidth: 1
  },
  cellText: {
    fontSize: 18
    //// textDecorationLine: 'underline',

    //    color: theme["text-hint-color"]
  }
}));

