import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  FlatList,
  Text,
  Dimensions,
  RefreshControl,
  TouchableHighlight,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import {
  withStyles,
  ThemeType,
  ThemedComponentProps,
} from "@src/core/react-native-ui-kitten/theme";
import { Input, Button } from "@src/core/react-native-ui-kitten/ui";
import {
  PatientMonitorModel,
  GlucoseMonitorModel, HospitalModel,
} from "@src/core/model";
import { MyDatePicker } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import { ListItem } from "./listItem.component";
import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import { themes } from "@src/core/themes";
import { AppSync } from '@src/core/appSync';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faFont, faTags, faTimes } from '@fortawesome/free-solid-svg-icons'
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import moment from 'moment';
import SvgUri from 'react-native-svg-uri';
import { UserSearchSvg } from '@src/assets/icons';
const NAVBAR_HEIGHT = GLOBAL.HEAD_BAR_2LINE_HEIGHT; // GLOBAL.TOOL_BAR_HEIGHT +
const SCREEN_W = Dimensions.get("window").width;
const SCREEN_H = Dimensions.get("window").height;
const FIXED_W = 120;

interface ComponentProps {
  isLoading?: boolean;
  isRefresh: boolean;
  isToday: boolean;
  data: PatientMonitorModel[];
  onSearch: (filter: string) => void;
  onItemSelect: (item: PatientMonitorModel) => void;
  onCellSelect: (
    rowIndex: number,
    point: number,
    cell: GlucoseMonitorModel,
    hasTask: boolean,
  ) => void;
  downDataFailed: boolean;
  onRefresh: () => void;
  recentUpdateTime: string;
  onDateChange?: (date: Date) => void;
  endDate?: Date;
  onDepartmentChange?: (id: number) => void;
  departmentIndex?: 0; // all
  hospitalInfo: HospitalModel;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  headerDataLoading: boolean;
  scrollAnim: any;
  offsetAnim: any;
  clampedScroll: any;
  endDate: Date;
  isLoading: boolean;
  departmentIndex: number;
  fontSizeName: string;
  fontSize: number;
  screenWidth: number;
  bedString: string;
  bedSearch: boolean;
}

class MyComponent extends React.Component<Props, State> {
  _clampedScrollValue = 0;
  _offsetValue = 0;
  _scrollValue = 0;
  _scrollEndTimer: number;
  _maxTime: Date;

