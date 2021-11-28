import React from "react";
import { View, Text, ImageProps } from "react-native";

import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  StyleType
} from "@src/core/react-native-ui-kitten/theme";
import { FPMDataModel, FreePatientModel, FreePatientMeasureModel, HospitalModel } from "@src/core/model";
import Strings from "@src/assets/strings";
import {
  PatientInfoIconOutline,
  CertIDIconOutline,
  CertCardIconOutline,
  CertPhoneIconOutline
} from "@src/assets/icons";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
interface ComponentProps {
  data: FPMDataModel;
  hospitalInfo: HospitalModel;
}

type Props = ThemedComponentProps & ComponentProps;

class LayoutListItemComponent extends React.Component<Props> {
  private renderRightIcon = (kind: number, style: StyleType): React.ReactElement<ImageProps> => {
    const { themedStyle } = this.props;
    if (kind == 0) return CertIDIconOutline({ ...style });
    if (kind == 1) return CertCardIconOutline({ ...style });
    if (kind == 2) return CertPhoneIconOutline({ ...style });
  };

  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    let extra_info = "";
    if (data.temperature) {
      extra_info = `${Strings.common.str_temperature}: ${data.temperature.toFixed(1)}`;
    }
    if (data.pressure_low && data.pressure_high) {
      extra_info += `  ${Strings.common.str_pressure}: ${data.pressure_high.toFixed(
        0
      )}/${data.pressure_low.toFixed(0)}`;
    }
    return (
      <View key={data.id} style={themedStyle.itemView}>
        <View style={themedStyle.rowHeaderView}>
          {this.renderRightIcon(data.cert_kind, themedStyle.personIcon)}
          <Text style={themedStyle.headTextL}>{data.name}</Text>
          {data.age && <Text style={themedStyle.headTextL}>{`${data.age}岁`}</Text>}
          <Text style={themedStyle.headTextR}>{data.cert_num}</Text>
        </View>
        <View style={themedStyle.rowBodyView}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={themedStyle.bodyTextL}>{`${Strings.common.str_glucose}: `}</Text>
            <Text style={UTILS.getGlucoseValueStyle(data, this.props.hospitalInfo)}>
              {`${UTILS.glucoseConvMMol(data.value)} `}
            </Text>
            <Text></Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={themedStyle.bodyTextR}>{`${UTILS.getFormattedDate(data.time, 3)} `}</Text>
            <Text style={themedStyle.bodyTextL}>{`${GLOBAL.COMMON_POINTS[data.point]}`}</Text>
          </View>
        </View>
        <View style={themedStyle.rowBodyGap} />
        <View style={themedStyle.rowBodyView}>
          <Text style={themedStyle.bodyTextL}>{extra_info}</Text>
          <Text style={themedStyle.bodyTextR}>
            {`${Strings.common.str_measurer}: ${data.user_name}`}
          </Text>
        </View>
      </View>
    );
  }
}

export const FreeMeasureListItem = withStyles(LayoutListItemComponent, (theme: ThemeType) => ({
  itemView: {
    marginVertical: 0,
    backgroundColor: theme["mycolor-background"],
    borderLeftWidth: 3,
    borderColor: theme["color-primary-500"],
    borderRadius: 10,
    padding: 3
  },
  rowHeaderView: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    paddingHorizontal: 10,
    borderRadius: 3
  },
  rowBodyView: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 3
  },
  rowBodyGap: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    height: 1
  },
  personIcon: {
    padding: 3,
    marginRight: 3,
    width: 18,
    height: 18
    // tintColor: theme["color-warning-500"]
  },
  headTextL: {
    fontSize: 20,
    padding: 3,
    color: "#707070"
  },
  headTextR: {
    fontSize: 18,
    padding: 3,
    color: "#707070"
  },
  bodyTextL: {
    marginVertical: 3,
    fontSize: 16,
    padding: 3,
    color: theme["color-primary-500"]
  },
  bodyTextR: {
    marginVertical: 3,
    fontSize: 16,
    padding: 3,
    color: "#888888"
  },
  bodyTextRR: {
    marginVertical: 3,
    fontSize: 16,
    padding: 3,
    color: theme["color-warning-500"]
  }
}));
