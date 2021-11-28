import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableOpacityProps,
  Image,
  ToastAndroid,
  ScrollView,
  Dimensions,
  Alert,
  TextStyle,
  ViewStyle
} from "react-native";
import { ThemeType, withStyles, ThemedComponentProps } from "@src/core/react-native-ui-kitten/theme";
import { Text, Button, Radio } from "@src/core/react-native-ui-kitten/ui";
import { ContainerView, textStyle, MyDatePicker } from "@src/components/common";
import { ProfileSetting } from "@src/components/social";
import { CreditCardIconFill, PersonIconFill } from "@src/assets/icons";
import { imageCamera } from "@src/assets/images";

import SegmentedControlTab from "react-native-segmented-control-tab";
import { TextInput } from "react-native-gesture-handler";
import { ValidationInput } from "@src/components/common";
import { StringValidator } from "@src/core/validators";
import { GlucoseDeviceIconFill, SearchIconFill } from "@src/assets/icons";
import { FreePatientModel } from "@src/core/model";
import ImageButton from "@src/components/common/imageButton";
import Menu, {
  MenuProvider,
  MenuTrigger,
  MenuOptions,
  MenuOption,
  renderers
} from "react-native-popup-menu";

const unique = 0;
const { SlideInMenu } = renderers;
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";

// let UTILS = require("@src/core/app_utils");
const screenWidth = Dimensions.get("window").width;

interface ComponentProps {
  name: string;
  disabled?: boolean;
  onMenuItemSelect: (value: number) => void;
  curItemIndex: number;
  textStyle?: TextStyle;
  triggerStyle?: ViewStyle;
  arrowPos?: number;
  data: string[];
  cols?: number;
}
interface State {
  curItemIndex: number;
}

export type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public state: State = {
    curItemIndex: this.props.curItemIndex
  };
  componentDidMount() { }
  componentWillReceiveProps(nextProps) {
    if (this.state.curItemIndex != nextProps.curItemIndex) {
      this.setState({ curItemIndex: nextProps.curItemIndex });
    }
  }

  private onMenuItemPress = (value: number) => {
    if (this.state.curItemIndex === value) return;
    if (value === 666) return;

    this.setState({ curItemIndex: value });
    this.props.onMenuItemSelect(value);
  };
  private renderMenu = () => {
    const { themedStyle, data } = this.props;
    let value = data[this.state.curItemIndex];
    if (value == undefined) {
      value = '---';
    }
    const triggerText = !this.props.arrowPos ? `${value} ▽` : `▽   ${value}`;
    return (
      <Menu
        name={this.props.name}
        renderer={SlideInMenu}
        onSelect={value => {
          this.onMenuItemPress(value);
        }}
      >
        <MenuTrigger disabled={this.props.disabled}>
          <View style={[themedStyle.triggerContainer, this.props.triggerStyle]}>
            <Text style={[themedStyle.triggerText, this.props.textStyle]}>
              {triggerText}
            </Text>
          </View>
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionText: [themedStyle.menuText, themedStyle.slideInOption]
          }}
        >
          <ScrollView style={{ maxHeight: 300 }}>
            {data.map((item, index) => {
              const cols = this.props.cols ? this.props.cols : 1;
              const optionStyle =
                cols === 1
                  ? [
                    themedStyle.menuOption,
                    { width: "100%", alignItems: "center" }
                  ]
                  : themedStyle.menuOption;
              if (index % cols === 0) {
                return (
                  <View style={themedStyle.menuRowContainer} key={index}>
                    <MenuOption
                      value={index}
                      text={data[index]}
                      style={optionStyle}
                    />
                    {cols > 1 && index + 1 < data.length && (
                      <MenuOption
                        value={index + 1}
                        text={data[index + 1]}
                        style={optionStyle}
                      />
                    )}
                  </View>
                );
              }
            })}
          </ScrollView>
          <View style={{ alignItems: "center", padding: 20 }}>
            <MenuOption
              value={666}
              text={Strings.common.str_cancel}
              style={{ width: "100%", alignItems: "center" }}
            />
          </View>
        </MenuOptions>
      </Menu>
    );
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    return <View>{this.renderMenu()}</View>;
  }
}

export const SlideMenu = withStyles(MyComponent, (theme: ThemeType) => ({
  triggerContainer: {
    backgroundColor: "write", // theme["color-warning-500"],
    borderWidth: 1,
    borderColor: theme["color-primary-500"],
    borderRadius: 4,
    alignItems: "center",
    padding: 11
  },
  triggerText: {
    color: theme["color-primary-500"], // "white",
    fontSize: 14,
    fontWeight: "bold"
  },
  menuRowContainer: {
    paddingVertical: 6,
    flexDirection: "row",
    borderWidth: 0.3,
    borderColor: "lightgray"
    //    justifyContent: "space-around"
  },
  menuOption: {
    width: "50%",
    borderLeftWidth: 0.3,
    borderRightWidth: 0.3,
    borderColor: "lightgray"
  },
  menuText: {
    fontSize: 20
  }
}));
