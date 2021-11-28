import React, { Component } from "react";
import {
  ScrollView,
  Text,
  TouchableHighlight,
  View,
  RefreshControl,
  ImageProps,
  ImageStyle,
  StyleProp,
  StyleSheet
} from "react-native";
import styles from "../styles";
import {
  ThemeProvider,
  ThemedComponentProps,
  ThemeType,
  withStyles,
  StyleType
} from "@src/core/react-native-ui-kitten/theme";
import { BluetoothIconOutline } from "@src/assets/icons";
type IconProp = (style: StyleType) => React.ReactElement<ImageProps>;

interface ComponentProps {
  devices: any[];
  onDevicePressed: (device) => void;
  onRefresh?: () => void;
}

type Props = ComponentProps & ThemedComponentProps;
class MyComponent extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false
    };
  }

  onDevicePressed = device => () => {
    if (typeof this.props.onDevicePressed === "function") {
      this.props.onDevicePressed(device);
    }
  };

  onRefresh = async () => {
    if (typeof this.props.onRefresh === "function") {
      this.setState({ refreshing: true });
      await this.props.onRefresh();
      this.setState({ refreshing: false });
    }
  };

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

  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const { devices = [] } = this.props;
    const iconElement = this.renderIconElement(BluetoothIconOutline, [
      themedStyle.bluetoothActiveIcon
    ]);
    return (
      <ScrollView
        style={styles.container}
        /*refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={this.onRefresh} />
        }*/
      >
        <View style={styles.listContainer}>
          {devices.map(device => (
            <TouchableHighlight
              underlayColor="#eee"
              key={device.id}
              style={styles.listItem}
              onPress={this.onDevicePressed(device)}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <View>
                  <View style={themedStyle.deviceCaptionContainer}>
                    <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                      {device.name}
                    </Text>
                  </View>
                  <View>
                    <Text>{`${device.id}`}</Text>
                  </View>
                </View>
                <View>
                  {this.renderIconElement(BluetoothIconOutline, [
                    device.paired
                      ? themedStyle.bluetoothActiveIcon
                      : themedStyle.bluetoothDeactiveIcon
                  ])}
                </View>
              </View>
            </TouchableHighlight>
          ))}
        </View>
      </ScrollView>
    );
  }
}
export const DeviceList = withStyles(MyComponent, (theme: ThemeType) => ({
  deviceCaptionContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  bluetoothActiveIcon: {
    tintColor: theme["color-primary-500"],
    width: 30,
    height: 30
  },
  bluetoothDeactiveIcon: {
    tintColor: "lightgray",
    width: 30,
    height: 30
  }
}));
