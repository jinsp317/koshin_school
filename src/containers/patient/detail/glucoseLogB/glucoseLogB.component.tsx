import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  FlatList,
  Text,
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

import { PatientModel, GlucoseMonitorModel, HospitalModel } from "@src/core/model";
import { MyDatePicker, textStyle } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import ProgressBar from "@src/components/common/progressBar.component";
import { ListItem } from "./listItem.component";
import { OverflowMenuShowcase } from "@src/components/common/overflowMenuShowcase.component";

import { PersonIconFill, PeopleIconFill } from "@src/assets/icons";
import { themes } from "@src/core/themes";
import CategoryPicker from "@src/components/common/categoryPicker.component";

import { StarIconFill } from "@src/assets/icons";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../../styles/common";
const NAVBAR_HEIGHT = GLOBAL.TOOL_BAR_HEIGHT + GLOBAL.HEAD_BAR_HEIGHT;

const AnimatedScrollView = Animated.createAnimatedComponent(FlatList);

interface ComponentProps {
  data: GlucoseMonitorModel[];
  downDataFailed: boolean;
  recentUpdateTime: string;
  endDate?: Date;
  hospitalInfo: HospitalModel;
  downAllData: boolean;
  showFooterLabel: boolean;
  onRefresh: () => void;
  onItemSelect: (item: GlucoseMonitorModel) => void;
  onTimeBandListChange: (index: number) => void;
  onEndDateChange: (date: Date) => void;
  onEndReached: () => void;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  headerDataLoading: boolean;
  data: GlucoseMonitorModel[];
  downAllData: boolean;
  endDate: Date;
  footerDataLoading: boolean;

  // for hide header on scroll
  scrollAnim: any;
  offsetAnim: any;
  clampedScroll: any;
}

class MyComponent extends React.Component<Props, State> {
  _clampedScrollValue = 0;
  _offsetValue = 0;
  _scrollValue = 0;
  _scrollEndTimer: number;
  endReachCall: number;

