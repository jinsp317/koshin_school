import Strings from "@src/assets/strings";
import React, { PureComponent, Component } from "react";
import { View, Alert, Dimensions, FlatList, TouchableOpacity } from "react-native";
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { Button, ButtonProps, RadioGroup, Radio, Text, Input } from "@src/core/react-native-ui-kitten/ui";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import { MyControlTab, SlideMenu } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import { TaskDataModel, HospitalModel } from "@src/core/model";
import ProgressBar from "@src/components/common/progressBar.component";
import { TaskListItem } from "./taskListItem.component";
import AlertPro from "@src/components/common/alertPro";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faFont, faBell, faTags, faTimes } from '@fortawesome/free-solid-svg-icons'
import { themes } from "@src/core/themes";
const screenWidth = Dimensions.get("window").width;
import SvgUri from 'react-native-svg-uri';
import { UserSearchSvg } from '@src/assets/icons';
interface ComponentProps {
  isLoading: boolean;
  data: TaskDataModel[];
  hospitalInfo: HospitalModel;
  unchecked: number;
  requestSync: () => void;
  onItemSelect: (index: number) => void;
  onPointChange: (index: number) => void;
  onTaskKindChange: (index: number) => void;
  isCompleted?: boolean;
  onScanPress: () => void;
  onDataRefresh: () => void;
}
interface State {
  invalidPointMsg: string;
  validPointMsg: string;
  validPoint: boolean;
  curPoint: number;
  isCompleted: boolean;
  fontSize: number;
  bedSearch: boolean,
  bedString: string;
  refreshing: boolean;
}
type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props, State> {
  private _alertPro: any;
  private _tempPointIndex: number;
  private _realPoint: number;
  private _checkPointInterval;
  constructor(props) {
    super(props);
    this._realPoint = UTILS.getTaskPointIndexFromTime(); // for task point add 1
    this.state = {
      validPointMsg: undefined,
      invalidPointMsg: "时段不正确",
      validPoint: true,
      curPoint: this._realPoint,
      bedSearch: false,
      bedString: '',
      isCompleted: this.props.isCompleted,
      fontSize: GLOBAL.fontSize[GLOBAL.curFontSize] * 1.2,
      refreshing: false
    };
  }
  componentDidMount() {
    this._checkPointInterval = setInterval(() => {
      this._realPoint = UTILS.getTaskPointIndexFromTime();
      if (this.state.curPoint != this._realPoint) {
        this.setState({ validPoint: false });
      }
    }, 5000);
  }
  componentWillUnmount() {
    this._checkPointInterval && clearInterval(this._checkPointInterval);
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.isCompleted != nextProps.isCompleted) {
      this.setState({ isCompleted: nextProps.isCompleted });
    }
    if (!nextProps.isLoading) {
      this.setState({
        refreshing: false
      });
    }
  }
  private onItemPress = (index: number) => {
    this.props.onItemSelect(index);
  };
  private changeSearch = (val: string) => {
    this.setState({ bedString: val });
  }
  private onPointChange = (index: number) => {
    if (index != this._realPoint) {
      this._tempPointIndex = index;
      this.setState(
        {
          invalidPointMsg: `是否继续选择${GLOBAL.todayTaskPoints[index].name}`,
          validPointMsg: `当前时间对应测量点为${GLOBAL.todayTaskPoints[this._realPoint].name}`
        },
        () => this._alertPro.open()
      );
    } else {
      this.setState({ curPoint: index });
      this.props.onPointChange(index);
    }
  };
  _renderAlert = () => {
    return (
      <AlertPro
        ref={ref => {
          this._alertPro = ref;
        }}
        title={this.state.validPointMsg}
        onConfirm={() => this.procPointOK()}
        onCancel={() => this.procPointCancel()}
        message={this.state.invalidPointMsg}
      />
    );
  };
  private procPointOK = () => {
    this.setState({ curPoint: this._tempPointIndex, validPoint: false });
    this.props.onPointChange(this._tempPointIndex);
  };
  private procPointCancel = () => {
    this.setState({ curPoint: this._realPoint });
  };
  private onSwtichPress = () => {
    this.setState({ curPoint: this._realPoint, validPoint: true });
    this.props.onPointChange(this._realPoint);
  };
  private onRefresh = () => {
    // if (UTILS.checkOffline()) return;

    if (!this.state.refreshing) {
      this.setState({ refreshing: true }, () => this.props.onDataRefresh());
    }
  };

  private renderPointAlert = () => {
    const { themedStyle } = this.props;
    return (
      <View style={themedStyle.alertbarContainer}>
        <Text>{`当前对应测量点为${GLOBAL.todayTaskPoints[this._realPoint].name}，是否切换`}</Text>
        <Button size="small" appearance="outline" status="warning" onPress={this.onSwtichPress}>
          {Strings.common.str_switch}
        </Button>
      </View>
    );
  };
  private renderToolbar = () => {
    const { themedStyle } = this.props;
    return (
      <View style={{
        flexDirection: 'column'
      }}>
        <View style={commonStyles.toolbarContainer}>
          <MyControlTab
            values={[Strings.patient.str_incompleted, Strings.patient.str_completed]}
            tabIndex={this.state.isCompleted ? 1 : 0}
            onTabItemPress={this.props.onTaskKindChange}
            containerStyle={themedStyle.tabContainer}
            tabsContainerStyle={themedStyle.tabsContainer}
          />
          {this.props.unchecked > 0 && (
            <TouchableOpacity onPress={() => this.props.requestSync()}>
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}>
                <FontAwesomeIcon icon={faTags} size={this.state.fontSize} color="orangered" />
                <Text style={{ marginLeft: 4 }}>{`${this.props.unchecked}`}</Text>
              </View>
            </TouchableOpacity>
          )}
          <SlideMenu
            disabled={false}
            name={"TASK_POINT_LABELS"}
            cols={2}
            data={UTILS.getSingleArrFromMultiArr(GLOBAL.todayTaskPoints, "name")}
            curItemIndex={this.state.curPoint}
            onMenuItemSelect={val => this.onPointChange(val)}
            textStyle={commonStyles.slideMenuText_2}
            triggerStyle={commonStyles.slideMenuTrigger}
          />
          <TouchableOpacity onPress={() => {
            const bedStatus = !this.state.bedSearch;
            this.setState({ bedSearch: bedStatus, bedString: '' });
            // this.props.onSearchPatient('');
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 9 }}>
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
  private renderItem = (info, index) => {
    const lastItem =
      this.props.data.length % 2 != 0 && index === this.props.data.length - 1 ? true : false;
    return (
      <TaskListItem
        hospitalInfo={this.props.hospitalInfo}
        completed={this.state.isCompleted}
        index={index}
        style={lastItem ? this.props.themedStyle.lastItem : this.props.themedStyle.item}
        data={info}
        onPress={(i, e) => this.onItemPress(i)}
        onLongPress={(i, e) => {
          GLOBAL.DEBUG && this.onItemPress(i);
        }} // for test on Debug mode
      />
    );
  };

  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    const scanBarHeight = 56;
    const search = this.state.bedString;
    let mData = data;
    if (search) {
      mData = data.filter(_it => {
        return _it.name.indexOf(search) > -1 || _it.bed_number.indexOf(search) > -1;
      });
    }
    return (
      <View style={{ flex: 1 }}>
        {this.renderToolbar()}
        {this._renderAlert()}
        {this.props.isLoading && !this.state.refreshing && GLOBAL.SHOW_LOADING ? (
          <View style={commonStyles.progressBar}>
            <ProgressBar />
          </View>
        ) : (
            <View style={{ flex: 1 }}>
              {!this.state.validPoint && this.renderPointAlert()}
              {mData.length > 0 ? (
                <View style={{ flex: 1, marginBottom: scanBarHeight }}>
                  <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index, separators }) => this.renderItem(item, index)}
                    numColumns={2}
                    contentContainerStyle={themedStyle.contentContainer}
                    initialNumToRender={10}
                    data={mData}
                    refreshing={this.state.refreshing}
                    onRefresh={this.onRefresh}
                    {...restProps}
                  />
                </View>
              ) : (
                  <View style={commonStyles.blankContainer}>
                    <Text category="h5" appearance="hint" style={{ color: "lightgray" }}>
                      {Strings.common.str_noData}
                    </Text>
                  </View>
                )}
              <Button
                style={{
                  position: "absolute",
                  width: "100%",
                  height: scanBarHeight,
                  borderRadius: 0,
                  bottom: 0
                }}
                textStyle={{ fontSize: 18, lineHeight: 20 }}
                onPress={this.props.onScanPress}
              >
                患 者 扫 码
            </Button>
            </View>
          )}
      </View>
    );
  }
}

export const MonitorTask = withStyles(MyComponent, (theme: ThemeType) => ({
  contentContainer: {
    paddingHorizontal: 3,
    paddingVertical: 3
  },
  toolbarButtn: {
    paddingHorizontal: 6
  },
  categoryStyle: {
    paddingRight: 3
  },
  tabsContainer: {
    width: screenWidth / 2.1,
    backgroundColor: theme["mycolor-background"]
  },
  tabContainer: {
    marginVertical: 6,
    marginHorizontal: 0,
    backgroundColor: theme["mycolor-background"]
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
  item: {
    flex: 0.5,
    minHeight: 160,
    // maxWidth: "50%",
    // maxWidth: itemWidth,
    marginHorizontal: 2,
    marginVertical: 2
  },
  lastItem: {
    flex: 0.48,
    minHeight: 160,
    marginHorizontal: 2,
    marginVertical: 2
  }
}));
