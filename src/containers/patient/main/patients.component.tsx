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
  Text
} from "react-native";
const { width } = Dimensions.get("window");
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps,
  ModalService
} from "@src/core/react-native-ui-kitten/theme";
import { Text as KittenText, Input } from "@src/core/react-native-ui-kitten/ui";
import { PatientModel } from "@src/core/model";
import { MyDatePicker, textStyle, MyControlTab } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import ProgressBar from "@src/components/common/progressBar.component";
import { PatientsListItem } from "./patientsListItem.component";

import { themes } from "@src/core/themes";


import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";

import Popover from "@src/components/common/popup";
import { PatientManageMenuModal } from "./patientManageMenu.modal";
import Modal from "react-native-modal";
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import SvgUri from 'react-native-svg-uri';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
const screenWidth = Dimensions.get("window").width;
import { UserSearchSvg } from '@src/assets/icons';

interface ComponentProps {
  data: PatientModel[];
  //  data: PatientModel[];
  isYuannei: boolean; // yuannei or yuanwai
  //  onItemSelect: (index: number) => void;
  onPopMenuPress: (index: number, kind: number) => void;
  onBtnInHospitalPress: () => void;
  onIsInChange: (kind: number) => void;
  onItemSelect: (index: PatientModel) => void;
  downAllData: boolean;
  showFooterLabel: boolean;
  downDataFailed: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  recentUpdateTime: string;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  headerDataLoading: boolean;
  footerDataLoading: boolean;
  // data: PatientModel[];
  downAllData: boolean;
  bedSearch: boolean;
  bedString: string;
  isModalVisible: boolean;
}

class PatientsComponent extends React.Component<Props, State> {
  private _listItemRef = React.createRef();

