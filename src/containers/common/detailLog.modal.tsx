import React from "react";
import { View, Dimensions, ScaledSize, TouchableOpacity, FlatList } from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { Text } from "@src/core/react-native-ui-kitten/ui";
import { textStyle } from "@src/components/common";
import GLOBAL from "@src/core/globals";
import { GlucoseMonitorModel, HospitalModel } from "@src/core/model";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";

interface ComponentProps {
  onOK: (index: number) => void;
  hospitalInfo: HospitalModel;
  monitors: GlucoseMonitorModel[];
}

type Props = ThemedComponentProps & ComponentProps;

class MyModalComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  private onOK = (index: number): void => {
    this.props.onOK(index);
  };
  _keyExtractor = item => item.id.toString();
  _renderItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => {
        this.onOK(index);
      }}
    >
      <View style={{ paddingVertical: 10, flexDirection: "row" }}>
        <Text style={UTILS.getGlucoseValueStyle(item, this.props.hospitalInfo)}>
          {`${UTILS.getGlucoseValueString(item)} `}</Text>
        <Text>mmol/L</Text>
        <Text style={commonStyles.textMain}>{`  ${UTILS.getMinuteString(item.time)}`}</Text>
      </View>
    </TouchableOpacity>
  );
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const title =
      this.props.monitors && this.props.monitors.length > 0
        ? `${this.props.monitors[0].patient_name}  (${
        GLOBAL.COMMON_POINTS[this.props.monitors[0].point]
        })`
        : "";

    return (
      <View style={themedStyle.container}>
        <View style={themedStyle.headerContainer}>
          <Text style={themedStyle.titleLabel} category="h6">
            {title}
          </Text>
        </View>
        <View>
          <FlatList
            contentContainerStyle={{ padding: 20, marginBottom: 20 }}
            keyExtractor={this._keyExtractor}
            data={this.props.monitors}
            renderItem={this._renderItem}
          />
        </View>
      </View>
    );
  }
}

export const DetailLogModal = withStyles(MyModalComponent, (theme: ThemeType) => {
  const dimensions: ScaledSize = Dimensions.get("window");

  return {
    container: {
      borderWidth: 0,
      borderColor: theme["color-primary-500"],
      zIndex: 1,
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: theme["mycolor-background"]
    },
    headerContainer: {
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 1,

      borderColor: theme["mycolor-lightgray"],
      padding: 10
    },
    titleLabel: {
      ...textStyle.headline,
      color: theme["#ccc"]
    },
    warningLabel: {
      ...textStyle.headline,
      color: theme["color-warning-500"]
    },
    rowLabel: {
      ...textStyle.subtitle,
      fontSize: 20,
      color: theme["#ccc"]
    },
    descriptionLabel: {
      marginVertical: 24,
      ...textStyle.paragraph
    },
    row: {
      flexDirection: "row",
      paddingVertical: 10,
      justifyContent: "center",
      alignItems: "center"
    }
  };
});
