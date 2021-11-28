import Strings from "@src/assets/strings";
import React from "react";
import { NavigationScreenProps } from "react-navigation";
import { Portal } from "./portal.component";
import Orientation from "react-native-orientation";
import { Alert, View } from "react-native";
import commonStyles from "../styles/common";
import { GlobalHelpButton, GlobalHelpModal } from "@src/components/common";
import Modal from "react-native-modal";
import GLOBAL from "@src/core/globals";
import { ButtonItemModel } from "@src/core/model";
import * as UTILS from "@src/core/app_utils";
import { database } from "@src/core/utils/database";
interface State {
  isModalVisible: boolean;
  showGlobalHelpButton: boolean;
  data: ButtonItemModel[];
}

export class PortalContainer extends React.Component<NavigationScreenProps, State> {
  private focusListener: any;
  public state: State = {
    isModalVisible: false,
    showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0,
    data: []
  };
  componentWillMount() {
    const initial = Orientation.getInitialOrientation();
    if (initial === "PORTRAIT") {
      // do something
    } else {
      // do something else
    }
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this.setState({ showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0 });
      this.setState({ data: this.getData() });
    });

    // this locks the view to Portrait Mode
    // Orientation.lockToPortrait();

    // this locks the view to Landscape Mode
    // Orientation.lockToLandscape();

    // this unlocks any previous locks to all Orientations
    // Orientation.unlockAllOrientations();

    Orientation.addOrientationListener(this._orientationDidChange);
  }

  _orientationDidChange = (orientation: string) => {
    if (orientation === "LANDSCAPE") {
      // do something with landscape layout
    } else {
      // do something with portrait layout
    }
  };

  componentWillUnmount() {
    this.focusListener && this.focusListener.remove();
    Orientation.getOrientation((err, orientation) => {
      if (__DEV__) console.info(`Current Device Orientation: ${orientation}`);
    });

    // Remember to remove listener
    Orientation.removeOrientationListener(this._orientationDidChange);
  }

  private onInvalidPress = () => {
    UTILS.alert(Strings.message.wait_nextVersion);
  };

  private onItemPress = (index: number) => {
    let routeName: string;
    {
      if (index == 0) routeName = "Patients Screen";
      else if (index == 1) routeName = "Task MonitorLog";
      else if (index == 2) routeName = "Task FreeMeasure";
      else if (index == 3) routeName = "Setting Container";
      else if (index == 4) routeName = "Portal WarningManage";
      else if (index == 8) routeName = "Patients Statistic";
      // const xpath = "MainNavigator";
      if (GLOBAL.curUser) {
        database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: routeName });
      }
      routeName && this.props.navigation.navigate(routeName);
    }
  };
  private getData = () => {
    return GLOBAL.portalItems.map(e => {
      return { ...e };
    }).sort((a, b) => {
      return a.disabled > b.disabled ? 1 : a.disabled < b.disabled ? -1 : 0;
    });

    return GLOBAL.portalItems.sort((a, b) => {
      return a.disabled > b.disabled ? 1 : a.disabled < b.disabled ? -1 : 0;
    });
  };
  public render(): React.ReactNode {
    return (
      <View style={commonStyles.container}>
        <Modal
          isVisible={this.state.isModalVisible}
          onBackdropPress={() => this.setState({ isModalVisible: false })}
          onSwipeComplete={() => this.setState({ isModalVisible: false })}
          onBackButtonPress={() => this.setState({ isModalVisible: false })}
          swipeDirection="left"
        >
          <GlobalHelpModal />
        </Modal>
        <Portal
          data={this.state.data}
          onItemPress={this.onItemPress}
          onInvalidPress={this.onInvalidPress}
        />
        <GlobalHelpButton
          isVisible={this.state.showGlobalHelpButton}
          onPress={() => this.setState({ isModalVisible: true })}
        />
      </View>
    );
  }
}
