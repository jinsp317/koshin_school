import React from "react";
import { ImageProps, View, Alert } from "react-native";
import {
  StyleType,
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import {
  ListItem,
  ListItemProps,
  Text,
  CheckBox
} from "@src/core/react-native-ui-kitten/ui";
import { textStyle } from "@src/components/common";
import { ThemeContext, ThemeKey } from "@src/core/themes";
import GLOBAL from "@src/core/globals";
import { ObjectModel } from "@src/core/model";
interface ComponentProps {
  data: ObjectModel;
  onItemPress: (index: number, checked: boolean) => void;
}
interface State {
  checked: boolean;
}
export type Props = ThemedComponentProps & ListItemProps & ComponentProps;

class MyComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const checked = this.props.data.checked;
    this.state = { checked };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ checked: nextProps.data.checked });
  }
  private onCheckChange = (checked: boolean) => {
    this.setState({ checked });
    this.props.onItemPress(this.props.index, checked);
  };

  private onItemPress = (index, e) => {
    const checked = !this.state.checked;
    this.onCheckChange(checked);
  };
  public render(): React.ReactNode {
    const { style, themedStyle, ...restProps } = this.props;

    return (
      <ThemeContext.Consumer>
        {({ currentTheme }) => (
          <ListItem
            {...restProps}
            style={[themedStyle.container, style]}
            onPress={(i, e) => this.onItemPress(i, e)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <CheckBox
                checked={this.state.checked}
                onChange={this.onCheckChange}
              />
              <Text style={themedStyle.title} category="s1">
                {this.props.data.name}
              </Text>
            </View>
          </ListItem>
        )}
      </ThemeContext.Consumer>
    );
  }
}

export const CheckboxListItem = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    borderRadius: 0,
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  icon: {
    width: 20,
    height: 20
  },
  title: {
    marginLeft: 10,
    ...textStyle.paragraph,
    fontSize: 16,
    color: theme["color-basic-600"]
  },
  content: {
    marginTop: 3,
    ...textStyle.paragraph,
    color: "#adbab8"
  }
}));
