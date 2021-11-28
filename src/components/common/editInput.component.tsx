import React from "react";
import {
  StyleProp,
  TextProps,
  TextStyle,
  View,
  ViewProps,
  Image,
  ImageProps,
  ImageStyle,
  TextInput,
  TextInputProps,
  Text
} from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  StyleType
} from "@src/core/react-native-ui-kitten/theme";
import { textStyle } from "@src/components/common/style";
import { IconSource } from "@src/assets/icons";
import { ArrowRightIconFill } from "@src/assets/icons";
import { ImageSource } from "@src/assets/images";
import { number } from "prop-types";
import { themes } from "@src/core/themes";
import commonStyles from "@src/containers/styles/common";
declare type IconElement = React.ReactElement<ImageProps>;
declare type IconProp = (style: StyleType) => IconElement;
interface ComponentProps {
  hint?: string;
  value?: string;
  defaultValue?: string;
  rightIcon?: boolean;
}

export type ProfileSettingProps = ComponentProps &
  ViewProps &
  ThemedComponentProps &
  TextInputProps;

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
    return <Text style={style}>{text}</Text>;
  };

  public render(): React.ReactNode {
    const {
      style,
      themedStyle,
      hint,
      value,
      defaultValue,
      rightIcon,
      ...restProps
    } = this.props;
    const { container, hintLabel, valueLabel, ewaButtonIcon } = themedStyle;
    const valueColor = this.props.editable
      ? themes["App Theme"]["color-basic-900"]
      : themes["App Theme"]["color-basic-600"];
    return (
      <View {...restProps} style={[container, style]}>
        {hint ? this.renderTextElement(`${hint} : `, hintLabel) : null}
        <View style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center"
        }}
        >
          <TextInput
            editable={
              this.props.editable == undefined ? true : this.props.editable
            }
            maxLength={this.props.maxLength}
            style={[themedStyle.editInput, { color: valueColor }]}
            onChangeText={this.props.onChangeText}
            placeholder={this.props.placeholder}
            keyboardType={this.props.keyboardType}
            value={value}
            defaultValue={defaultValue}
          />
        </View>
      </View>
    );
  }
}

export const EditInput = withStyles(
  ProfileSettingComponent,
  (theme: ThemeType) => ({
    container: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingLeft: 10,
      paddingVertical: 0
    },
    hintLabel: { ...commonStyles.sectionText },
    valueLabel: {
      // color: theme["text-basic-color"],
      ...textStyle.caption2,
      fontSize: 18
    },
    ewaButtonIcon: {
      marginHorizontal: 0,
      width: 16,
      height: 18
      // tintColor: "red"
    },
    editInput: {
      flex: 1,
      color: theme["color-basic-900"],
      fontSize: 18,
      textAlign: "left"
    }
  })
);
