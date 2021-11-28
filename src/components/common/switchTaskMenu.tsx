import Strings from "@src/assets/strings";
import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageProps,
  ImageStyle,
  StyleProp
} from "react-native";
import Menu, {
  MenuTrigger,
  MenuOptions,
  MenuOption,
  renderers
} from "react-native-popup-menu";
import { HistoryIconOutline, StarIconFill } from "@src/assets/icons";
import {
  Button,
  TopNavigationAction,
  TopNavigationActionProps
} from "@src/core/react-native-ui-kitten/ui";
import { themes } from "@src/core/themes";
import { MenuDataModel } from "@src/core/model";
import { IconElement } from "@src/assets/icons/icon.component";
import { textStyle } from "./style";

type TopNavigationActionElement = React.ReactElement<TopNavigationActionProps>;
const { Popover } = renderers;
type IconProp = (style) => React.ReactElement<ImageProps>;

interface SwitchTaskMenuProp {
  onItemSelect: (route: string) => void;
  menuText: string;
  data: MenuDataModel[];
  onLeftItemPress?: () => void;
  onRightItemPress?: () => void;
  leftItemText?: string;
  rightItemText?: string;
  leftIcon?: IconProp;
  rightIcon?: IconProp;
}
// type Props = ThemedComponentProps & ComponentProps;
export default class SwitchTaskMenu extends React.Component<
  SwitchTaskMenuProp
> {
  private renderIconElement = (
    icon: IconProp,
    style: StyleProp<ImageStyle>
  ): React.ReactElement<ImageProps> => {
    const flatStyle: ImageStyle = StyleSheet.flatten(style);
    const iconElement: React.ReactElement<ImageProps> = icon(flatStyle);

    return React.cloneElement(iconElement, {
      style: [flatStyle, iconElement.props.style]
    });
  };
  private renderIconControl = (
    rightSrc: IconProp,
    kind: number
  ): TopNavigationActionElement => {
    return (
      <TopNavigationAction
        icon={rightSrc}
        onPress={
          kind === 0 ? this.props.onLeftItemPress : this.props.onRightItemPress
        }
      />
    );
  };

  render() {
    return (
      <View style={styles.topbar}>
        {this.props.leftIcon && this.renderIconControl(this.props.leftIcon, 0)}
        {!this.props.leftIcon && this.props.rightIcon && (
          <View style={{ width: 50 }} />
        )}
        <Menu
          onSelect={this.props.onItemSelect}
          renderer={Popover}
          rendererProps={{
            preferredPlacement: "bottom",
            anchorStyle: styles.anchor
          }}
        >
          <MenuTrigger customStyles={{ triggerOuterWrapper: styles.trigger }}>
            <Text
              style={[textStyle.myheadtitle, styles.triggerText]}
            >{`${this.props.menuText} ▼`}</Text>
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionText: styles.text,
              optionsContainer: styles.optionsContainer
            }}
          >
            {this.props.data.map((data, index) => {
              return (
                <View key={index}>
                  <MenuOption
                    value={data.route}
                    text={`  ${data.caption}`}
                    style={styles.optionsItem}
                    customStyles={{
                      optionText: { fontSize: 18, color: "white" }
                    }}
                  />
                  {index != this.props.data.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              );
            })}
          </MenuOptions>
        </Menu>

        {this.props.rightIcon &&
          this.renderIconControl(this.props.rightIcon, 1)}
        {!this.props.rightIcon && this.props.leftIcon && (
          <View style={{ width: 50 }} />
        )
        /*
        일부폰에서 아래의 렌더링방식 오류, 아이컨이 현시안됨
        <TouchableOpacity
        style={styles.actionItem}
        onPress={this.props.onRightItemPress}
      >
        {this.props.rightIcon &&
          this.renderIconElement(this.props.rightIcon, [styles.rightIcon])}
        {!this.props.rightIcon && this.props.leftItemText && (
          <View style={{ width: 50 }} />
        )}
      </TouchableOpacity>
      */
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: themes["App Theme"]["color-primary-500"],
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  trigger: {
    margin: 5
  },
  triggerText: {
    color: "white",
    paddingVertical: 6,
    paddingHorizontal: 30
  },
  text: {
    fontSize: 16,
    color: "white"
  },
  disabled: {
    color: "#ccc"
  },
  divider: {
    marginVertical: 5,
    marginHorizontal: 2,
    borderBottomWidth: 1,
    borderColor: "#ccc"
  },
  slideInOption: {
    padding: 5,
    backgroundColor: "red"
  },
  optionsContainer: {
    marginTop: 0,
    flex: 1,
    width: 120,
    backgroundColor: "#1CAFF6"
  },
  optionsItem: {
    alignItems: "flex-start"
  },
  anchor: {
    backgroundColor: "#1CAFF6"
  },
  actionItem: {
    alignSelf: "center",
    marginHorizontal: 6
  },
  actionItemText: {
    fontSize: 14,
    color: "white"
  },
  leftIcon: {
    tintColor: "white",
    resizeMode: "stretch",
    width: 22,
    height: 22
  },
  rightIcon: {
    tintColor: "white",
    resizeMode: "stretch",
    width: 24,
    height: 24
  }
});
