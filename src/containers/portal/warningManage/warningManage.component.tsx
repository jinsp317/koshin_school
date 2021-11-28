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
  Animated
} from "react-native";
const { width } = Dimensions.get("window");
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps,
  ModalService
} from "@src/core/react-native-ui-kitten/theme";
import { Text } from "@src/core/react-native-ui-kitten/ui";
import { PatientModel, WarningLogModel, HospitalModel } from "@src/core/model";
import { MyDatePicker, textStyle, MyControlTab } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import ProgressBar from "@src/components/common/progressBar.component";
import { MyListItem } from "./warningManageListItem.component";
import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";

import Popover from "@src/components/common/popup";
import Modal from "react-native-modal";
const NAVBAR_HEIGHT = GLOBAL.HEAD_BAR_2LINE_HEIGHT;

const AnimatedScrollView = Animated.createAnimatedComponent(FlatList);

interface ComponentProps {
  data: WarningLogModel[];
  hospitalInfo: HospitalModel;
  onItemSelect: (index: WarningLogModel) => void;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  headerDataLoading: boolean;
  footerDataLoading: boolean;
  data: WarningLogModel[];
  scrollAnim: any;
  offsetAnim: any;
  clampedScroll: any;
  isModalVisible: boolean;
}

class PatientsComponent extends React.Component<Props, State> {
  private _listItemRef = React.createRef();
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
      footerDataLoading: false,
      data: this.props.data,
      isModalVisible: false,
      //      isYuannei: props.isYuannei,
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
    this.setState({
      headerDataLoading: false,
      footerDataLoading: false,
      data: props.data
    });
  };

  ListViewItemSeparator = () => {
    return <View style={{ height: 1, width: "100%", backgroundColor: "transparent" }} />;
  };

  private onItemPress = (item: WarningLogModel) => {
    this.props.onItemSelect(item);
  };
  private getColWidth = (index: number) => {
    let w = "15%";
    switch (index) {
      case 0:
        w = "15%";
        break;
      case 1:
        w = "30%";
        break;
      case 2:
        w = "25%";
        break;
      case 3:
        w = "30%";
        break;
    }
    return w;
  };
  private renderHeader = () => {
    const { themedStyle, ...restProps } = this.props;
    const { clampedScroll } = this.state;

    let header = [
      ["床号", "类型"],
      ["住院号", "预警时间"],
      ["姓名", "餐段"],
      ["科室 医生", "血糖值"]
    ];
    const navbarOpacity = clampedScroll.interpolate({
      inputRange: [0, NAVBAR_HEIGHT],
      outputRange: [1, 0],
      extrapolate: "clamp"
    });

    return (
      <View style={themedStyle.header}>
        {header.map((header, idx) => {
          const flexValue = 1;
          return (
            <View style={{ width: this.getColWidth(idx) }} key={idx}>
              <View>
                <Animated.Text style={[themedStyle.headerText, { opacity: navbarOpacity }]}>
                  {header[0]}
                </Animated.Text>
              </View>
              <View>
                <Animated.Text style={[themedStyle.headerText, { opacity: navbarOpacity }]}>
                  {header[1]}
                </Animated.Text>
              </View>
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
        //ref={ref => (this._listItemRef = ref)}
        onPress={() => this.onItemPress(item)}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
      >
        <MyListItem data={item} hospitalInfo={this.props.hospitalInfo} />
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
      <View style={themedStyle.container}>
        {this.state.data.length > 0 ? (
          <AnimatedScrollView
            contentContainerStyle={themedStyle.contentContainer}
            data={this.state.data}
            ItemSeparatorComponent={this.ListViewItemSeparator}
            keyExtractor={(item, index) => index.toString()}
            initialNumToRender={10}
            renderItem={({ item, index, separators }) => this.renderItem(item, index, separators)}
            onMomentumScrollBegin={this._onMomentumScrollBegin}
            onMomentumScrollEnd={this._onMomentumScrollEnd}
            onScrollEndDrag={this._onScrollEndDrag}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: this.state.scrollAnim } } }],
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
          {this.renderHeader()}
        </Animated.View>
      </View>
    );
  }

  getChannelList = (page: number) => {
    if (page == 0) {
      return;
    }
  };
}

export const WarningManage = withStyles(PatientsComponent, (theme: ThemeType) => ({
  container: {
    flex: 1
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
    backgroundColor: "#F0F0F0", //"#e1f4fe", //theme["background-basic-color-2"],
    justifyContent: "center",
    borderRadius: 0,
    width: "100%",
    height: GLOBAL.HEAD_BAR_2LINE_HEIGHT,
    borderBottomColor: theme["mycolor-lightgray"],
    borderBottomWidth: 5
  },
  headerText: {
    fontSize: 16,
    color: "darkgray" //theme["text-hint-color"]
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
