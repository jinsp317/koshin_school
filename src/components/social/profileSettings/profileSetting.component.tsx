import React from "react";
import {
  StyleProp,
  TextProps,
  TextStyle,
  View,
  ViewProps,
  Image,
  ImageProps,
  ImageStyle
} from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  StyleType
} from "@src/core/react-native-ui-kitten/theme";
import { Text } from "@src/core/react-native-ui-kitten/ui";
import { textStyle } from "@src/components/common";
import { IconSource } from "@src/assets/icons";
import { ArrowRightIconFill } from "@src/assets/icons";
import { ImageSource } from "@src/assets/images";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFileDownload, faSyncAlt } from '@fortawesome/free-solid-svg-icons'
declare type IconElement = React.ReactElement<ImageProps>;
declare type IconProp = (style: StyleType) => IconElement;
import { themes } from "@src/core/themes";
interface ComponentProps {
  hint?: string;
  value: string;
  hideRightIcon?: boolean;
  showLeftIcons?: boolean;
  hintStyle?: TextStyle;
  valueStyle?: TextStyle;
}

export type ProfileSettingProps = ComponentProps &
  ViewProps &
  ThemedComponentProps;

class ProfileSettingComponent extends React.Component<ProfileSettingProps> {
  private renderRightIcon = (
    style: StyleType
  ): React.ReactElement<ImageProps> => {
    const { themedStyle } = this.props;

    return ArrowRightIconFill({ ...style, ...themedStyle.ewaButtonIcon });
  };

  private renderTextElement = (
    text: string,
    style: StyleProp<TextStyle>
  ): React.ReactElement<TextProps> => {
    return (
      <Text style={[style, { marginHorizontal: 6 }]} appearance="hint">
        {text}
      </Text>
    );
  };

  public render(): React.ReactNode {
    const {
      style,
      themedStyle,
      hint,
      value,
      showLeftIcons,
      hideRightIcon: rightIcon,
      ...restProps
    } = this.props;
    let { container, hintLabel, valueLabel, ewaButtonIcon } = themedStyle;
    if (this.props.hintStyle) hintLabel = [hintLabel, this.props.hintStyle];
    if (this.props.valueStyle) valueLabel = [valueLabel, this.props.valueStyle];

    return (
      <View {...restProps} style={[container, style, { justifyContent: 'space-between' }]}>
        {hint ? this.renderTextElement(hint, hintLabel) : null}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          {showLeftIcons && (
            <FontAwesomeIcon icon={faSyncAlt} size={18} color={themes["App Theme"]["color-primary-500"]} style={{ marginRight: 4 }} />
          )}
          {this.renderTextElement(value, valueLabel)}
          {this.props.hideRightIcon ? (
            <View style={{ width: 15 }} />
          ) : (
              this.renderRightIcon(ewaButtonIcon)
            )}
        </View>
      </View>
    );
  }
}

export const ProfileSetting = withStyles(
  ProfileSettingComponent,
  (theme: ThemeType) => ({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingLeft: 16,
      paddingVertical: 16
    },
    hintLabel: {
      ...textStyle.caption2,
      color: theme["#ccc"],
      fontSize: 18
    },
    valueLabel: {
      // color: "#ccc",
      fontSize: 18,
      ...textStyle.caption2
    },
    ewaButtonIcon: {
      marginHorizontal: 0,
      width: 16,
      height: 18
      // tintColor: "red"
    }
  })
);
