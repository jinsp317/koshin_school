import * as React from "react";
import {
  ActivityIndicator,
  AppRegistry,
  StyleSheet,
  Text,
  View
} from "react-native";

import { NativeModules, ProgressBarAndroid } from "react-native";
import { Button } from "@src/core/react-native-ui-kitten/ui";
import RNFS from "react-native-fs";
import GLOBAL from "@src/core/globals";
import RNFetchBlob from 'rn-fetch-blob';
import ApkInstaller from 'react-native-apk-install'
interface Props {
  navigation: any;
}
interface State {
  downloadProgress: number;
}

export class UpdateAppVersionScene extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // setTimeout(() => {
    //  this._bootstrapAsync();
    // }, 1000);
    this.state = {
      downloadProgress: 0
    };
  }
  componentDidMount() {
    if (__DEV__) console.log("------------");
  }
  private onButtonPress = () => {
    const filePath = RNFS.DocumentDirectoryPath + "/com.daleapp.app" + GLOBAL.newVersion + ".apk";
    const android = RNFetchBlob.android;
    const download = RNFS.downloadFile({
      fromUrl: `http://${GLOBAL.server_ip}/api/version/download?id=1/app0.apk`,
      toFile: filePath,
      progress: res => {        
        this.setState({
          downloadProgress: res.bytesWritten / res.contentLength
        });
      },
      progressDivider: 1
    });
    download.promise.then(result => {
      if (result.statusCode == 200) {
        ApkInstaller.install(filePath);
        // android.actionViewIntent(filePath, 'application/vnd.android.package-archive');
        // NativeModules.InstallApk.install(filePath);
      }
    });
  };
  render() {
    return (
      <View style={[styles.container, styles.horizontal]}>
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={this.state.downloadProgress}
        />
        <Button onPress={this.onButtonPress}>install apk</Button>
      </View>
    );
  }
  private _bootstrapAsync = async () => {
    // this.props.navigation.goBack(null);
  };
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  }
});
