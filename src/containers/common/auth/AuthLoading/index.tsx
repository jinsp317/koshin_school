import * as React from "react";
import {
  ActivityIndicator,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Image
} from "react-native";
import { imageIsensLogo } from "@src/assets/images";
import GLOBAL from "@src/core/globals";
import { database } from "@src/core/utils/database";
interface Props {
  navigation: any;
}
interface State { }

export class AuthLoadingScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  componentDidMount() {
    this.timer();
  }
  private timer = () => {
    setTimeout(() => {
      this._bootstrapAsync();
    }, 2000);
  };
  render() {
    return (
      <View style={styles.container}>
        <Image
          source={imageIsensLogo.imageSource}
          style={{ width: 240, height: 180 }}
          resizeMode="stretch"
        />
        <View style={{ height: 100 }} />
      </View>
    );
  }
  private _bootstrapAsync = async () => {
    await this.requestAppPermissions();
    const xpath = false ? "MainNavigator" : "FirstNavigator";
    if (GLOBAL.isSignin) {
      database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    }
    this.props.navigation.navigate(xpath);
  };
  async requestAppPermissions() {
    try {
      let granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // console.log("You can use the ACCESS_COARSE_LOCATION permission");
      } else {
        // console.log("ACCESS_COARSE_LOCATION permission access denied");
      }

      granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // console.log("You can use the ACCESS_FINE_LOCATION permission");
      } else {
        // console.log("ACCESS_FINE_LOCATION permission  access denied");
      }
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // console.log("You can use the camera");
        } else {
          // console.log("Camera permission denied");
        }
      } catch (err) {
        // console.warn(err);
      }
      /*
      let permissions = [];
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the bluetooth');
      } else {
        console.log('Bluetooth permission denied');
      }
      */
    } catch (err) {
      console.warn(err);
    }
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
