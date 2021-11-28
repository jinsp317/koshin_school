import React from "react";
import { View } from "react-native";
import { PatientMainInfo } from "./patientMainInfo.component";
import GLOBAL from "@src/core/globals";
import commonStyles from "@src/containers/styles/common";
import { PatientModel, MANAGE_KIND } from "@src/core/model";
import { EditIconOutline } from "@src/assets/icons";
import { NavigationParams } from "react-navigation";
import { ThemedComponentProps, ThemeType, withStyles } from "@src/core/react-native-ui-kitten";

interface ComponentProps {
  navigation: NavigationParams;
}
type Props = ThemedComponentProps & ComponentProps;

interface State {
  isLoading: boolean;
  data: PatientModel;
}
class PatientMainInfoScreen extends React.Component<Props, State> {
  private focusListener: any;

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      data: {}
    };
  }
  componentDidMount() {
    const pInfo: PatientModel = GLOBAL.curPatient;
    if (pInfo) this.setState({ data: pInfo });
    else this.setState({ data: {} });
  }
  componentWillMount() { }

  onTopRightPress = () => {
    this.props.navigation.navigate("Inhospital Manage", {
      kind: MANAGE_KIND.MODIFY,
      isSpecial: true,
      onGoBack: this.onGoBack
    });
  };
  private onGoBack = (beUpdate: boolean) => {
    if (beUpdate) {
      if (GLOBAL.curPatient) this.setState({ data: GLOBAL.curPatient });
    }
  };

  private onItemPress = (index: number) => {
    if (__DEV__) console.info("item:", index);
  };
  public render(): React.ReactNode {
    return (
      <View style={commonStyles.container}>
        <PatientMainInfo onItemPress={this.onItemPress} data={this.state.data} />
      </View>
    );
  }
}

export const PatientMainInfoContainer = withStyles(PatientMainInfoScreen, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"]
  }
}));
