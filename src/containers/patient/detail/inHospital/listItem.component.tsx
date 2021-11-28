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
import { InhospitalModel } from "@src/core/model";

import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";
interface ComponentProps {
  data: InhospitalModel;
  onItemPress: (item: InhospitalModel) => void;
  onSubItemPress: (item: InhospitalModel) => void;
}

type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  private renderRightIcon = (style: StyleType): React.ReactElement<ImageProps> => {
    const { themedStyle } = this.props;

    return PatientInfoIconOutline({ ...style });
  };

  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    const state = (data.out_date == null || data.out_date == '') ? '在院' : '已出院';
    return (
      <View style={themedStyle.row}>
        <View style={[themedStyle.col, { width: 80 }]}>
          <Text style={commonStyles.textParagraph}>{`${data.doctor_name}`}</Text>
        </View>
        <View style={[themedStyle.col, { width: 100 }]}>
          <Text style={commonStyles.textParagraph}>
            {data.in_date ? data.in_date.substr(0, 10) : ""}
          </Text>
        </View>
        <View style={[themedStyle.col, { width: 100 }]}>
          <Text style={commonStyles.textParagraph}>
            {data.out_date ? data.out_date.substr(0, 10) : ""}
          </Text>
        </View>
        <View style={[themedStyle.col, { width: 100 }]}>
          <Text style={commonStyles.textWarning}>{`${state}`}</Text>
        </View>
        {false && (
          <View style={[themedStyle.col, { width: 80 }]}>
            <TouchableOpacity onPress={() => this.props.onSubItemPress(data)}>
              <Text style={commonStyles.textLink}>{Strings.patient.str_showChangeDepart}</Text>
            </TouchableOpacity>
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
    paddingVertical: 5,
    paddingHorizontal: 6,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 0,
    width: "100%"
  },
  col: {
    frex: 1,
    paddingVertical: 0,
    justifyContent: "space-between"
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
}));
