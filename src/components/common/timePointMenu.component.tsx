import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableOpacityProps,
  Image,
  ToastAndroid,
  Dimensions,
  Alert,
  TextStyle,
  ViewStyle
} from "react-native";
import {
  ThemeType,
  withStyles,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
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
import Draggable from "@src/components/common/Draggable";

// let UTILS = require("@src/core/app_utils");
const screenWidth = Dimensions.get("window").width;

interface ComponentProps {
  onMenuItemSelect: (value: number) => void;
  curTimeMark: number;
  textStyle?: TextStyle;
  triggerStyle?: ViewStyle;
  arrowPos?: number;
}
interface State {
  curTimeMark: number;
}

export type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public state: State = {
    curTimeMark: this.props.curTimeMark // GLOBAL.p_timeMark //free time
  };
  componentDidMount() {}

  private onTimeMarkMenuItemPress = (value: number) => {
    if (value < 10) {
      this.setState({ curTimeMark: value });
      this.props.onMenuItemSelect(value);
    }
  };
  private renderTimeMarkMenu = () => {
    const { themedStyle } = this.props;
    return (
      <Menu
        name="TimeMarks"
        renderer={SlideInMenu}
        onSelect={value => {
          this.onTimeMarkMenuItemPress(value);
        }}
      >
        <MenuTrigger>
          <View style={[themedStyle.triggerContainer, this.props.triggerStyle]}>
            <Text style={[themedStyle.triggerText, this.props.textStyle]}>
              {this.props.arrowPos
                ? `${GLOBAL.COMMON_POINTS[this.state.curTimeMark]} ▽`
                : `▽   ${GLOBAL.COMMON_POINTS[this.state.curTimeMark]}`}
            </Text>
          </View>
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionText: [themedStyle.menuText, themedStyle.slideInOption]
          }}
        >
          <View style={themedStyle.menuRowContainer}>
            <MenuOption
              value={0}
              text={GLOBAL.COMMON_POINTS[0]}
              style={themedStyle.menuOption}
            />
            <MenuOption
              value={1}
              text={GLOBAL.COMMON_POINTS[1]}
              style={themedStyle.menuOption}
            />
          </View>
          <View style={themedStyle.menuRowContainer}>
            <MenuOption
              value={2}
              text={GLOBAL.COMMON_POINTS[2]}
              style={themedStyle.menuOption}
            />
            <MenuOption
              value={3}
              text={GLOBAL.COMMON_POINTS[3]}
              style={themedStyle.menuOption}
            />
          </View>
          <View style={themedStyle.menuRowContainer}>
            <MenuOption
              value={4}
              text={GLOBAL.COMMON_POINTS[4]}
              style={themedStyle.menuOption}
              // customStyles={{ optionText: themedStyle.menuOptionText }}
            />
            <MenuOption
              value={5}
              text={GLOBAL.COMMON_POINTS[5]}
              style={themedStyle.menuOption}
            />
          </View>
          <View style={themedStyle.menuRowContainer}>
            <MenuOption
              value={6}
              text={GLOBAL.COMMON_POINTS[6]}
              style={themedStyle.menuOption}
            />
            <MenuOption
              value={7}
              text={GLOBAL.COMMON_POINTS[7]}
              style={themedStyle.menuOption}
            />
          </View>
          <View style={themedStyle.menuRowContainer}>
            <MenuOption
              value={8}
              text={GLOBAL.COMMON_POINTS[8]}
              style={themedStyle.menuOption}
            />
            <MenuOption
              value={9}
              text={GLOBAL.COMMON_POINTS[9]}
              style={themedStyle.menuOption}
            />
          </View>
          <View style={{ alignItems: "center", padding: 20 }}>
            <MenuOption value={10} text={Strings.common.str_cancel} />
          </View>
        </MenuOptions>
      </Menu>
    );
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <View style={themedStyle.getLogBtn}>{this.renderTimeMarkMenu()}</View>
      </View>
    );
  }
}

export const TimePointMenu = withStyles(MyComponent, (theme: ThemeType) => ({
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
    borderColor: "lightgray",
    justifyContent: "space-around"
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
