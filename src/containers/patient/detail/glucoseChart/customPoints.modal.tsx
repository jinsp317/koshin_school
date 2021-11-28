import React from "react";
import { View, Dimensions, ScaledSize, FlatList } from "react-native";
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
  DoctorIconOutline
} from "@src/assets/icons";
import { StringValidator } from "@src/core/validators";
import GLOBAL from "@src/core/globals";
import { PatientFindModel, ObjectModel } from "@src/core/model";
import { CheckboxListItem } from "./checkboxListItem.component";
const screenWidth = Dimensions.get("window").width;
interface ComponentProps {
  onOK: (points: number[]) => void;
  points: number[];
}
interface State {
  pointsObj: ObjectModel[];
}

type Props = ThemedComponentProps & ComponentProps;

class MyModalComponent extends React.Component<Props, State> {
  private _points: number[];
  constructor(props: Props) {
    super(props);

    this._points = this.props.points;
    this.state = {
      pointsObj: GLOBAL.COMMON_POINTS.map((item, index) => {
        return { id: index, name: item, checked: false };
      })
    };
  }

  private onOK = (): void => {
    this.state.pointsObj.forEach((e, index) => {
      if (e.checked) this._points.push(index);
    });
    this.props.onOK(this._points);
  };
  private onItemPress = (index: number, checked: boolean) => {
    this.state.pointsObj[index].checked = checked;
  };
  private renderItem = (item: ObjectModel, index: number) => {
    return (
      <CheckboxListItem
        index={index}
        style={this.props.themedStyle.item}
        data={item}
        onItemPress={this.onItemPress}
      />
    );
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <View style={themedStyle.container}>
        <View style={themedStyle.headerContainer}>
          <Text style={themedStyle.titleLabel} category="h6">
            餐 段
          </Text>
        </View>
        <View style={{ paddingVertical: 10, maxHeight: 400 }}>
          <FlatList
            contentContainerStyle={themedStyle.contentContainer}
            numColumns={2}
            data={this.state.pointsObj}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index, separators }) =>
              this.renderItem(item, index)
            }
          />
        </View>
        <Button
          textStyle={textStyle.button}
          appearance="ghost"
          size="large"
          onPress={this.onOK}
          style={{ borderWidth: 0.5 }}
        >
          {Strings.common.str_ok}
        </Button>
      </View>
    );
  }
}

export const CustomPointsModal = withStyles(
  MyModalComponent,
  (theme: ThemeType) => {
    const dimensions: ScaledSize = Dimensions.get("window");
    const contentWidth: number = dimensions.width - 24;
    const contentHeight: number = 192;

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
        color: theme["text-hint-color"]
      },
      descriptionLabel: {
        marginVertical: 24,
        ...textStyle.paragraph
      },
      item: {
        flex: 1,
        maxWidth: screenWidth / 2,
        marginHorizontal: 1,
        marginVertical: 1
      }
    };
  }
);
