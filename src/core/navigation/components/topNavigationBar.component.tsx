import React from "react";
import { ThemeProvider, StyleType, ThemeType, withStyles } from "@src/core/react-native-ui-kitten/theme";
import { ImageProps, Alert } from "react-native";
import {
  TopNavigation,
  TopNavigationAction,
  TopNavigationActionProps,
  TopNavigationProps
} from "@src/core/react-native-ui-kitten/ui";
import { textStyle } from "@src/components/common";
import { SafeAreaView } from "./safeAreaView.component";
import {
  StarIconFill,
  ArrowIosBackFill,
  SearchIconFill,
  ScannerIconFill
} from "@src/assets/icons";
import { themes } from "@src/core/themes";

export interface ComponentProps {
  backIcon?: BackIconProp;
  onBackPress?: () => void;
  right1Icon?: BackIconProp;
  onRight1Press?: () => void;
  right2Icon?: BackIconProp;
  onRight2Press?: () => void;
}

export type TopNavigationBarProps = TopNavigationProps & ComponentProps;

type BackIconProp = (style: StyleType) => React.ReactElement<ImageProps>;
type BackButtonElement = React.ReactElement<TopNavigationActionProps>;

// type RightIcon1Prop = (style: StyleType) => React.ReactElement<ImageProps>;
type RightIconElement = React.ReactElement<TopNavigationActionProps>;

// type RightIcon2Prop = (style: StyleType) => React.ReactElement<ImageProps>;
type RightIcon2Element = React.ReactElement<TopNavigationActionProps>;

type TopNavigationElement = React.ReactElement<TopNavigationProps>;
type TopNavigationActionElement = React.ReactElement<TopNavigationActionProps>;

class TopNavigationBarComponent extends React.Component<TopNavigationBarProps> {
  private onBackButtonPress = () => {
    if (this.props.onBackPress) {
      this.props.onBackPress();
    }
  };
  private onRight1ButtonPress = () => {
    if (this.props.onRight1Press) {
      this.props.onRight1Press();
    }
  };
  private onRight2ButtonPress = () => {
    if (this.props.onRight2Press) {
      this.props.onRight2Press();
    }
  };

  private renderBackButton = (source: BackIconProp): BackButtonElement => {
    return (
      <TopNavigationAction icon={source} onPress={this.onBackButtonPress} />
    );
  };
  private renderRightControl = (
    rightSrc: BackIconProp,
    index: number
  ): TopNavigationActionElement => {
    return (
      <TopNavigationAction
        icon={rightSrc}
        onPress={
          index == 0 ? this.onRight1ButtonPress : this.onRight2ButtonPress
        }
      />
    );
  };

  public render(): React.ReactNode {
    const { themedStyle, title, backIcon, right1Icon, right2Icon } = this.props;
    const leftControlElement: BackButtonElement | null = backIcon
      ? this.renderBackButton(backIcon)
      : null;
    const right1ControlElement: RightIconElement | null = right1Icon
      ? this.renderRightControl(right1Icon, 0)
      : null;
    const right2ControlElement: RightIconElement | null = right2Icon
      ? this.renderRightControl(right2Icon, 1)
      : null;
    return (
      <ThemeProvider theme={{ ...this.props.theme, ...themes["App Theme"] }}>
        <SafeAreaView style={themedStyle.safeArea}>
          <TopNavigation
            alignment="center"
            title={title}
            titleStyle={textStyle.myheadtitle}
            subtitleStyle={textStyle.caption1}
            leftControl={leftControlElement}
            // rightControls={[right1ControlElement, right2ControlElement]}
            rightControls={right1ControlElement}
            style={themedStyle.safeArea}
          />
        </SafeAreaView>
      </ThemeProvider>
    );
  }
}

export const TopNavigationBar = withStyles(
  TopNavigationBarComponent,
  (theme: ThemeType) => ({
    safeArea: {
      backgroundColor: theme["color-primary-500"]
    }
  })
);
