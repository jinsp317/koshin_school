import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableOpacityProps,
  ScrollView,
  StyleSheet,
  WebView,
  Dimensions
} from "react-native";
import {
  ThemeType,
  withStyles,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { Toggle, Text, Button } from "@src/core/react-native-ui-kitten/ui";
import { ContainerView, textStyle } from "@src/components/common";
import { ProfileSetting } from "@src/components/social";
import GLOBAL from "@src/core/globals";
import commonStyles from "@src/containers/styles/common";
import { BounceFlatList } from "react-native-bounce-flatlist";
import ProgressBar from "@src/components/common/progressBar.component";
import { HelpModel } from "@src/core/model";
const screenH = Dimensions.get("screen").height;

const fakeData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const html = `
    <script>
      function send(){
        window.postMessage('hello react-native!!');
      }
    </script>
    <button onclick="send()">Send</button>
`;
interface ComponentProps {
  isReady: boolean;
  data: string;
}
interface State {
  isReady: boolean;
  data: string;
}
export type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props> {
  public state: State = {
    isReady: this.props.isReady,
    data: this.props.data
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ isReady: nextProps.isReady });
    if (nextProps.isReady) {
      this.setState({ data: nextProps.data });
    }
  }
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    if (!this.state.isReady) {
      return (
        <View style={commonStyles.progressBar}>
          <ProgressBar />
        </View>
      );
    }
    return (
      <View style={themedStyle.container}>
        <WebView
          originWhitelist={["*"]}
          source={{ baseUrl: "", html: this.state.data }} //baseUrl: for utf-8 important!!!
          style={{
            flex: 1,
            marginTop: 20,
            overflow: "visible",
            //position: "absolute",
            height: screenH
            //width: "100%"
          }}
        />
      </View>
    );
  }
  _onFetch = (page, start, abort) => {
    setTimeout(() => {
      start(fakeData);
    }, 2000);
  };

  _renderItem = (item, index) => {
    return <Text style={{ height: 70 }}>{`${item}个条目`}</Text>;
  };
}

export const AppHelp = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"],
    padding: 10
  },
  textParagraph: {
    ...commonStyles.textParagraph,
    marginTop: 6
  },
  sectionContainer: {
    marginVertical: 6
  }
}));
