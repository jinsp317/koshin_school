import React from "react";
import { View } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import commonStyle from "@src/containers/styles/common";
import GLOBAL from "@src/core/globals";
import { SearchIconFill } from "@src/assets/icons";
import Modal from "react-native-modal";
import { GlobalHelpModal, GlobalHelpButton } from "@src/components/common";
import { DetailMain } from "./detailMain.component";
interface State {
  tabIdx: number;
  isModalVisible: boolean;
  showGlobalHelpButton: boolean;
}

type Props = NavigationScreenProps;
export class DetailMainScreen extends React.Component<Props, State> {
  private focusListener: any;

  constructor(props: NavigationScreenProps) {
    super(props);
    this.state = {
      tabIdx: GLOBAL.detailPatientTab,
      isModalVisible: false,
      showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0
    };
  }

  componentDidMount() {
    if (!GLOBAL.curPatient) {
      this.props.navigation.goBack();
      return;
    }

    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      // GLOBAL.curRouteName = this.props.navigation.state.routeName;
      // asyncStorageHelper.setSessionInfos();

      this.setState({ showGlobalHelpButton: GLOBAL.curGlobalHelpIdx === 0 });
    });
  }
  componentWillUnmount() {
    this.focusListener && this.focusListener.remove();
  }
  componentWillMount() {
    this.setNavigationParams();
  }
  componentWillReceiveProps(nextProps) { }

  onTopRightPress = () => {
    this.props.navigation.navigate("Task FilterB", {
      kind: 0
    });
  };

  private setNavigationParams() {
    const onRightPress = this.onTopRightPress;
    if (GLOBAL.curPatient) {
      this.props.navigation.setParams({
        caption: `${
          GLOBAL.curPatient.bed_number ? GLOBAL.curPatient.bed_number + "床" : ""
          } ${GLOBAL.curPatient.name}`,
        onRightPress,
        rightIcon: SearchIconFill
      });
    } else {
      this.props.navigation.goBack();
    }
  }

  render() {
    return (
      <View style={commonStyle.container}>
        <Modal
          isVisible={this.state.isModalVisible}
          onBackdropPress={() => this.setState({ isModalVisible: false })}
          onSwipeComplete={() => this.setState({ isModalVisible: false })}
          onBackButtonPress={() => this.setState({ isModalVisible: false })}
          swipeDirection="left"
        >
          <GlobalHelpModal />
        </Modal>
        <DetailMain
          navigation={this.props.navigation}
          tabIndex={this.state.tabIdx}
        />
        <GlobalHelpButton
          isVisible={this.state.showGlobalHelpButton}
          onPress={() => this.setState({ isModalVisible: true })}
        />
      </View>
    );
  }
}
