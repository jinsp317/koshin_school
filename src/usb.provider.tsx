import React from "react";
import { NativeModules } from "react-native";
import { Alert, ToastAndroid, MaskedViewComponent, ImageProps } from "react-native";
const usb = NativeModules.ReactNativeUsb;

export const UsbContext = React.createContext({ isConnected: true });

export class UsbProvider extends React.PureComponent {
  state = {
    isConnected: true
  };

  async componentDidMount() {
    await usb.connect(0, 0);
    // setup data event listener
    usb.on('data', data => {
      Alert.alert("1");
      if (__DEV__) console.info(data);
      this.handleConnectivityChange;
    });
  }

  componentWillUnmount() {

  }

  handleConnectivityChange = isConnected => this.setState({ isConnected });

  render() {
    return (
      <UsbContext.Provider value={this.state}>
        {this.props.children}
      </UsbContext.Provider>
    );
  }
}
