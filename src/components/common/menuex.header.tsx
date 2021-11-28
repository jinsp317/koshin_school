import React from "react";
import { ImageProps } from "react-native";
import {
  StyleType,
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import {
  TopNavigationActionProps,
  TopNavigationAction,
  TopNavigation
} from "@src/core/react-native-ui-kitten/ui";
import { SafeAreaView } from "@src/core/navigation";
import {
  ArrowIosBackFill,
  UploadIconFill,
  SearchIconOutline
} from "@src/assets/icons";
import { textStyle } from "@src/components/common";
interface ComponentProps {
  title: string;
  onUpload: () => void;
  onBack?: () => void;
}

export type UploadHeaderProps = ThemedComponentProps & ComponentProps;

class UploadHeaderComponent extends React.Component<UploadHeaderProps> {
  private onBack = (): void => {
    this.props.onBack();
  };

  private onUpload = (): void => {
    this.props.onUpload();
  };

  private renderLeftControl = (): React.ReactElement<
    TopNavigationActionProps
  > => {
    return (
      <TopNavigationAction icon={ArrowIosBackFill} onPress={this.onBack} />
    );
  };

  private renderUploadIcon = (
    style: StyleType
  ): React.ReactElement<ImageProps> => {
    const { themedStyle } = this.props;

    return UploadIconFill({ ...style, ...themedStyle.rightIcon });
  };

  private renderRightControls = (): React.ReactElement<
    TopNavigationActionProps
  >[] => {
    return [
      //      <TopNavigationAction
      //        icon={SearchIconOutline}
      //        onPress={this.onSearch}
      //      />,
      <TopNavigationAction
        icon={this.renderUploadIcon}
        onPress={this.onUpload}
      />
    ];
  };

  public render(): React.ReactNode {
    const { themedStyle, title } = this.props;

    return (
      <SafeAreaView style={themedStyle.container}>
        <TopNavigation
          alignment="center"
          title={title}
          titleStyle={textStyle.myheadtitle}
          subtitleStyle={textStyle.caption1}
          //leftControl={this.renderLeftControl()}
          rightControls={this.renderRightControls()}
          style={themedStyle.container}
        />
      </SafeAreaView>
    );
  }
}

export const UploadHeader = withStyles(
  UploadHeaderComponent,
  (theme: ThemeType) => ({
    container: {
      backgroundColor: theme["color-primary-500"]
    },
    rightIcon: {
      tintColor: theme["background-basic-color-1"]
    }
  })
);
