import React from "react";
import { View, ViewProps } from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import ImageButton from "./imageButton";

interface ComponentProps {
  isVisible: boolean;
  onPress: () => void;
}

export type Props = ThemedComponentProps & ViewProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    const { style, themedStyle, children, ...restProps } = this.props;

    return (
      this.props.isVisible && (
        <View style={{ position: "absolute", bottom: 1, right: 10 }}>
          <ImageButton
            onPress={this.props.onPress}
            imgSrc={require("@src/assets/images/source/icon_desc.png")}
            width={46}
            height={46}
          />
        </View>
      )
    );
  }
}

export const GlobalHelpButton = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
}));
