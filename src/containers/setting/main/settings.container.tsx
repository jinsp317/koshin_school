import React from "react";
import { NavigationScreenProps } from "react-navigation";
import { Settings } from "./settings.component";
import { httpHelper } from "@src/core/utils/httpHelper";
import GLOBAL from "@src/core/globals";
import { Alert, View, Text } from "react-native";
import Strings from "@src/assets/strings";
import * as UTILS from "@src/core/app_utils";
import { VersionInfoModel } from "@src/core/model/versionInfo.model";
import Modal from "react-native-modal";
import { UpdateVersionModal, GlobalHelpButton, GlobalHelpModal } from "@src/components/common";
import RNFS from "react-native-fs";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import BackgroundJob from "react-native-background-job";
import ProgressBar from "@src/components/common/progressBar.component";
import commonStyle from "@src/containers/styles/common";
import { EventRegister } from "react-native-event-listeners";
import { AppSync } from '../../../core/appSync';
import * as SYNC_HELPER from "@src/core/syncHelper";
import { connect } from 'react-redux';
interface State {
  isModalVisible: boolean;
  versionInfo: VersionInfoModel;
  showGlobalHelp: boolean;
  showGlobalHelpButton: boolean;
  inSynWaiting: boolean;
}
interface SynProps {
  isSynWait: boolean;
}
export type RdxProps = NavigationScreenProps & SynProps;
export class SettingsContainer0 extends React.Component<RdxProps, State> {
  private focusListener: any;
  private blurListener: any;
  private syncListener: any;
  public state: State = {
    isModalVisible: false,
    versionInfo: GLOBAL.versionInfo,
    showGlobalHelp: false,
    showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0,
    inSynWaiting: false
  };
  componentDidMount() {
    GLOBAL.curRouteName = this.props.navigation.state.routeName;
    asyncStorageHelper.setSessionInfos();
    BackgroundJob.cancelAll();
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this.setState({ showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0 });
      EventRegister.addEventListener(GLOBAL.sync_success, data => {
        /*  this.updateData(UpdateKind.ADD2HEADER);*/
        if (this.state.inSynWaiting) {
          // GLOBAL.startBackgroundJobs();
          this.setState({ inSynWaiting: false });
          UTILS.showToast(Strings.message.info_syncSuccess);
        }
      });
      EventRegister.addEventListener(GLOBAL.sync_connect_error, data => {
        if (this.state.inSynWaiting) {
          this.setState({ inSynWaiting: false });
        }
      });
    });
    this.blurListener = this.props.navigation.addListener("didBlur", () => {
      GLOBAL.startBackgroundJobs();
      EventRegister.removeAllListeners();
    })
  }

  componentWillUnmount() {
    this.focusListener && this.focusListener.remove();
    this.blurListener && this.blurListener.remove();
    EventRegister.removeAllListeners();
  }

  private onItemPress = (index: number) => {
    let routeName: string;
    switch (index) {
      case 0: {
        routeName = "Change Name";
        break;
      }
      case 1: {
        routeName = "Change Password";
        break;
      }
      case 2: {
        this.onCheckVersionPress();
        return;
      }
      case 3: {
        routeName = "Make QRCode";
        break;
      }
      case 4: {
        routeName = "Quality Test";
        break;
      }
      case 5: {
        routeName = "Pair Device";
        break;
      }
      case 6: {
        routeName = "App Help";
        break;
      }
      case 7: {
        routeName = "Config Env";
        break;
      }
      case 8: {
        routeName = "Upload Report";
        break;
      }
      case 9: {
        routeName = "Custom PortalMenu";
        break;
      }
    }
    routeName && this.props.navigation.navigate(routeName);
    if (index === 10) {
      this.reloadDatabase();
    }
  };
  private reloadDatabase() {
    if (!GLOBAL.isOffline && !GLOBAL.usingBluetoothServer) {
      this.setState({ inSynWaiting: true });
      BackgroundJob.cancelAll();
      AppSync.synchronize(true);
    } else {
      if (GLOBAL.usingBluetoothServer) {
        AppSync.resetData = true;
        // const bStatus = store.getState().blueServerConn;
        BackgroundJob.cancelAll();
        SYNC_HELPER.dataSyncProc();
        this.setState({ inSynWaiting: true });
      } else {
        UTILS.showToast(Strings.message.connectServer_fail);
      }
    }
  }
  private onSignOutPress = () => {
    GLOBAL.isSignOut = true;
    GLOBAL.isSignin = false;
    BackgroundJob.cancelAll();
    asyncStorageHelper.setUserInfos();
    GLOBAL.token = undefined;
    if (GLOBAL.usingBluetoothServer) {
      this.props.navigation.navigate("FirstNavigator");
    } else {
      httpHelper.logout()
        .then(responseJson => {

          if (responseJson.success) {
            this.props.navigation.navigate("FirstNavigator");
          } else {
            if (__DEV__) console.info("failed to logout");
            this.props.navigation.navigate("FirstNavigator");
          }
        })
        .catch(exception => {
          if (__DEV__) console.error(exception);
          this.props.navigation.navigate("FirstNavigator");
        });
    }

  };

  private onSwitchUserPress = () => {
    BackgroundJob.cancelAll();
    this.props.navigation.navigate("Swtich User");
  };
  private onCheckVersionPress = () => {
    httpHelper
      .downloadVersionInfo()
      .then(response => {
        const versionInfos: VersionInfoModel[] = response.result;
        if (versionInfos.length > 0) {
          const versionInfo = versionInfos.pop();
          if (versionInfo.number > GLOBAL.versionInfo.number) {
            this.setState({ versionInfo, isModalVisible: true });
          } else {
            UTILS.showToast(Strings.message.version_noUpdate);
          }
        }
      })
      .catch(e => {
        UTILS.showToast(Strings.common.str_opFailed);
      });
  };
  public render(): React.ReactNode {
    return (this.state.inSynWaiting) ? (
      <View style={commonStyle.progressBar}>
        <ProgressBar />
        <Text style={{ marginVertical: 10 }}>
          {Strings.message.info_syncIsCurrentlyInProgress}
        </Text>
      </View>
    ) :
      (<View style={{ flex: 1 }}>
        <Modal
          isVisible={this.state.isModalVisible}
          onBackdropPress={() => this.setState({ isModalVisible: false, showGlobalHelp: false })}
          onSwipeComplete={() => this.setState({ isModalVisible: false, showGlobalHelp: false })}
          onBackButtonPress={() => this.setState({ isModalVisible: false, showGlobalHelp: false })}
          swipeDirection="left"
        >
          {this.state.showGlobalHelp ? (
            <GlobalHelpModal />
          ) : (
              <UpdateVersionModal
                versionInfo={this.state.versionInfo}
                onClose={() => this.setState({ isModalVisible: false })}
              />
            )}
        </Modal>
        <Settings
          onItemPress={this.onItemPress}
          onSignOutPress={this.onSignOutPress}
          onSwitchUserPress={this.onSwitchUserPress}
          isSynWait={this.props.isSynWait}
        />
        <GlobalHelpButton
          isVisible={this.state.showGlobalHelpButton}
          onPress={() => this.setState({ isModalVisible: true, showGlobalHelp: true })}
        />
      </View >
      );
  }
}
const mapStateToProps = (state) => {
  return {
    isSynWait: state.blueServerConn.isSynWait,
  };
};
export const SettingsContainer = connect(mapStateToProps, null)(SettingsContainer0);
