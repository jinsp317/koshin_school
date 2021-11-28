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

import {
  PatientModel,
  GlucoseValuesOneDayModel,
  GlucoseMonitorModel,
  HospitalModel,
  MonitorModel
} from "@src/core/model";
import { MyDatePicker, textStyle } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import { ListItem } from "./listItem.component";
import GLOBAL from "@src/core/globals";
import commonStyles from "../../../styles/common";
import { themes } from "@src/core/themes";
const NAVBAR_HEIGHT = GLOBAL.HEAD_BAR_2LINE_HEIGHT; // GLOBAL.TOOL_BAR_HEIGHT +
const SCREEN_W = Dimensions.get("window").width;
const SCREEN_H = Dimensions.get("window").height;
const FIXED_W = 70;

interface ComponentProps {
  seedInfo?: PatientModel;
  data: GlucoseValuesOneDayModel[];
  onItemSelect: (item: GlucoseValuesOneDayModel) => void;
  onCellSelect: (
    rowIndex: number,
    point: number,
    monitors: MonitorModel[],
    hasTask: boolean
  ) => void;
  onItemCellSelect: (
    rowIndex: number,
    point: number,
    monitors: GlucoseMonitorModel[],
    cellIndex: number,
    hasTask: boolean
  ) => void;
  downDataFailed: boolean;
  hospitalInfo: HospitalModel;
  onRefresh: () => void;
  recentUpdateTime: string;
  onDateChange?: (date: Date) => void;
  endDate?: Date;
  onShowChange: () => void;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  headerDataLoading: boolean;
  data: GlucoseValuesOneDayModel[];
  scrollAnim: any;
  offsetAnim: any;
  clampedScroll: any;
  endDate: Date;
  screenWidth: number;
}

class MyComponent extends React.Component<Props, State> {
  _clampedScrollValue = 0;
  _offsetValue = 0;
  _scrollValue = 0;
  _scrollEndTimer: number;
  _maxTime: Date;
  private MyRefHeader = React.createRef<ScrollView>();

