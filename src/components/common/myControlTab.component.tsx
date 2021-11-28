import React from "react";
import { Dimensions, View, SafeAreaView, ViewStyle } from "react-native";
import {
  ThemeProvider,
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { themes } from "@src/core/themes";
import SegmentedControlTab from "react-native-segmented-control-tab";
const screenWidth = Dimensions.get("window").width;

interface ComponentProps {
  tabIndex: number;
  onTabItemPress: (index: number) => void;
  values: string[];
  containerStyle: ViewStyle;
  tabsContainerStyle?: ViewStyle;
  enable?: boolean;
}
interface State {
  tabIndex: number;
  enable: boolean;
}
type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tabIndex: props.tabIndex,
      enable: props.enable
    };
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.tabIndex != nextProps.tabIndex) {
      this.setState({ tabIndex: nextProps.tabIndex });
    }
    this.setState({ enable: nextProps.enable });
  }
  private handleTabPress = (tabIndex: number) => {
    this.setState({ tabIndex });

    this.props.onTabItemPress(tabIndex);
  };

  public render(): React.ReactNode {
    const { themedStyle, containerStyle } = this.props;

    return (
      <SafeAreaView style={[themedStyle.safeAreaContainer, containerStyle]}>
        <ThemeProvider theme={{ ...this.props.theme, ...themes["App Theme"] }}>
          <SegmentedControlTab
            enable={this.state.enable}
            values={this.props.values}
            selectedIndex={this.state.tabIndex}
            onTabPress={this.handleTabPress}
            tabStyle={themedStyle.tabStyle}
            activeTabStyle={themedStyle.activeTabStyle}
            tabTextStyle={themedStyle.tabTextStyle}
            activeTabTextStyle={themedStyle.activeTabTextStyle}
            tabsContainerStyle={this.props.tabsContainerStyle}
          />
        </ThemeProvider>
      </SafeAreaView>
    );
  }
}

export const MyControlTab = withStyles(MyComponent, (theme: ThemeType) => ({
  safeAreaContainer: {
    backgroundColor: theme["color-basic-400"]
  },
  tabStyle: {
    borderColor: theme["color-primary-default"]
  },
  activeTabStyle: {
    backgroundColor: theme["color-primary-default"]
  },
  tabTextStyle: {
    color: theme["color-primary-default"]
    // fontWeight: 'bold'
  },
  activeTabTextStyle: {
    color: "white"
  }
}));
