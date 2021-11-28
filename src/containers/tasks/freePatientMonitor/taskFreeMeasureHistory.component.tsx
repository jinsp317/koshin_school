import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
  TouchableHighlight
} from "react-native";
const { width } = Dimensions.get("window");
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { FPMDataModel, UserModel, HospitalModel } from "@src/core/model";
import { MyDatePicker, SlideMenu } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import ProgressBar from "@src/components/common/progressBar.component";
import { FreeMeasureListItem } from "./freeMeasureListItem.component";
import { Text } from "@src/core/react-native-ui-kitten/ui";
import { themes } from "@src/core/themes";
import CategoryPicker from "@src/components/common/categoryPicker.component";
import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
interface ComponentProps {
  data: FPMDataModel[];
  onItemSelect: (index: FPMDataModel) => void;
  onTimeBandListChange: (index: number) => void;
  onEndDateChange: (date: Date) => void;
  onUserChange: (userId: number) => void;
  endDate: Date;
  hospitalInfo: HospitalModel;
  downAllData: boolean;
  showFooterLabel: boolean;
  downDataFailed: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
  recentUpdateTime: string;
  curUserIndex: number;
  userData: string[];
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  headerDataLoading: boolean;
  footerDataLoading: boolean;
  data: FPMDataModel[];
  downAllData: boolean;
  endDate: Date;
}

class TasksComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      headerDataLoading: false,
      footerDataLoading: false,
      data: this.props.data,
      downAllData: this.props.downAllData,
      endDate: this.props.endDate
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    this.updateState(nextProps);
  }
  componentDidMount() {
    this.updateState(this.props);
  }

  updateState = (props: Props) => {
    if (props.downDataFailed) {
      this.setState({
        headerDataLoading: false,
        footerDataLoading: false,
        endDate: props.endDate
      });
    } else {
      this.setState({
        headerDataLoading: false,
        footerDataLoading: false,
        data: props.data,
        downAllData: props.downAllData,
        endDate: props.endDate
      });
    }
  };

  onEndReached = () => {
    if (!this.state.downAllData && !this.state.footerDataLoading) {
      this.setState({ footerDataLoading: true }, () => this.props.onEndReached());
    }
  };

  onRefresh = () => {
    if (!this.state.headerDataLoading) {
      this.setState({ headerDataLoading: true }, () => this.props.onRefresh());
    }
  };

  ListViewItemSeparator = () => {
    return <View style={{ height: 3, width: "100%", backgroundColor: "transparent" }} />;
  };
  renderFooter = () => {
    let footer = {};
    if (this.state.downAllData) {
      footer = this.props.showFooterLabel && (
        <View
          style={{
            height: 30,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text>{Strings.message.download_completed}</Text>
        </View>
      );
    } else {
      if (!this.state.footerDataLoading) footer = null;
      else {
        footer = (
          <View style={{ height: 50 }}>
            <ProgressBar />
          </View>
        );
      }
    }
    return footer;
  };

  private onItemPress = (item: FPMDataModel) => {
    this.props.onItemSelect(item);
  };
  private onUserListSelect = (index: number) => {
    // Alert.alert("" + index);
    const userId = index == 0 ? undefined : GLOBAL.myUsers[index - 1].id;
    this.props.onUserChange(userId);
  };
  private onTimeListSelect = (index: number) => {
    GLOBAL.curFPMLogBeginTimeIndex = index;
    this.props.onTimeBandListChange(index);
  };
  private renderItem = (item, index, separators) => {
    const { themedStyle, data } = this.props;
    return (
      <TouchableHighlight
        onPress={() => this.onItemPress(item)}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
      >
        <FreeMeasureListItem data={item} hospitalInfo={this.props.hospitalInfo} />
      </TouchableHighlight>
    );
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <View style={themedStyle.container}>
        <View style={commonStyles.toolbarContainer}>
          <View style={commonStyles.toolbarSubContianer}>
            <MyDatePicker
              onDateChange={date => this.props.onEndDateChange(date)}
              date={this.state.endDate}
              maxDate={new Date()}
              textColor={themes["App Theme"]["color-primary-500"]}
            />
            <SlideMenu
              disabled={false}
              name={"FREE_MEASURE_BEGIN"}
              cols={2}
              data={GLOBAL.BEGINTIMES}
              curItemIndex={GLOBAL.curFPMLogBeginTimeIndex}
              onMenuItemSelect={val => this.onTimeListSelect(val)}
              textStyle={commonStyles.slideMenuText_2}
              triggerStyle={commonStyles.slideMenuTrigger}
            />
          </View>
          <SlideMenu
            disabled={false}
            name={"FREE_MEASURE_USERS"}
            cols={2}
            data={this.props.userData}
            curItemIndex={this.props.curUserIndex}
            onMenuItemSelect={val => this.onUserListSelect(val)}
            textStyle={commonStyles.slideMenuText_2}
            triggerStyle={commonStyles.slideMenuTrigger}
          />
        </View>
        {this.state.data.length > 0 ? (
          <View style={themedStyle.contentContainer}>
            <FlatList
              data={this.state.data}
              ItemSeparatorComponent={this.ListViewItemSeparator}
              keyExtractor={(item, index) => index.toString()}
              initialNumToRender={10}
              ListFooterComponent={this.renderFooter.bind(this)}
              onEndReachedThreshold={0.4} // pixel unit
              onEndReached={this.onEndReached}
              refreshing={this.state.headerDataLoading}
              onRefresh={this.onRefresh}
              renderItem={({ item, index, separators }) => this.renderItem(item, index, separators)}
            // ListHeaderComponent={this.renderFooter}
            />
          </View>
        ) : (
            <View style={commonStyles.blankContainer}>
              <Text category="h5" appearance="hint" style={{ color: "lightgray" }}>
                {Strings.common.str_noData}
              </Text>
            </View>
          )}
      </View>
    );
  }

  getChannelList = (page: number) => {
    if (page == 0) {
      return;
    }
  };
}

export const TaskFreeMeasureHistory = withStyles(TasksComponent, (theme: ThemeType) => ({
  container: {
    flex: 1
  },
  contentContainer: {
    paddingHorizontal: 3,
    paddingTop: 3,
    paddingBottom: 53
  },
  toolbarButton: {
    paddingHorizontal: 6
  },
  userMenuItemText: {
    color: "darkgray"
  }
}));