  constructor(props: Props) {
    super(props);

    const scrollAnim = new Animated.Value(0);
    const offsetAnim = new Animated.Value(0);

    this._maxTime = UTILS.getLastDateofMonth(undefined);

    this.state = {
      screenWidth: SCREEN_W,
      headerDataLoading: false,
      data: this.props.data,
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
      ),
      endDate: this.props.endDate
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    this.updateState(nextProps);
  }
  _orientationDidChange = () => {
    if (Dimensions.get("window").width < Dimensions.get("window").height) {
      this.setState({ screenWidth: SCREEN_W });
    } else {
      this.setState({ screenWidth: SCREEN_H });
    }
  };
  componentDidMount() {
    Dimensions.addEventListener("change", () => this._orientationDidChange());

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
    Dimensions.removeEventListener("change", this._orientationDidChange);
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
        headerDataLoading: false
      });
    } else {
      this.setState({
        headerDataLoading: false,
        data: props.data,
        endDate: props.endDate
      });
    }
  };

  onRefresh = () => {
    if (!this.state.headerDataLoading) {
      this.setState({ headerDataLoading: true }, () => this.props.onRefresh());
    }
  };

  ListViewItemSeparator = () => {
    return <View style={{ height: 2, width: "100%", backgroundColor: "transparent" }} />;
  };

  private onItemPress = (item: GlucoseValuesOneDayModel) => {
    this.props.onItemSelect(item);
  };

  private onDateChange = (date: Date) => {
    this.props.onDateChange(date);
  };
  private onNavDatePress = (isPrev: boolean) => {
    const date = UTILS.modifyDate(this.state.endDate, 1, !isPrev, 1);
    if (UTILS.isFutureTime(this._maxTime, date)) return;
    this.props.onDateChange(date);
  };
  private onBodyScroll = (event: Object) => {
    const x = event.nativeEvent.contentOffset.x;
    // console.log(x);
    this.MyRefHeader.current.scrollTo({ x: x, animated: false });
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
                paddingLeft: 6
              }}
            >
              ◀
            </Text>
          </TouchableOpacity>

          <MyDatePicker
            onDateChange={this.onDateChange}
            date={this.state.endDate}
            maxDate={this._maxTime}
            textColor={themes["App Theme"]["color-primary-500"]}
            format="YYYY-MM-DD"
          />
          <TouchableOpacity onPress={() => this.onNavDatePress(false)}>
            <Text
              style={{
                color: themes["App Theme"]["color-primary-500"],
                paddingRight: 10
              }}
            >
              ▶
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => this.props.onShowChange()}>
          <Text
            style={[
              commonStyles.toolbarText,
              {
                color: themes["App Theme"]["color-primary-500"],
                paddingLeft: 20
              }
            ]}
          ></Text>
        </TouchableOpacity>
      </View>
    );
  };

  private renderHeader = () => {
    const { themedStyle, ...restProps } = this.props;
    const { clampedScroll } = this.state;

    return (
      <View style={themedStyle.header}>
        <View style={{ width: FIXED_W, alignItems: "center" }}>
          <Text style={themedStyle.headerText} numberOfLines={2}>
            日期
          </Text>
        </View>

        <ScrollView
          ref={this.MyRefHeader}
          horizontal={true}
          indicatorStyle="white"
          showsHorizontalScrollIndicator={false}
          bounces={false}
          style={{ width: this.state.screenWidth - FIXED_W }}
          contentContainerStyle={{
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            // backgroundColor: "red",
            minWidth: this.state.screenWidth - FIXED_W
          }}
        >
          {GLOBAL.COMMON_POINTS.map((item, idx) => {
            const flexValue = 1;
            const colW = idx == 0 ? 50 : 60;
            return (
              <View style={{ width: colW, alignItems: "center" }} key={idx}>
                <Text style={themedStyle.headerText} numberOfLines={2}>
                  {item}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  private renderItem = (kind: number, item, index, separators) => {
    const { themedStyle, data } = this.props;
    return (
      <TouchableHighlight
        //        onPress={() => this.onItemPress(item)}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
      >
        <ListItem
          kind={kind}
          hospitalInfo={this.props.hospitalInfo}
          index={index}
          data={item}
          onItemPress={this.onItemPress}
          onCellPress={(point, monitors, hasTask) =>
            this.props.onCellSelect(index, point, monitors, hasTask)
          }
          onItemCellPress={(point, monitors, cellIndex, hasTask) => {
            this.props.onItemCellSelect(index, point, monitors, cellIndex, hasTask);
          }}
        />
      </TouchableHighlight>
    );
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <View style={themedStyle.container}>
        {this.renderToolbar()}
        <TouchableOpacity>{this.renderHeader()}</TouchableOpacity>
        <ScrollView
          horizontal={false}
          indicatorStyle="white"
          showsHorizontalScrollIndicator={true}
          bounces={false}
          contentContainerStyle={{
            justifyContent: "flex-start",
            alignItems: "flex-start",
            flexDirection: "row"
          }}
        >
          <FlatList
            style={{ width: FIXED_W }}
            scrollEnabled={false}
            contentContainerStyle={[themedStyle.contentContainer, { width: FIXED_W }]}
            data={this.state.data}
            ItemSeparatorComponent={this.ListViewItemSeparator}
            initialNumToRender={32}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index, separators }) =>
              this.renderItem(0, item, index, separators)
            }
          />

          <ScrollView
            horizontal={true}
            indicatorStyle="white"
            showsHorizontalScrollIndicator={false}
            onScroll={this.onBodyScroll}
            onScrollEndDrag={this.onBodyScroll}
            scrollEventThrottle={10}
            bounces={false}
            style={{ width: this.state.screenWidth - FIXED_W }}
            contentContainerStyle={{
              justifyContent: "flex-start",
              alignItems: "flex-start",
              flexDirection: "column",
              minWidth: this.state.screenWidth - FIXED_W
            }}
          >
            <FlatList
              scrollEnabled={false}
              style={{ width: "100%", paddingBottom: 50 }}
              contentContainerStyle={themedStyle.contentContainer}
              data={this.state.data}
              ItemSeparatorComponent={this.ListViewItemSeparator}
              keyExtractor={(item, index) => index.toString()}
              initialNumToRender={32}
              // refreshing={this.state.headerDataLoading}
              // onRefresh={this.onRefresh}
              renderItem={({ item, index, separators }) =>
                this.renderItem(1, item, index, separators)
              }
            />
          </ScrollView>
        </ScrollView>
      </View>
    );
  }
}

export const GlucoseLogA = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    minWidth: "100%"
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingTop: 0, // NAVBAR_HEIGHT,
    paddingBottom: 0
    // width: "100%"
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
    minHeight: GLOBAL.HEAD_BAR_2LINE_HEIGHT,
    borderBottomColor: theme["mycolor-lightgray"],
    borderBottomWidth: 2
  },
  headerText: {
    fontSize: 18,
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
