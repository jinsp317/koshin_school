import Strings from "@src/assets/strings";
import React from "react";
import { View, Alert, FlatList, TouchableOpacity } from "react-native";
import {
  withStyles,
  ThemeType,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { Button, ButtonProps, RadioGroup, Text, Input } from "@src/core/react-native-ui-kitten/ui";

import CategoryPicker from "@src/components/common/categoryPicker.component";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "../../styles/common";
import { MonitorPatientModel } from "@src/core/model";
import ProgressBar from "@src/components/common/progressBar.component";
import { PatientListItem } from "./patientListItem.component";
import { EventRegister } from "react-native-event-listeners";
import { NavigationBackActionPayload } from "react-navigation";
import { HospitalModel } from '../../../core/model/hospital.model';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faFont, faBell, faTags, faTimes } from '@fortawesome/free-solid-svg-icons'
import { themes } from "@src/core/themes";
import SvgUri from 'react-native-svg-uri';
import { UserSearchSvg } from '@src/assets/icons';
interface ComponentProps {
  isLoading: boolean;
  isRefresh: boolean;
  unchecked: number;
  data: MonitorPatientModel[];
  requestSyn: () => void;
  onItemSelect: (index: number, item: MonitorPatientModel) => void;
  onNoMonitorKindChange: (index: number) => void;
  onOrderKindChange: (index: number) => void;
  onScanPress: () => void;
  hospitalInfo: HospitalModel;
  onRefreshData: () => void;
}
interface State {
  refreshing: boolean;
  bedSearch: boolean;
  bedString: string;
  fontSize: number;
}
type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props, State> {
  private syncListener: any;
  constructor(props) {
    super(props);
    this.state = { refreshing: true, fontSize: GLOBAL.fontSize[GLOBAL.curFontSize] * 1.2, bedSearch: false, bedString: '' };
  }
  componentWillReceiveProps(nextProps: Props) {
    if (!nextProps.isLoading) {
      this.setState({
        refreshing: false
      });
    }
  }
  private onItemPress = (index: number, item: MonitorPatientModel) => {
    this.props.onItemSelect(index, item);
  };
  public onRefresh = () => {
    this.props.onRefreshData();
    /* if (!this.state.refreshing) {
      this.setState({ refreshing: true }, () => this.props.onRefreshData());
    } */
  };
  private changeSearch = (val: string) => {
    this.setState({ bedString: val });
  }
  componentWillMount() {
    EventRegister.addEventListener(GLOBAL.sync_success, data => {
      this.onRefresh();
    });
  }
  componentWillUnmount() {
    EventRegister.removeAllListeners();
  }

  private renderToolbar = () => {
    const { themedStyle, ...restProps } = this.props;

    return (
      <View style={{
        flexDirection: 'column'
      }}>
        <View style={commonStyles.toolbarContainer}>
          <CategoryPicker
            style={themedStyle.categoryStyle}
            options={GLOBAL.TASKTIMEFILTERS}
            defCategoryIndex={GLOBAL.curSearchUserIndex}
            selectCategory={(i, v) => this.props.onNoMonitorKindChange(i)}
          />
          {this.props.unchecked > 0 && (
            <TouchableOpacity onPress={() => this.props.requestSyn()}>
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}>
                <FontAwesomeIcon icon={faTags} size={this.state.fontSize} color="orangered" />
                <Text style={{ marginLeft: 4 }}>{`${this.props.unchecked}`}</Text>
              </View>
            </TouchableOpacity>
          )}
          <CategoryPicker
            // style={themedStyle.categoryStyle}
            options={GLOBAL.DOCTORSORDERS}
            defCategoryIndex={GLOBAL.curSearchUserIndex}
            selectCategory={(i, v) => this.props.onOrderKindChange(i)}
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
    const lastItem = this.props.data.length % 2 != 0 && index === this.props.data.length - 1 ? true : false;

    return (
      <PatientListItem
        index={index}
        hospitalInfo={this.props.hospitalInfo}
        style={lastItem ? this.props.themedStyle.lastItem : this.props.themedStyle.item}
        data={info}
        onPress={(i, e) => this.onItemPress(i, info)}
        onLongPress={(i, e) => {
          // this.onItemPress(i);
          GLOBAL.DEBUG && this.onItemPress(i, info);
        }} // for test on Debug mode
      />
    );
  };

  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    const scanBarHeight = 56;
    const search = this.state.bedString;
    let vdata = data;
    if (search) {
      vdata = data.filter(_it => {
        return _it.name.indexOf(search) > -1 || _it.bed_number.indexOf(search) > -1;
      })
    }
    return (
      <View style={{ flex: 1 }}>
        {this.renderToolbar()}
        {this.props.isLoading && !this.state.refreshing && GLOBAL.SHOW_LOADING ? (
          <View style={commonStyles.progressBar}>
            <ProgressBar />
          </View>
        ) : (
            <View style={{ flex: 1 }}>
              {data.length > 0 ? (
                <View style={{ flex: 1, marginBottom: scanBarHeight }}>
                  <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index, separators }) => this.renderItem(item, index)}
                    numColumns={2}
                    contentContainerStyle={themedStyle.contentContainer}
                    initialNumToRender={10}
                    data={vdata}
                    refreshing={this.props.isRefresh}
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
              <Button style={{
                position: "absolute",
                width: "100%",
                height: scanBarHeight,
                borderRadius: 0,
                bottom: 0
              }}
                textStyle={{ fontSize: 18, lineHeight: 20 }}
                onPress={this.props.onScanPress}
              >
                腕 带 扫 码
            </Button>
            </View>
          )}
      </View>
    );
  }
}

export const MonitorPatient = withStyles(MyComponent, (theme: ThemeType) => ({
  contentContainer: {
    paddingHorizontal: 3,
    paddingVertical: 3
  },
  toolbarButtn: {
    paddingHorizontal: 6
  },
  categoryStyle: {
    flex: 1,
    left: 8
  },
  item: {
    flex: 0.5,
    minHeight: 160,
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
