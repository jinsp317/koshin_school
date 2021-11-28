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
  RefreshControl,
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

import { PatientModel, GlucoseMonitorModel, HospitalModel } from "@src/core/model";
import { MyDatePicker, textStyle } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import ProgressBar from "@src/components/common/progressBar.component";
import { ListItem } from "./listItem.component";
import { themes } from "@src/core/themes";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTags } from '@fortawesome/free-solid-svg-icons'
import { AppSync } from '@src/core/appSync';

const screenWidth = Dimensions.get("window").width;
const NAVBAR_HEIGHT = GLOBAL.TOOL_BAR_HEIGHT + GLOBAL.HEAD_BAR_HEIGHT;

const AnimatedScrollView = Animated.createAnimatedComponent(FlatList);

interface ComponentProps {
  isLoading?: boolean;
  data: GlucoseMonitorModel[];
  downDataFailed: boolean;
  recentUpdateTime: string;
  downAllData: boolean;
  showFooterLabel: boolean;
  onRefresh: () => void;
  onItemSelect: (item: GlucoseMonitorModel) => void;
  onEndReached: () => void;
  onDateChange?: (date: Date) => void;
  endDate?: Date;
  onDepartmentChange?: (id: number) => void;
  departmentIndex?: 0; // all
  hospitalInfo: HospitalModel;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  headerDataLoading: boolean;
  data: GlucoseMonitorModel[];
  downAllData: boolean;
  endDate: Date;
  footerDataLoading: boolean;
  isLoading: boolean;
  departmentIndex: number;

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
  _maxTime: Date;

  constructor(props: Props) {
    super(props);

    const scrollAnim = new Animated.Value(0);
    const offsetAnim = new Animated.Value(0);
    this._maxTime = UTILS.getBeginEndTime(undefined, false);

    this.state = {
      isLoading: this.props.isLoading,
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
      ),

      departmentIndex: this.props.departmentIndex
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
        isLoading: props.isLoading,
        headerDataLoading: false,
        footerDataLoading: false
      });
    } else {
      this.setState({
        isLoading: props.isLoading,
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
      this.setState({ headerDataLoading: true }, () => {
        AppSync.synchronize(false).then(res => {
          this.props.onRefresh();
        }).catch(_ => {
          this.props.onRefresh();
        })
      });
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
  private onDateChange = (date: Date) => {
    this.props.onDateChange(date);
  };
  private onDepartChange = (index: number) => {
    if (this.state.departmentIndex === index) return;
    const department_id = index === 0 ? undefined : GLOBAL.totalDepartments[index - 1].id;
    this.setState({ departmentIndex: index });
    this.props.onDepartmentChange(department_id);
  };
  private _requestSyn = () => {
    AppSync.synchronize(false);
  }
  private onNavDatePress = (isPrev: boolean) => {
    if (this.state.isLoading) return;

    const date = UTILS.modifyDate(this.state.endDate, 1, !isPrev, 0); // day by day
    if (UTILS.isFutureTime(this._maxTime, date)) return;
    // this.setState({ endDate: date });
    this.props.onDateChange(date);
  };
  private renderToolbar = () => {
    const { themedStyle, ...restProps } = this.props;
    const dsCount: number = this.state.data.filter(_it => _it.delete_user_id === -2 || _it.delete_user_id === -1).length;
    return (
      <View style={commonStyles.toolbarContainer}>
        <View style={{
          flexDirection: "row",
          flex: 0.4,
          alignItems: "center"
        }}
        >
          <TouchableOpacity onPress={() => this.onNavDatePress(true)}>
            <Text style={{
              color: themes["App Theme"]["color-primary-500"],
              marginLeft: 20
            }}
            >
              ◀
            </Text>
          </TouchableOpacity>
          <MyDatePicker disabled={this.state.isLoading} onDateChange={this.onDateChange} date={this.state.endDate}
            maxDate={this._maxTime}
            textColor={themes["App Theme"]["color-primary-500"]}
            format="YYYY-MM-DD"
          />
          <TouchableOpacity onPress={() => this.onNavDatePress(false)}>
            <Text style={{
              color: themes["App Theme"]["color-primary-500"],
              paddingRight: 10
            }}
            >
              ▶
            </Text>
          </TouchableOpacity>
        </View>
        {dsCount > 0 ? (
          <View style={{
            flex: 0.6,
            alignItems: "center"
          }}>
            <TouchableOpacity onPress={() => this._requestSyn()}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FontAwesomeIcon icon={faTags} size={20} color="orangered" />
                <Text style={{ marginLeft: 4 }}>{dsCount.toString()}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
        {/**
            <CategoryPicker
              options={[
                "所有科室",
                ...UTILS.getSingleArrFromMultiArr(
                  GLOBAL.totalDepartments,
                  "name"
                )
              ]}
              defCategoryIndex={this.state.departmentIndex}
              selectCategory={(i, v) => this.onDepartChange(i)}
            />   */}
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
        {GLOBAL.HEADERITEMS_MONITORLOGB.map((item, idx) => {
          const flexValue = 1;
          let colW = 80;
          if (idx === 0) colW = 40;
          if (idx === 2) colW = 100;
          if (idx === 4) colW = 50;

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
      <TouchableOpacity onPress={() => {
        this.onItemPress(item);
      }}
      >
        <ListItem data={item} onItemPress={this.onItemPress} hospitalInfo={this.props.hospitalInfo} />
      </TouchableOpacity>
    );
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const { clampedScroll } = this.state;
    const displayData = this.state.data.filter(_it => _it.delete_user_id !== -2);

    const navbarTranslate = clampedScroll.interpolate({
      inputRange: [0, NAVBAR_HEIGHT],
      outputRange: [0, -NAVBAR_HEIGHT],
      extrapolate: "clamp"
    });

    return (
      <ScrollView
        horizontal={true}
        refreshControl={
          <RefreshControl
            refreshing={this.state.headerDataLoading}
            onRefresh={this.onRefresh}
          />
        }
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
          {displayData.length > 0 ? (
            <AnimatedScrollView
              contentContainerStyle={themedStyle.contentContainer}
              data={displayData}
              ItemSeparatorComponent={this.ListViewItemSeparator}
              keyExtractor={(item, index) => index.toString()}
              initialNumToRender={20}
              renderItem={({ item, index, separators }) => this.renderItem(item, index, separators)}
              ListFooterComponent={this.renderFooter.bind(this)}
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
          ) : (
              <View style={commonStyles.blankContainer}>
                <Text category="h5" appearance="hint" style={{ color: "lightgray" }}>
                  {Strings.common.str_noData}
                </Text>
              </View>
            )}

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

export const MonitorLogB = withStyles(MyComponent, (theme: ThemeType) => ({
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
    borderBottomColor: "#dedede",
    borderBottomWidth: 0,
    height: NAVBAR_HEIGHT,
    justifyContent: "center",

    paddingTop: 0
  }
}));
