import React from "react";
import { View, Text, ImageProps } from "react-native";

import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  StyleType
} from "@src/core/react-native-ui-kitten/theme";
import { UploadListItemModel, HospitalModel } from "@src/core/model";
import Strings from "@src/assets/strings";
import {
  PatientInfoIconOutline,
  CertIDIconOutline,
  CertCardIconOutline,
  CertPhoneIconOutline,
  MyPatientIcon,
  StateDoubleIconFill,
  StateEatIconFill
} from "@src/assets/icons";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";

interface ComponentProps {
  data: UploadListItemModel;
  hospitalInfo: HospitalModel
}

type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  private renderRightIcon = (kind: number, style: StyleType): React.ReactElement<ImageProps> => {
    const { themedStyle } = this.props;
    if (kind == 0) return CertIDIconOutline({ ...style });
    if (kind == 1) return CertCardIconOutline({ ...style });
    if (kind == 2) return CertPhoneIconOutline({ ...style });
    if (kind == 100) return MyPatientIcon({ ...style });
    if (kind == 101) return StateEatIconFill({ ...style });
    if (kind == 102) return StateDoubleIconFill({ ...style });
  };

  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    const dataKind =
      data.kind === 0
        ? 100
        : data.kind === 1
          ? data.fm_cert_kind
          : data.notice_type === 0
            ? 101
            : 102;
    let patientInfo = data.fm_cert_num;
    if (data.kind != 1 && data.bed_number) {
      patientInfo = `${data.bed_number}床 ${data.department_name}`;
    }
    const kindLabel = data.flag === 0 ? "删除" : "";
    return (
      <View key={data.id} style={themedStyle.itemView}>
        <View style={themedStyle.rowHeaderView}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {this.renderRightIcon(dataKind, themedStyle.personIcon)}
            <Text style={themedStyle.bodyTextL}>{data.patient_name}</Text>
            <Text style={themedStyle.headTextL}>{patientInfo}</Text>
          </View>
          <Text style={themedStyle.headTextR}>{kindLabel}</Text>
        </View>
        <View style={themedStyle.rowBodyView}>
          {data.kind != 2 ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: UTILS.getGlucoseColor(data.glucose_value, this.props.hospitalInfo) }}>
                {`${data.glucose_value.toFixed(1)} `}
              </Text>
              <Text style={themedStyle.bodyTextR}>mmol/L</Text>
            </View>
          ) : (
              <View />
            )}

          <Text style={themedStyle.bodyTextR}>{`${data.time &&
            UTILS.getFormattedDate(data.time, 3)}`}</Text>
        </View>
        <View style={themedStyle.rowBodyGap} />
        <View style={themedStyle.rowBodyView}>
          <Text style={themedStyle.headTextL}>
            {data.kind == 2 ? "" : `${GLOBAL.COMMON_POINTS[data.glucose_point]}`}
          </Text>
          <Text style={themedStyle.bodyTextR}>{UTILS.getFormattedDate(data.updated_at, 3)}</Text>
        </View>
      </View>
    );
  }
}

export const UploadListItem = withStyles(MyComponent, (theme: ThemeType) => ({
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
    justifyContent: "space-between",
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
    fontSize: 18,
    padding: 3,
    color: "#707070"
  },
  headTextR: {
    fontSize: 18,
    padding: 3,
    color: theme["color-warning-500"]
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
  }
}));
