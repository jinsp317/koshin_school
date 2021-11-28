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
import { PatientModel, PatientMonitorRawModel } from "@src/core/model";
import { MyDatePicker, textStyle, MyControlTab } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import ProgressBar from "@src/components/common/progressBar.component";
import { PatientsListItem } from "./patientsListItem.component";
import { themes } from "@src/core/themes";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";

import Popover from "@src/components/common/popup";

import Modal from "react-native-modal";
import { bool } from 'prop-types';
import { UserSummary } from '../../../core/model/monitor.model';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import SvgUri from 'react-native-svg-uri';
import { UserSearchSvg } from '@src/assets/icons';
const screenWidth = Dimensions.get("window").width;

interface ComponentProps {
  patientData: PatientMonitorRawModel[];
  userData: UserSummary[];
  kind: number;
  //  data: PatientModel[];
  // isPatient: number; // yuannei or yuanwai
  //  onItemSelect: (index: number) => void;
  onIsInChange: (kind: number) => void;
  downAllData: boolean;
  showFooterLabel: boolean;
  downDataFailed: boolean;
  curDate: Date;
  onEndReached: () => void;
  onRefresh: () => void;
  onUpdateTime: (date: Date) => void;
  recentUpdateTime: string;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  headerDataLoading: boolean;
  footerDataLoading: boolean;
  patientData: PatientMonitorRawModel[];
  userData: UserSummary[];
  curDate: Date;
  downAllData: boolean;
  kind: number;
  bedSearch: boolean;
  bedString: string;
  isModalVisible: boolean;
}

class PatientsComponent extends React.Component<Props, State> {
  private _listItemRef = React.createRef();
  private _maxTime: Date;

