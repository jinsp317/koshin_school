import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import QRCode from "react-native-qrcode";
import GLOBAL from "@src/core/globals";

export class MakeQRCodeScreen extends React.Component<NavigationScreenProps> {
  public render(): React.ReactNode {
    return (
      <View style={styles.container}>
        <QRCode
          value={`http://${GLOBAL.server_ip}/api/version/download?id=1`}
          //Setting the value of QRCode
          size={250}
          //Size of QRCode
          bgColor="#000"
          //Backgroun Color of QRCode
          fgColor="#fff"
          //Front Color of QRCode
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  }
});