  constructor(props: Props) {
    super(props);

    const scrollAnim = new Animated.Value(0);
    const offsetAnim = new Animated.Value(0);
    this.endReachCall = null;

    this.state = {
      headerDataLoading: false,
      footerDataLoading: false,
      data: this.props.data,
      downAllData: this.props.downAllData,
      endDate: this.props.endDate,

      scrollAnim,
      offsetAnim,
      clampedScroll: Animated.diffClamp(
        Animated.add(
          scrollAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolateLeft: "clamp"
          }),
          offsetAnim
        ),
        0,
        NAVBAR_HEIGHT
      )
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    this.updateState(nextProps);
  }
  componentDidMount() {
    this.state.scrollAnim.addListener(({ value }) => {
      const diff = value - this._scrollValue;
      this._scrollValue = value;
      this._clampedScrollValue = Math.min(
        Math.max(this._clampedScrollValue + diff, 0),
        NAVBAR_HEIGHT
      );
    });
    this.state.offsetAnim.addListener(({ value }) => {
      this._offsetValue = value;
    });

    this.updateState(this.props);
  }
  componentWillUnmount() {
    this.state.scrollAnim.removeAllListeners();
    this.state.offsetAnim.removeAllListeners();
  }

  _onScrollEndDrag = () => {
    this._scrollEndTimer = setTimeout(this._onMomentumScrollEnd, 250);
  };

  _onMomentumScrollBegin = () => {
    clearTimeout(this._scrollEndTimer);
  };

  _onMomentumScrollEnd = () => {
    const toValue =
      this._scrollValue > NAVBAR_HEIGHT && this._clampedScrollValue > NAVBAR_HEIGHT / 2
        ? this._offsetValue + NAVBAR_HEIGHT
        : this._offsetValue - NAVBAR_HEIGHT;

    Animated.timing(this.state.offsetAnim, {
      toValue,
      duration: 350,
      useNativeDriver: true
    }).start();
  };

  updateState = (props: Props) => {
    if (props.downDataFailed) {
      this.setState({
        headerDataLoading: false,
        footerDataLoading: false
      });
    } else {
      this.setState({
        headerDataLoading: false,
        footerDataLoading: false,
        data: props.data,
        endDate: props.endDate,
        downAllData: props.downAllData
      });
    }
  };

  onRefresh = () => {
    if (!this.state.headerDataLoading) {
      this.setState({ headerDataLoading: true }, () => this.props.onRefresh());
    }
  };
  onEndReached = () => {
    if (!this.state.downAllData && !this.state.footerDataLoading) {
      this.setState({ footerDataLoading: true }, () => this.props.onEndReached());
    }
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

  ListViewItemSeparator = () => {
    return <View style={{ height: 2, width: "100%", backgroundColor: "transparent" }} />;
  };

  private onItemPress = (item: GlucoseMonitorModel) => {
    this.props.onItemSelect(item);
  };

  private onTimeListSelect = (index: number) => {
    GLOBAL.curGlucoseLogABeginTimeIndex = index;
    this.props.onTimeBandListChange(index);
  };
  private renderToolbar = () => {
    const { themedStyle, ...restProps } = this.props;
    return (
      <View style={commonStyles.toolbarContainer}>
        <View style={commonStyles.toolbarSubContianer}>
          <MyDatePicker
            onDateChange={date => this.props.onEndDateChange(date)}
            date={this.state.endDate}
            maxDate={new Date()}
            textColor={themes["App Theme"]["color-primary-500"]}
          />
          <CategoryPicker
            options={GLOBAL.BEGINTIMES}
            defCategoryIndex={GLOBAL.curGlucoseLogABeginTimeIndex}
            selectCategory={(i, v) => this.onTimeListSelect(i)}
          />
        </View>
      </View>
    );
  };

  private renderHeader = () => {
    const { themedStyle, ...restProps } = this.props;
    const { clampedScroll } = this.state;

    const navbarOpacity = clampedScroll.interpolate({
      inputRange: [0, NAVBAR_HEIGHT],
      outputRange: [1, 0],
      extrapolate: "clamp"
    });

    return (
      <View style={themedStyle.header}>
        {GLOBAL.HEADERITEMS_GLUCOSELOGB.map((item, idx) => {
          const flexValue = 1;
          const colW = idx == 0 ? 100 : 80;
          return (
            <View style={{ width: colW, alignItems: "center" }} key={idx}>
              <Animated.Text style={[themedStyle.headerText, { opacity: navbarOpacity }]}>
                {item}
              </Animated.Text>
            </View>
          );
        })}
      </View>
    );
  };

  private renderItem = (item, index, separators) => {
    const { themedStyle, data } = this.props;
    return (
      <TouchableHighlight
        onPress={() => this.onItemPress(item)}
        onLongPress={() => this.onItemPress(item)}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
      >
        <ListItem data={item} hospitalInfo={this.props.hospitalInfo} />
      </TouchableHighlight>
    );
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const { clampedScroll } = this.state;

    const navbarTranslate = clampedScroll.interpolate({
      inputRange: [0, NAVBAR_HEIGHT],
      outputRange: [0, -NAVBAR_HEIGHT],
      extrapolate: "clamp"
    });

    return (
      <ScrollView
        horizontal={true}
        indicatorStyle="white"
        showsHorizontalScrollIndicator={true}
        bounces={false}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          minWidth: "100%"
        }}
      >
        <View style={themedStyle.container}>
          <AnimatedScrollView
            baunces={false}
            contentContainerStyle={themedStyle.contentContainer}
            data={this.state.data}
            ItemSeparatorComponent={this.ListViewItemSeparator}
            keyExtractor={(item, index) => index.toString()}
            initialNumToRender={10}
            refreshing={this.state.headerDataLoading}
            onRefresh={this.onRefresh}
            renderItem={({ item, index, separators }) => this.renderItem(item, index, separators)}
            ListFooterComponent={this.renderFooter.bind(this)}
            onEndReachedThreshold={0.5} // 0~1
            onEndReached={() => {
              if (!this.endReachCall) {
                this.endReachCall = setTimeout(() => {
                  this.onEndReached();
                  this.endReachCall = null;
                }, 1000);
              }
            }}
            scrollEventThrottle={1}
            onMomentumScrollBegin={this._onMomentumScrollBegin}
            onMomentumScrollEnd={this._onMomentumScrollEnd}
            onScrollEndDrag={this._onScrollEndDrag}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: this.state.scrollAnim } } }],
              { useNativeDriver: true }
            )}
          />

          <Animated.View
            style={[themedStyle.navbar, { transform: [{ translateY: navbarTranslate }] }]}
          >
            {this.renderToolbar()}
            {this.renderHeader()}
          </Animated.View>
        </View>
      </ScrollView>
    );
  }

  getChannelList = (page: number) => {
    if (page == 0) {
      return;
    }
  };
}

export const GlucoseLogB = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    minWidth: "100%"
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingTop: NAVBAR_HEIGHT,
    paddingBottom: 0
  },
  toolbarButton: {
    //    borderWidth: 0.5,
    //    borderColor: "white",
    borderRadius: 10
  },
  header: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingLeft: 6,
    backgroundColor: "white", // "#e1f4fe", //theme["background-basic-color-2"],
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 0,
    width: "100%",
    height: GLOBAL.HEAD_BAR_HEIGHT,
    borderBottomColor: theme["mycolor-lightgray"],
    borderBottomWidth: 2
  },
  headerText: {
    fontSize: 16,
    color: theme["text-hint-color"]
  },
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "flex-start",
    backgroundColor: "red",
    borderBottomColor: "#dedede",
    borderBottomWidth: 0,
    height: NAVBAR_HEIGHT,
    justifyContent: "center",

    paddingTop: 0
  }
}));