  constructor(props: Props) {
    super(props);
    this._maxTime = UTILS.getLastDateofMonth(undefined);
    this.state = {
      headerDataLoading: false,
      footerDataLoading: false,
      patientData: this.props.patientData,
      userData: this.props.userData,
      downAllData: this.props.downAllData,
      curDate: this.props.curDate,
      bedSearch: false,
      bedString: '',
      kind: this.props.kind,
      isModalVisible: false
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    this.updateState(nextProps);
  }
  componentDidMount() {
    // this.updateState(this.props);
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
        patientData: props.patientData,
        userData: props.userData,
        downAllData: props.downAllData
      });
    }
  };


  onRefresh = () => {
    // if (UTILS.checkOffline()) return;
    if (!this.state.headerDataLoading) {
      this.setState({ headerDataLoading: true }, () => this.props.onRefresh());
    }
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



  private onRadioChange = (index: number) => {
    this.setState({ kind: index });
    this.props.onIsInChange(index);
    //    if (index == 0) this.setState({ isYuannei: true });
    //    else this.setState({ isYuannei: false });

    // this.props.onIsInChange(index);
  };

  private onDateChange = (date: Date) => {
    this.setState({ curDate: date });
    this.props.onUpdateTime(date);
  }
  private onNavDatePress = (isPrev: boolean) => {
    const date = UTILS.modifyDate(this.state.curDate, 1, !isPrev, 0);
    if (UTILS.isFutureTime(this._maxTime, date)) return;
    this.setState({ curDate: date });
    this.props.onUpdateTime(date);
  }
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
            values={[Strings.patient.str_sta_patient, Strings.patient.str_sta_user]}
            tabIndex={this.state.kind}
            onTabItemPress={this.onRadioChange}
            containerStyle={themedStyle.tabContainer}
            tabsContainerStyle={themedStyle.tabsContainer}
          />
          <View style={{ flexDirection: "row", alignItems: "center", marginRight: 5 }}>
            <TouchableOpacity onPress={() => this.onNavDatePress(true)}>
              <Text style={{
                color: themes["App Theme"]["color-primary-500"],
                paddingLeft: 1
              }}
              >
                ◀
            </Text>
            </TouchableOpacity>
            <MyDatePicker
              onDateChange={this.onDateChange}
              date={this.state.curDate}
              maxDate={this._maxTime}
              textColor={themes["App Theme"]["color-primary-500"]}
              format="YYYY-MM-DD"
            />
            <TouchableOpacity onPress={() => this.onNavDatePress(false)}>
              <Text style={{
                color: themes["App Theme"]["color-primary-500"],
                paddingRight: 1
              }}
              >
                ▶
            </Text>
            </TouchableOpacity>
          </View>
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
  private renderSummary = (datas: PatientMonitorRawModel[]) => {
    const { themedStyle, ...restProps } = this.props;
    const summary = datas;
    const all_sum = summary.reduce((rs, _it) => {
      if (_it.record_obj) {
        rs.to_records += Number(_it.record_obj);
      }
      rs.patients += 1;
      // if (kind == 0) {
      rs.tasks += _it.advice.filter(_i => _i == 1).length;
      // }

      if (_it.record_all) {
        rs.all_records += Number(_it.record_all);
      }
      if (_it.record_month) {
        rs.month_recs += Number(_it.record_month);
      }
      return rs;
    }, { to_records: 0, patients: 0, tasks: 0, all_records: 0, month_recs: 0 });
    if (__DEV__) console.info(all_sum);
    return (
      <View style={themedStyle.headerSummary}>
        <View style={{ width: "25%" }}>
          <Text style={themedStyle.headerSummaryText}>{`共计`}</Text>
        </View>
        <View style={{ width: "25%" }}>
          <Text style={themedStyle.headerSummaryText}>{`${all_sum.patients}人`}</Text>
        </View>
        <View style={{ width: "25%" }}>
          <Text style={themedStyle.headerSummaryText}>{`${all_sum.to_records}/${all_sum.tasks}`}</Text>
        </View>
        <View style={{ width: "25%" }}>
          <Text style={themedStyle.headerSummaryText}>{`${all_sum.all_records}`}</Text>
        </View>
      </View>
    )
  }
  private renderUserSummary = (users: UserSummary[]) => {
    const { themedStyle, ...restProps } = this.props;
    const summary = users;
    const all_sum = summary.reduce((rs, _it) => {
      if (_it.todays) {
        rs.todays += Number(_it.todays);
      }
      rs.users += 1;

      if (_it.months) {
        rs.months += Number(_it.months);
      }
      return rs;
    }, { todays: 0, users: 0, tasks: 0, all_records: 0, months: 0 });
    if (__DEV__) console.info(all_sum);
    return (
      <View style={themedStyle.headerSummary}>
        <View style={{ width: "25%" }}>
          <Text style={themedStyle.headerSummaryText}>{`共计`}</Text>
        </View>
        <View style={{ width: "25%" }}>
          <Text style={themedStyle.headerSummaryText}>{`${all_sum.users}人`}</Text>
        </View>
        <View style={{ width: "25%" }}>
          <Text style={themedStyle.headerSummaryText}>{`${all_sum.months}`}</Text>
        </View>
        <View style={{ width: "25%" }}>
          <Text style={themedStyle.headerSummaryText}>{`${all_sum.todays}`}</Text>
        </View>
      </View>
    )
  }
  private renderHeader = () => {
    const { themedStyle, ...restProps } = this.props;

    let header = [
      ["床号", "科室"],
      ["姓名", "住院号"],
      ["今日血糖测量", "任务"],
      ["入院期间", "总测量数"]
    ];
    if (this.state.kind == 1) {
      header = [
        ["工号", "病区"],
        ["姓名", "科室"],
        ["本月测量", ""],
        ["今日测量", ""]
      ];
    }

    // console.log(summary);
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

  private renderPItem = (item, index, separators) => {
    // const { themedStyle } = this.props;

    return (
      <PatientsListItem data={item} udata={undefined} kind={true} />
    );
  };
  private renderUItem = (item, index, separators) => {
    return (
      <PatientsListItem data={undefined} udata={item} kind={false} />
    );
  }
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    const search = this.state.bedString;
    let summary = this.state.patientData;
    if (search) {
      summary = this.state.patientData.filter(_it => {
        return _it.name.indexOf(search) > -1 || _it.bed_number.indexOf(search) > -1;
      });
    }

    // let renderData = summary;
    // if (this.state.kind == 1) {
    //   const doctors = summary.reduce((rs, _pat) => {
    //     const key = _pat.doctor_name;
    //     if (!rs[key]) {
    //       rs[key] = [];
    //     }
    //     rs[key].push(_pat);
    //     return rs;
    //   }, {});
    //   const keys = Object.keys(doctors);
    //   renderData = [];
    //   keys.forEach(dct => {
    //     const pats = doctors[dct] as PatientMonitorRawModel[];
    //     let month_recs = 0;
    //     let all_recs = 0;
    //     pats.forEach(_it => {
    //       if (_it.record_month) {
    //         month_recs += _it.record_month;
    //       }
    //       if (_it.record_obj) {
    //         all_recs += Number(_it.record_obj);
    //       }
    //     })
    //     // const month_records = pats.reduce((rs, _pat) => {
    //     //   if (_pat.record_month) {
    //     //     rs.month_recs += Number(_pat.record_month);
    //     //   }
    //     //   if (_pat.record_all) {
    //     //     rs.all_recs += Number(_pat.record_all);
    //     //   }
    //     // }, { month_recs: 0, all_recs: 0 });
    //     // tslint:disable-next-line: max-line-length
    //     renderData.push({
    //       department_name: pats[0].department_name,
    //       doctor_name: pats[0].doctor_name,
    //       record_month: month_recs,
    //       record_all: all_recs,
    //       id: 0,
    //       name: '',
    //       doctor_nick: pats[0].doctor_nick
    //     })
    //   });
    //   console.log(renderData);
    // }

    return (
      <View style={themedStyle.container}>
        {this.renderToolbar()}
        {this.renderHeader()}
        {this.state.kind == 0 ? this.renderSummary(summary) : this.renderUserSummary(this.state.userData)}
        {this.state.kind == 0 && this.state.patientData.length > 0 && (
          <FlatList
            contentContainerStyle={themedStyle.contentContainer}
            data={summary}
            ItemSeparatorComponent={this.ListViewItemSeparator}
            keyExtractor={(item, index) => index.toString()}
            initialNumToRender={10}
            ListFooterComponent={this.renderFooter.bind(this)}
            refreshing={this.state.headerDataLoading}
            onRefresh={this.onRefresh}
            renderItem={({ item, index, separators }) => this.renderPItem(item, index, separators)}
            scrollEventThrottle={10}
          />
        )}
        {this.state.kind == 1 && this.state.userData.length > 0 && (
          <FlatList
            contentContainerStyle={themedStyle.contentContainer}
            data={this.state.userData}
            ItemSeparatorComponent={this.ListViewItemSeparator}
            keyExtractor={(item, index) => index.toString()}
            initialNumToRender={10}
            ListFooterComponent={this.renderFooter.bind(this)}
            refreshing={this.state.headerDataLoading}
            onRefresh={this.onRefresh}
            renderItem={({ item, index, separators }) => this.renderUItem(item, index, separators)}
            scrollEventThrottle={10}
          />
        )}
        {(this.state.kind == 0 && this.state.patientData.length == 0 || this.state.kind == 1 && this.state.userData.length == 0) && (
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
    borderBottomColor: theme["mycolor-lightgray"],
    borderBottomWidth: 5
  },
  headerSummary: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingLeft: 3,
    backgroundColor: "#F0F0F0", // "#e1f4fe", //theme["background-basic-color-2"],
    justifyContent: "center",
    borderRadius: 0,
    width: "100%",
    borderBottomColor: theme["mycolor-lightgray"],
    borderBottomWidth: 1
  },
  headerText: {
    fontSize: 16,
    color: "darkgray" // theme["text-hint-color"]
  },
  headerSummaryText: {
    fontSize: 16,
    textAlign: 'center',
    color: theme["text-primary-color"]
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