  private MyRefHeader = React.createRef<ScrollView>();
  private MyRefBody = React.createRef<ScrollView>();
  constructor(props: Props) {
    super(props);

    const scrollAnim = new Animated.Value(0);
    const offsetAnim = new Animated.Value(0);

    this._maxTime = UTILS.getBeginEndTime(undefined, false);

    this.state = {
      screenWidth: SCREEN_W,
      isLoading: true,
      headerDataLoading: false,
      scrollAnim,
      offsetAnim,
      clampedScroll: Animated.diffClamp(
        Animated.add(
          scrollAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolateLeft: "clamp",
          }),
          offsetAnim,
        ),
        0,
        NAVBAR_HEIGHT,
      ),
      endDate: undefined,
      bedString: undefined,
      bedSearch: false,
      fontSizeName: GLOBAL.curFontSize,
      fontSize: GLOBAL.fontSize[GLOBAL.curFontSize],
      departmentIndex: this.props.departmentIndex,
    };
  }
  static getDerivedStateFromProps(nextProps: Props) {
    // this.updateState(nextProps);
    if (nextProps.downDataFailed) {
      return {
        isLoading: nextProps.isLoading,
        // headerDataLoading: nextProps.isRefresh
      };
    } else {
      return {
        isLoading: nextProps.isLoading,
        // headerDataLoading: nextProps.isRefresh,
        // data: nextProps.data,
        endDate: nextProps.endDate
      }
    }
    // return null;
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
        NAVBAR_HEIGHT,
      );
    });
    this.state.offsetAnim.addListener(({ value }) => {
      this._offsetValue = value;
    });

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
      useNativeDriver: true,
    }).start();
  };

  private _requestSyn = () => {
    AppSync.synchronize(false);
  }
  private changeSearch = (val: string) => {
    // this.props.onSearchPatient(val);
    this.setState({ bedString: val });
    this.props.onSearch(val);
  }
  onRefresh = () => {

    this.props.onRefresh();
  };

  ListViewItemSeparator = () => {
    return <View style={{ height: 2, width: "100%", backgroundColor: "transparent" }} />;
  };

  private onItemPress = (item: PatientMonitorModel) => {
    if (this.state.isLoading) return;

    this.props.onItemSelect(item);
  };

  private onDateChange = (date: Date) => {
    this.props.onDateChange(date);
  };
  private onNavDatePress = (isPrev: boolean) => {
    if (this.state.isLoading) return;

    const date = UTILS.modifyDate(this.state.endDate, 1, !isPrev, 0); // day by day
    if (UTILS.isFutureTime(this._maxTime, date)) return;
    // this.setState({ endDate: date });
    this.props.onDateChange(date);
  };

  private onBodyScroll = (event: Object) => {
    const x = event.nativeEvent.contentOffset.x;
    // console.log(x);
    this.MyRefHeader.current.scrollTo({ x: x, animated: false });
  };
  private _changeFontSize = () => {
    const keys = Object.keys(GLOBAL.fontSize);
    // let curFont = this.state.fontSizeName;
    const idx = (keys.findIndex((item) => item === this.state.fontSizeName) + 1) % keys.length;
    const fontName = keys[idx];
    GLOBAL.curFontSize = fontName;
    this.setState({
      fontSizeName: GLOBAL.curFontSize,
      fontSize: GLOBAL.fontSize[GLOBAL.curFontSize]
    }, () => {
      asyncStorageHelper.setConfigAppEnv();
    });

  }
  private renderToolbar = () => {
    const { themedStyle } = this.props;
    let cdata: number = 0;
    const orgData = this.props.data;
    orgData.forEach((item) => {
      if (item.point_monitors.length > 0) {
        const alt = item.point_monitors.reduce((prev, curVal) => prev.concat(curVal.monitors.filter(_it => _it.delete_user_id === -1 || _it.delete_user_id === -2)), []);
        cdata += alt.length;
      }
    });
    return (
      <View style={{
        flexDirection: 'column'
      }}>
        <View style={commonStyles.toolbarContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => this.onNavDatePress(true)}>
              <Text style={{ color: themes["App Theme"]["color-primary-500"], paddingLeft: 6 }}
              >
                ◀
            </Text>
            </TouchableOpacity>

            <MyDatePicker disabled={this.state.isLoading} onDateChange={this.onDateChange}
              date={this.state.endDate}
              maxDate={this._maxTime}
              textColor={themes["App Theme"]["color-primary-500"]}
              format="YYYY-MM-DD"
            />
            <TouchableOpacity onPress={() => this.onNavDatePress(false)}>
              <Text style={{
                color: themes["App Theme"]["color-primary-500"],
                paddingRight: 10,
              }}
              >
                ▶
            </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this._changeFontSize()}>
              <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}>
                <FontAwesomeIcon icon={faFont} size={this.state.fontSize} color={themes["App Theme"]["color-primary-500"]} />
              </View>
            </TouchableOpacity>
          </View>
          {cdata > 0 ? (
            <TouchableOpacity onPress={() => this._requestSyn()}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FontAwesomeIcon icon={faTags} size={20} color="orangered" />
                <Text style={{ marginLeft: 4 }}>{`${cdata}`}</Text>
              </View>
            </TouchableOpacity>) : null
          }
          <TouchableOpacity onPress={() => {
            const bedStatus = !this.state.bedSearch;
            this.setState({ bedSearch: bedStatus, bedString: undefined });
            this.props.onSearch('');
            // this.props.onSearchPatient('');
          }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {this.state.bedSearch ? (
                <FontAwesomeIcon icon={faTimes} size={20} color={themes["App Theme"]["color-primary-500"]} />
              ) : (
                  <SvgUri
                    width="32" height="32"
                    svgXmlData={UserSearchSvg}
                  />
                )}
            </View>
          </TouchableOpacity>
          {/**
        <CategoryPicker
          options={[
            "所有科室",
            ...UTILS.getSingleArrFromMultiArr(GLOBAL.totalDepartments, "name")
          ]}
          defCategoryIndex={this.state.departmentIndex}
          selectCategory={(i, v) => this.onDepartChange(i)}
        />
           */}
        </View>
        {this.state.bedSearch && (
          <View>
            <Input placeholder={Strings.message.input_bedSearch} value={this.state.bedString}
              onChangeText={val => this.changeSearch(val)}
              textStyle={{ paddingVertical: 1 }}
            />
          </View>
        )}
      </View>
    );
  };

  private renderHeader = () => {
    const { themedStyle } = this.props;
    const headerHeight = 50;
    const cellWidth = 60;

    return (
      <View style={themedStyle.header}>
        <View style={{ flexDirection: "row", width: FIXED_W }}>
          <View
            style={[
              themedStyle.col,
              {
                width: cellWidth - 4,
                minHeight: headerHeight,
              },
            ]}
          >
            <Text style={commonStyles.textSubtitle}>{Strings.patient.list_chuanghao}</Text>
          </View>
          <View
            style={[
              themedStyle.col,
              {
                width: 60,
                minHeight: headerHeight,
              },
            ]}
          >
            <Text style={commonStyles.textSubtitle}>{Strings.common.str_name}</Text>
          </View>
        </View>
        <ScrollView
          ref={this.MyRefHeader}
          // onScroll={this.onHeaderScroll}
          // onScrollEndDrag={this.onHeaderScroll}
          // scrollEventThrottle={10}
          style={{ minWidth: this.state.screenWidth - FIXED_W }}
          horizontal={true}
          indicatorStyle="white"
          showsHorizontalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <View style={{ flexDirection: "row" }}>
            {/*헤더 측정점표기라벨*/
              GLOBAL.COMMON_POINTS.map((val, index) => {
                return (
                  <View
                    style={[themedStyle.col, { width: cellWidth, minHeight: headerHeight }]}
                    key={index}
                  >
                    <Text style={commonStyles.textSubtitle} numberOfLines={2}>
                      {val}
                    </Text>
                  </View>
                );
              })}
          </View>
        </ScrollView>
      </View>
    );
  };

  private renderItem = (kind: number, item, index, separators) => {
    return (
      <TouchableHighlight onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
      >
        <ListItem kind={kind} index={index} data={item} hospitalInfo={this.props.hospitalInfo}
          onItemPress={this.onItemPress} fontSize={this.state.fontSize}
          onCellPress={(point, cell, hasTask) =>
            this.props.onCellSelect(index, point, cell, hasTask)
          }
        />
      </TouchableHighlight>
    );
  };
  private onSwtichPress = () => {
    const date = moment().toDate();
    this.props.onDateChange(date);
  }
  private renderPointAlert = () => {
    const { themedStyle } = this.props;
    return (
      <View style={themedStyle.alertbarContainer}>
        <Text>{`当前日期非当天，是否切换`}</Text>
        <Button size="small" appearance="outline" status="warning" onPress={this.onSwtichPress}>
          {Strings.common.str_switch_day}
        </Button>
      </View>
    );
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    return (
      <View style={themedStyle.container}>
        {this.renderToolbar()}
        {!this.props.isToday && this.renderPointAlert()}
        <View>
          <TouchableOpacity>{this.renderHeader()}</TouchableOpacity>
          <ScrollView
            refreshControl={
              <RefreshControl
                tintColor={themes["App Theme"]["color-primary-500"]}
                refreshing={this.props.isRefresh}
                onRefresh={this.onRefresh}
              />
            }
            horizontal={false} indicatorStyle="white" showsHorizontalScrollIndicator={true}
            bounces={false}
            contentContainerStyle={{
              justifyContent: "flex-start",
              alignItems: "flex-start",
              flexDirection: "row",
              paddingBottom: 150,
              //                backgroundColor: "yellow"
            }}
          >
            <FlatList style={{ width: FIXED_W }}
              scrollEnabled={false}
              contentContainerStyle={themedStyle.contentContainer}
              data={this.props.data}
              ItemSeparatorComponent={this.ListViewItemSeparator}
              initialNumToRender={20}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index, separators }) =>
                this.renderItem(0, item, index, separators)
              }
            />
            <ScrollView
              ref={this.MyRefBody}
              onScroll={this.onBodyScroll}
              onScrollEndDrag={this.onBodyScroll}
              scrollEventThrottle={10}
              horizontal={true}
              indicatorStyle="white"
              showsHorizontalScrollIndicator={true}
              bounces={false}
              style={{ width: this.state.screenWidth - FIXED_W }}
              contentContainerStyle={{
                justifyContent: "flex-start",
                alignItems: "flex-start",
                flexDirection: "column",
                //                  backgroundColor: "red",
                minWidth: this.state.screenWidth - FIXED_W,
              }}
            >
              <FlatList scrollEnabled={false} style={{ width: "100%" }}
                contentContainerStyle={themedStyle.contentContainer}
                data={this.props.data}
                ItemSeparatorComponent={this.ListViewItemSeparator}
                keyExtractor={(item, index) => index.toString()}
                // removeClippedSubviews={true}
                // maxToRenderPerBatch={20}
                initialNumToRender={20}
                // refreshing={this.state.headerDataLoading}
                // onRefresh={this.onRefresh}
                renderItem={({ item, index, separators }) =>
                  this.renderItem(1, item, index, separators)
                }
              />
            </ScrollView>
          </ScrollView>
        </View>
      </View>
    );
  }
}

export const MonitorLog = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    minWidth: "100%",
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingTop: 0, // NAVBAR_HEIGHT,
    paddingBottom: 0,
    // width: "100%"
  },
  toolbarButton: {
    //    borderWidth: 0.5,
    //    borderColor: "white",
    borderRadius: 10,
  },
  header: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingLeft: 0,
    backgroundColor: "white", // "#e1f4fe", //theme["background-basic-color-2"],
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 0,
    width: "100%",
    minHeight: GLOBAL.HEAD_BAR_2LINE_HEIGHT,
    borderBottomColor: theme["mycolor-lightgray"],
    borderBottomWidth: 2,
  },
  headerText: {
    fontSize: 16,
    color: theme["#ccc"],
  },
  alertbarContainer: {
    flexDirection: "row",
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 3,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme["color-warning-500"],
    height: 46
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

    paddingTop: 0,
  },
  col: {
    frex: 1,
    paddingVertical: 0,
    paddingHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
  },
}));
