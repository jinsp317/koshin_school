import React from "react";
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  StyleSheet,
  ImageProps
} from "react-native";
import { ThemedComponentProps, ThemeType, withStyles } from "@src/core/react-native-ui-kitten/theme";
import { ImageSourcePropType, ImageStyle, StyleProp } from "react-native";

interface ComponentProps {
  imgSrc: ImageSourcePropType;
  onPress: () => void;
  disabled?: boolean;
  width: number;
  height: number;
  tintColor?: string;
}

export type ImageButtonProps = ThemedComponentProps & ComponentProps;

export default class ImageButton extends React.Component<ImageButtonProps> {
  private onPress = () => {
    this.props.onPress();
  };
  render() {
    return (
      <TouchableOpacity
        style={styles.touchable}
        onPress={this.onPress}
        disabled={this.props.disabled}
      >
        <Image
          source={this.props.imgSrc}
          style={{
            backgroundColor: "transparent",
            width: this.props.width,
            height: this.props.height,
            tintColor: this.props.tintColor
          }}
        />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    position: "absolute",
    backgroundColor: "transparent"
  },
  image: {},
  touchable: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  text: {
    fontSize: 18,
    textAlign: "center"
  }
});