  constructor(props: Props) {
    super(props);

    this.state = {
      headerDataLoading: false,
      footerDataLoading: false,
      // data: [],
      bedSearch: false,
      bedString: undefined,
      downAllData: this.props.downAllData,
      isModalVisible: false
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    this.updateState(nextProps);
  }
  componentDidMount() {
    this.updateState(this.props);
  }
  componentWillUnmount() { }

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
        // data: props.data,
        downAllData: props.downAllData
      });
    }
  };

  onEndReached = () => {
    if (!this.state.downAllData && !this.state.footerDataLoading) {
      this.setState({ footerDataLoading: true }, () => this.props.onEndReached());
    }
  };

  onRefresh = () => {
    // if (UTILS.checkOffline()) return;
    // if (!this.state.headerDataLoading) {
    //   this.setState({ headerDataLoading: true }, () => this.props.onRefresh());
    // }
    this.props.onRefresh();
  };

  ListViewItemSeparator = () => {
    return <View style={{ height: 1, width: "100%", backgroundColor: "transparent" }} />;
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

  private onItemPress = (item: PatientModel) => {
    GLOBAL.curPatient = item;
    this.props.onItemSelect(item);
  };

  private onRadioChange = (index: number) => {
    //    if (index == 0) this.setState({ isYuannei: true });
    //    else this.setState({ isYuannei: false });

    this.props.onIsInChange(index);
  };
  private onPopMenuPress = (index: number, kind: number) => {
    this.setState({ isModalVisible: false });
    this.props.onPopMenuPress(index, kind);
  };
  private changeSearch = (val: string) => {
    this.setState({ bedString: val });
  }
  private renderToolbar = () => {
    const { themedStyle, ...restProps } = this.props;
    return (
      <View style={{
        flexDirection: 'column'
      }}>
        <View style={commonStyles.toolbarContainer}>
          <MyControlTab
            values={[Strings.patient.yuannei, Strings.patient.yuanwai]}
            tabIndex={this.props.isYuannei ? 0 : 1}
            onTabItemPress={this.onRadioChange}
            containerStyle={themedStyle.tabContainer}
            tabsContainerStyle={themedStyle.tabsContainer}
          />
          {this.props.isYuannei && (
            <TouchableOpacity onPress={this.props.onBtnInHospitalPress}>
              <Text style={commonStyles.toolbarText}>{Strings.patient.banlizhuyuan}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => {
            const bedStatus = !this.state.bedSearch;
            this.setState({ bedSearch: bedStatus, bedString: '' });
            // this.props.onSearchPatient('');
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 5, marginRight: 2 }}>
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
  private renderHeader = () => {
    const { themedStyle, ...restProps } = this.props;

    let header = [
      ["床号", "住院日期"],
      ["住院号", "科室"],
      ["姓名", "性别 年龄"],
      ["责任医生", "责任护士"]
    ];
    if (!this.props.isYuannei) {
      header = [
        ["历史床号", "出院日期"],
        ["历史住院号", "历史科室"],
        ["姓名", "性别 年龄"],
        ["历史医生", "历史护士"]
      ];
    }

    return (
      <View style={themedStyle.header}>
        {header.map((header, idx) => {
          const flexValue = 1;
          return (
            <View style={{ width: "25%" }} key={idx}>
              <View>
                <Text style={[themedStyle.headerText]} numberOfLines={1}>
                  {header[0]}
                </Text>
              </View>
              <View>
                <Text style={[themedStyle.headerText]} numberOfLines={1}>
                  {header[1]}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };
  private onItemLongPress = (item: PatientModel) => {

    if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId) {
      UTILS.showToast(Strings.message.warning_noPrivillage);
      return;
    }
    // if (GLOBAL.isOffline) return;

    // this.onItemPress(item);

    if (GLOBAL.DEBUG) this.onItemPress(item);

    if (!UTILS.isMyPatient(item)) {
      // console.log(`cancel press for UserId=${GLOBAL.curUser.id}`);
      // return;
    }

    GLOBAL.curPatient = item;

    this.setState({ isModalVisible: true });
    return;

    const menus1 = [
      {
        name: Strings.patient.faqihuizhen,
        onPress: () => {
          this.onPopMenuPress(index, 0);
          Popover.hide();
        }
      },
      {
        name: Strings.patient.banlichuyuan,
        onPress: () => {
          this.onPopMenuPress(index, 1);
          Popover.hide();
        }
      },
      {
        name: Strings.patient.xiugaizhuyuan,
        onPress: () => {
          this.onPopMenuPress(index, 2);
          Popover.hide();
        }
      }
    ];

    const menus2 = [
      {
        name: Strings.patient.faqisuifang,
        onPress: () => {
          this.onPopMenuPress(index, 3);
          Popover.hide();
        }
      },
      {
        name: Strings.patient.banliruyuan,
        onPress: () => {
          this.onPopMenuPress(index, 4);
          Popover.hide();
        }
      },
      {
        name: Strings.patient.yichuhuanzhe,
        onPress: () => {
          this.onPopMenuPress(index, 5);
          Popover.hide();
        }
      }
    ];

    {
      this._listItemRef.measure((ox, oy, width, height: number, px: number, py: number) => {
        {
          this.props.isYuannei &&
            Popover.show(
              menus1,
              {
                top: py < height ? py + height : py - height
              },
              py < height
            );
        }
        {
          !this.props.isYuannei &&
            Popover.show(
              menus2,
              { top: py < height ? py /* + height */ : py /* - height*/ },
              py < height
            );
        }
      });
    }
  };
  private renderItem = (item, index, separators) => {
    const { themedStyle, data } = this.props;

    return (
      <TouchableHighlight
        // ref={ref => (this._listItemRef = ref)}
        onPress={() => this.onItemPress(item)}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
        onLongPress={e => this.onItemLongPress(item)}
      >
        <PatientsListItem data={item} isYuannei={this.props.isYuannei} />
      </TouchableHighlight>
    );
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    let vData = this.props.data;
    const search = this.state.bedString;
    if (search) {
      vData = this.props.data.filter(_it => {
        return _it.name.indexOf(search) > -1 || _it.bed_number.indexOf(search) > -1;
      });
    }
    let pIndex = GLOBAL.curPatient && vData && vData.length > 0 ? vData.findIndex(_it => _it.id === GLOBAL.curPatient.id) : 0;
    if (pIndex < 0) pIndex = 0;
    return (
      <View style={themedStyle.container}>
        <Modal
          isVisible={this.state.isModalVisible}
          onBackdropPress={() => this.setState({ isModalVisible: false })}
          onSwipeComplete={() => this.setState({ isModalVisible: false })}
          onBackButtonPress={() => this.setState({ isModalVisible: false })}
          swipeDirection="left"
          style={{ alignItems: "center" }}
        >
          <PatientManageMenuModal
            onItemPress={index => this.onPopMenuPress(index, this.props.isYuannei ? 0 : 1)}
            isYuannei={this.props.isYuannei}
            onDelete={() => { }}
            caption={GLOBAL.curPatient ? GLOBAL.curPatient.name : ""}
          />
        </Modal>
        {this.renderToolbar()}

        {this.renderHeader()}

        {vData.length > 0 ? (
          <FlatList
            contentContainerStyle={themedStyle.contentContainer}
            data={vData}
            ItemSeparatorComponent={this.ListViewItemSeparator}
            keyExtractor={(item, index) => index.toString()}
            initialNumToRender={20}
            ListFooterComponent={this.renderFooter.bind(this)}
            getItemLayout={(item, index) => {
              const cellheight = 78;
              return {
                length: cellheight,
                offset: cellheight * (index > 0 ? index - 0.5 : 0),
                index
              }
            }}
            // onEndReachedThreshold={0.4} // pixel unit
            // onEndReached={this.onEndReached}
            initialScrollIndex={pIndex}
            onScrollToIndexFailed={info => {
              const wait = new Promise(resolve => setTimeout(resolve, 100));
              wait.then(() => {
                this._flatListItem.scrollToIndex({ index: info.index, animated: true });
              });
            }}
            refreshing={this.state.headerDataLoading}
            onRefresh={this.onRefresh}
            renderItem={({ item, index, separators }) => this.renderItem(item, index, separators)}
            scrollEventThrottle={10}
            ref={(ref) => (this._flatListItem = ref)}
          />
        ) : (
            <View style={commonStyles.blankContainer}>
              <KittenText category="h5" appearance="hint" style={{ color: "lightgray" }}>
                {Strings.common.str_noData}
              </KittenText>
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

export const Patients = withStyles(PatientsComponent, (theme: ThemeType) => ({
  container: {
    flex: 1
  },
  contentContainer: {
    paddingHorizontal: 0,
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
    backgroundColor: "#F0F0F0", // "#e1f4fe", //theme["background-basic-color-2"],
    justifyContent: "center",
    borderRadius: 0,
    width: "100%",
    minHeight: GLOBAL.HEAD_BAR_2LINE_HEIGHT,
    borderBottomColor: theme["mycolor-lightgray"],
    borderBottomWidth: 5
  },
  headerText: {
    fontSize: 16,
    color: "darkgray" // theme["text-hint-color"]
  },

  tabsContainer: {
    width: screenWidth / 2,
    backgroundColor: theme["mycolor-background"]
  },
  tabContainer: {
    marginVertical: 6,
    marginHorizontal: 0,
    backgroundColor: theme["mycolor-background"]
  }
}));
