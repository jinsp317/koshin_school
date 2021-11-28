import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
  TouchableHighlight,
  TouchableOpacity,
  NativeModules,
  Platform,
  Animated,
  ScrollView,
  Button
} from "react-native";
const { width } = Dimensions.get("window");
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { Text } from "@src/core/react-native-ui-kitten/ui";

import { PatientModel, GlucoseMonitorModel, TaskDataModel } from "@src/core/model";
import { MyDatePicker, textStyle } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import ProgressBar from "@src/components/common/progressBar.component";
import { ListItem } from "./listItem.component";
import commonStyles from "@src/containers/styles/common";

interface ComponentProps {
  data: TaskDataModel[];
  downDataFailed: boolean;
  recentUpdateTime: string;
  endDate?: Date;
  onItemSelect: (item: object) => void;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  data: TaskDataModel[];
}

class MyComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      data: this.props.data
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    this.updateState(nextProps);
  }
  componentDidMount() {
    this.updateState(this.props);
  }
  updateState = (props: Props) => {
    if (!props.downDataFailed) {
      this.setState({
        data: props.data
      });
    }
  };

  ListViewItemSeparator = () => {
    return <View style={{ height: 2, width: "100%", backgroundColor: "transparent" }} />;
  };

  private onItemPress = (item: object) => {
    this.props.onItemSelect(item);
  };

  private renderItem = (item, index, separators) => {
    return <ListItem data={item} onItemPress={this.onItemPress} />;
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    if (!this.state.data || this.state.data.length <= 0) {
      return (
        <View style={commonStyles.blankContainer}>
          <Text category="h5" appearance="hint" style={{ color: "lightgray" }}>
            {Strings.common.str_noData}
          </Text>
        </View>
      );
    }

    return (
      <View style={themedStyle.container}>
        <FlatList
          contentContainerStyle={themedStyle.contentContainer}
          data={this.state.data}
          ItemSeparatorComponent={this.ListViewItemSeparator}
          keyExtractor={(item, index) => index.toString()}
          initialNumToRender={100}
          renderItem={({ item, index, separators }) => this.renderItem(item, index, separators)}
        />
      </View>
    );
  }
}

export const TodayTask = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    minWidth: "100%"
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingBottom: 0
  }
}));
