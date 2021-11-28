import React from "react";
import { View, Dimensions, ScaledSize } from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  ModalComponentCloseProps
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Text, Input } from "@src/core/react-native-ui-kitten/ui";
import { textStyle, ValidationInput } from "@src/components/common";
import Strings from "@src/assets/strings";
import {
  PersonIconFill,
  CreditCardIconFill,
  DoctorIconOutline,
  StarIconFill,
  LoginIconOutline,
  LoginoutOutline,
  EditIconOutline,
  TrashIconOutline
} from "@src/assets/icons";
import { StringValidator } from "@src/core/validators";
import GLOBAL from "@src/core/globals";
import { PatientFindModel } from "@src/core/model";

interface ComponentProps {
  onItemPress: (index: number) => void;
  onDelete: () => void;
  isYuannei: boolean;
  caption: string;
}

type Props = ThemedComponentProps & ComponentProps; // & ModalComponentCloseProps;

class MyModalComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <View style={themedStyle.container}>
        <View style={themedStyle.headerContainer}>
          <Text style={themedStyle.titleLabel} category="h6">
            {this.props.caption}
          </Text>
        </View>
        <View style={{ paddingTop: 5 }}>
          <Button
            style={{
              width: "100%",
              margin: 2,
              borderRadius: 3,
              borderWidth: 0.5
            }}
            icon={PersonIconFill}
            size="giant"
            onPress={() => this.props.onItemPress(0)}
          >
            {this.props.isYuannei ? Strings.patient.faqihuizhen : Strings.patient.faqisuifang}
          </Button>

          <Button
            style={{
              width: "100%",
              margin: 2,
              borderRadius: 3,
              justifyContent: "center"
            }}
            icon={this.props.isYuannei ? LoginIconOutline : LoginoutOutline}
            size="giant"
            onPress={() => this.props.onItemPress(1)}
          >
            {this.props.isYuannei ? Strings.patient.banlichuyuan : Strings.patient.banliruyuan}
          </Button>
          <Button
            style={{ width: "100%", margin: 2, borderRadius: 3 }}
            icon={this.props.isYuannei ? EditIconOutline : TrashIconOutline}
            size="giant"
            onPress={() => this.props.onItemPress(2)}
          >
            {this.props.isYuannei ? Strings.patient.xiugaizhuyuan : Strings.patient.yichuhuanzhe}
          </Button>
          {/* <Button
            style={{ width: "100%", margin: 2, borderRadius: 3 }}
            icon={TrashIconOutline}
            size="giant"
            onPress={() => this.props.onItemPress(10)}
          >
            {Strings.patient.str_delete}
          </Button> */}
        </View>
      </View>
    );
  }
}

export const PatientManageMenuModal = withStyles(MyModalComponent, (theme: ThemeType) => {
  const dimensions: ScaledSize = Dimensions.get("window");
  const contentWidth: number = dimensions.width / 2; // - 24;
  const contentHeight: number = 192;

  return {
    container: {
      alignItems: "center",
      borderWidth: 0,
      borderColor: theme["color-primary-500"],
      zIndex: 1,
      // justifyContent: "space-between",
      width: contentWidth,
      // height: contentHeight,
      borderRadius: 3,
      // top: (dimensions.height - contentHeight) / 2,
      // left: (dimensions.width - contentWidth) / 2,
      backgroundColor: theme["mycolor-background"]
    },
    headerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 0,

      borderColor: theme["mycolor-lightgray"],
      margin: 20
    },
    titleLabel: {
      ...textStyle.headline,
      color: theme["color-warning-500"]
    },
    descriptionLabel: {
      marginVertical: 24,
      ...textStyle.paragraph
    }
  };
});
