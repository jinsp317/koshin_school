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
} from "react-native";
const { width } = Dimensions.get("window");
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps,
} from "@src/core/react-native-ui-kitten/theme";
import { Text } from "@src/core/react-native-ui-kitten/ui";
import { PatientModel, DoctorsOrderModel } from "@src/core/model";
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
  seedInfo?: PatientModel;
  data: DoctorsOrderModel[];
  onItemSelect: (item: DoctorsOrderModel) => void;
  downDataFailed: boolean;
  onRefresh: () => void;
  recentUpdateTime: string;
  onDateChange?: (date: Date) => void;
  endDate?: Date;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  headerDataLoading: boolean;
  data: DoctorsOrderModel[];
  scrollAnim: any;
  offsetAnim: any;
  clampedScroll: any;
  endDate: Date;
}

class MyComponent extends React.Component<Props, State> {
  _clampedScrollValue = 0;
  _offsetValue = 0;
  _scrollValue = 0;
  _scrollEndTimer: number;

  constructor(props: Props) {
    super(props);

    const scrollAnim = new Animated.Value(0);
    const offsetAnim = new Animated.Value(0);

    this.state = {
      headerDataLoading: false,
      data: this.props.data,
      scrollAnim,
      offsetAnim,
      clampedScroll: Animated.diffClamp(
        Animated.add(
          scrollAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolateLeft: "clamp",
          }),
          offsetAnim
        ),
        0,
        NAVBAR_HEIGHT
      ),
      endDate: this.props.endDate,
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
      this._scrollValue > NAVBAR_HEIGHT &&
        this._clampedScrollValue > NAVBAR_HEIGHT / 2
        ? this._offsetValue + NAVBAR_HEIGHT
        : this._offsetValue - NAVBAR_HEIGHT;

    Animated.timing(this.state.offsetAnim, {
      toValue,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  updateState = (props: Props) => {
    if (props.downDataFailed) {
      this.setState({
        headerDataLoading: false,
      });
    } else {
      this.setState({
        headerDataLoading: false,
        data: props.data,
        endDate: props.endDate,
      });
    }
  };

  onRefresh = () => {
    if (!this.state.headerDataLoading) {
      this.setState({ headerDataLoading: true }, () => this.props.onRefresh());
    }
  };

  ListViewItemSeparator = () => {
    return (
      <View
        style={{ height: 2, width: "100%", backgroundColor: "transparent" }}
      />
    );
  };

  private onItemPress = (item: DoctorsOrderModel) => {
    this.props.onItemSelect(item);
  };

  private onDateChange = (date: Date) => {
    this.props.onDateChange(date);
  };
  private onNavDatePress = (isPrev: boolean) => {
    const date = UTILS.modifyDate(this.state.endDate, 1, !isPrev, 1);
    if (UTILS.isFutureMonth(date)) return;
    // if (__DEV__) console.log(date);
    this.props.onDateChange(date);
  };
  private renderToolbar = () => {
    const { themedStyle, ...restProps } = this.props;
    return (
      <View style={commonStyles.toolbarContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => this.onNavDatePress(true)}>
            <Text
              style={{
                color: themes["App Theme"]["color-primary-500"],
                paddingLeft: 6,
              }}
            >
              ◀
            </Text>
          </TouchableOpacity>

          <MyDatePicker
            onDateChange={this.onDateChange}
            date={this.state.endDate}
            maxDate={new Date()}
            textColor={themes["App Theme"]["color-primary-500"]}
            format="YYYY-MM"
          />
          <TouchableOpacity onPress={() => this.onNavDatePress(false)}>
            <Text
              style={{
                color: themes["App Theme"]["color-primary-500"],
                paddingRight: 20,
              }}
            >
              ▶
            </Text>
          </TouchableOpacity>
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
      extrapolate: "clamp",
    });

    return (
      <View style={themedStyle.header}>
        {GLOBAL.HEADERITEMS_DOCTORSORDERS.map((item, idx) => {
          const flexValue = 1;
          const colW = idx == 2 ? 200 : 130;
          return (
            <View style={{ width: colW, alignItems: "flex-start" }} key={idx}>
              <Animated.Text
                style={[themedStyle.headerText, { opacity: navbarOpacity }]}
              >
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
        //        onPress={() => this.onItemPress(item)}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
      >
        <ListItem data={item} onItemPress={this.onItemPress} />
      </TouchableHighlight>
    );
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const { clampedScroll } = this.state;
    const data = [];
    const navbarTranslate = clampedScroll.interpolate({
      inputRange: [0, NAVBAR_HEIGHT],
      outputRange: [0, -NAVBAR_HEIGHT],
      extrapolate: "clamp",
    });
    if (this.state.data.length > 0) {
      return (
        <ScrollView
          horizontal={true}
          indicatorStyle="white"
          showsHorizontalScrollIndicator={true}
          bounces={false}
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
          }}
        >
          <View style={themedStyle.container}>
            <AnimatedScrollView
              contentContainerStyle={themedStyle.contentContainer}
              data={this.state.data}
              initialNumToRender={10}
              ItemSeparatorComponent={this.ListViewItemSeparator}
              keyExtractor={(item, index) => index.toString()}
              refreshing={this.state.headerDataLoading}
              onRefresh={this.onRefresh}
              renderItem={({ item, index, separators }) => this.renderItem(item, index, separators)}
              // ListFooterComponent={this.renderFooter.bind(this)}
              onEndReachedThreshold={0.9} // pixel unit
              // onEndReached={this.onEndReached}
              scrollEventThrottle={1}
              onMomentumScrollBegin={this._onMomentumScrollBegin}
              onMomentumScrollEnd={this._onMomentumScrollEnd}
              onScrollEndDrag={this._onScrollEndDrag}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: { contentOffset: { y: this.state.scrollAnim } }
                  }
                ],
                { useNativeDriver: true }
              )}
            />

            <Animated.View
              style={[themedStyle.navbar, { transform: [{ translateY: navbarTranslate }], flex: 1 }]}
            >
              {this.renderToolbar()}
              {this.renderHeader()}
            </Animated.View>
          </View>
        </ScrollView>
      )
    } else {
      return (
        <ScrollView
          horizontal={true}
          indicatorStyle="white"
          showsHorizontalScrollIndicator={true}
          bounces={false}
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            flexDirection: "column"
          }}
        >
          <View style={themedStyle.container}>
            <View style={commonStyles.blankContainer}>
              <Text category="h5" appearance="hint" style={{ color: "lightgray" }}>
                {Strings.common.str_noData}
              </Text>
            </View>
            <Animated.View
              style={[themedStyle.navbar, { transform: [{ translateY: navbarTranslate }], flex: 1 }]}
            >
              {this.renderToolbar()}
              {this.renderHeader()}
            </Animated.View>
          </View>
        </ScrollView>
      )
    }

  }
}

export const DoctorsOrderLog = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    minWidth: "100%"
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingTop: 92,
    // paddingTop: NAVBAR_HEIGHT,
    paddingBottom: 0,
  },
  toolbarButton: {
    //    borderWidth: 0.5,
    //    borderColor: "white",
    borderRadius: 10,
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
    borderBottomWidth: 2,
  },
  headerText: {
    fontSize: 16,
    color: theme["text-hint-color"],
  },
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "flex-start",
    borderBottomColor: "#dedede",
    borderBottomWidth: 0,
    height: NAVBAR_HEIGHT,
    justifyContent: "center",

    paddingTop: 0,
  },
}));
