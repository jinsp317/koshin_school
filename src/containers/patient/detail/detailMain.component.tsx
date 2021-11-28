import React from "react";
import {
  View,
  Dimensions,
  Text,
  TouchableHighlight
} from "react-native";
import {
  withStyles,
  ThemeType,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { MenuDataModel } from "@src/core/model";

import GLOBAL from "@src/core/globals";

import { ScrollableTabView, ScrollableTabBar } from "@valdio/react-native-scrollable-tabview";
import { NavigationParams } from "react-navigation";
import { PatientMainInfoContainer } from '@src/containers/patient/detail/patientInfo/patientMainInfo.screen';
import { DoctorsOrderLogContainer } from '@src/containers/patient/detail/doctorsOrder/doctorsOrderLog.screen';
import { InhospitalLogContainer } from '@src/containers/patient/detail/inHospital/inhospitalLog.screen';
import { ConsultLogContainer } from '@src/containers/patient/detail/consult/consultLog.screen';
import { VisitLogContainer } from '@src/containers/patient/detail/visit/visitLog.screen';
import { GlucoseLogAContainer } from '@src/containers/patient/detail/glucoseLogA/glucoseLogA.screen';
import { GlucoseChartContainer } from '@src/containers/patient/detail/glucoseChart/glucoseChart.screen';
import { TodayTaskContainer } from '@src/containers/patient/detail/todayTask/todayTask.screen';
import { GlucoseLogBContainer } from '@src/containers/patient/detail/glucoseLogB/glucoseLogB.screen';
import { EditIconOutline, SwapIcon } from "@src/assets/icons";
import { InsulinOrderContainer } from './insulinOrder/insulinOrder.screen';

interface ComponentProps {
  tabIndex: number;
  navigation: NavigationParams;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  logKind: number;
  chartKind: number;
}

class MainComponent extends React.Component<Props, State> {
  private _childs: any[];

  constructor(props: Props) {
    super(props);

    this._childs = Array(30).fill(undefined);

    this.state = {
      logKind: 0,
      chartKind: 0
    };
  } 

  _setNavigationParams = (index: number) => {
    if (index < 0 || index === undefined) return;

    const child = this._childs[index];
    if (child) {
      const onRightPress = child.onTopRightPress;
      let rightIcon =
        index === 1 ? EditIconOutline : index === 0 || index === 6 ? SwapIcon : undefined;
      if (GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId && index === 1) {
        rightIcon = undefined;
      }

      this.props.navigation.setParams({
        onRightPress,
        rightIcon: rightIcon
      });
    }
  };

  renderTab(name, page, onPressHandler, onLayoutHandler) {
    return (
      <TouchableHighlight
        key={`${name}_${page}`}
        onPress={() => onPressHandler(page)}
        onLayout={onLayoutHandler}
        style={{ flex: 1, width: 100 }}
        underlayColor="#aaaaaa"
      >
        <Text>{name}</Text>
      </TouchableHighlight>
    );
  }
  _onRefresh = callback => {
    callback();
    // setTimeout(callback, 3000);
  };
  _onLogKindChange = (logKind: number) => {
    // console.log(this.state.logKind);
    if (this.state.logKind == 1 && logKind == 1) logKind = 0;
    this.setState({ logKind }, () => {
      this._setNavigationParams(5);
    });
  };
  _onChartKindChange = (chartKind: number) => {
    this.setState({ chartKind }, () => {
      this._setNavigationParams(6);
    });
  };
  _getMenuContainer = (index: number) => {
    if (index === 0) {
      if (this.state.logKind === 0) {
        return (
          <GlucoseLogAContainer
            navigation={this.props.navigation}
            onKindChange={this._onLogKindChange}
            ref={instance => (this._childs[index] = instance)}
          />
        );
      } else {
        return (
          <GlucoseLogBContainer
            navigation={this.props.navigation}
            onKindChange={this._onLogKindChange}
            ref={instance => (this._childs[index] = instance)}
          />
        );
      }
    } else if (index === 1) {
      return (
        <PatientMainInfoContainer
          navigation={this.props.navigation}
          ref={instance => (this._childs[index] = instance)}
        />
      );
    } else if (index === 2) {
      return (
        <InsulinOrderContainer navigation={this.props.navigation} ref={instance => (this._childs[index] = instance)} />)
    } else if (index === 3) {
      return (
        <DoctorsOrderLogContainer
          navigation={this.props.navigation}
          ref={instance => (this._childs[index] = instance)}
        />
      );
    } else if (index === 4) {
      return (
        <InhospitalLogContainer
          navigation={this.props.navigation}
          ref={instance => (this._childs[index] = instance)}
        />
      );
    } else if (index === 5) {
      return (
        <ConsultLogContainer
          navigation={this.props.navigation}
          ref={instance => (this._childs[index] = instance)}
        />
      );
    } else if (index === 6) {
      return (
        <VisitLogContainer
          navigation={this.props.navigation}
          ref={instance => (this._childs[index] = instance)}
        />
      );
    } else if (index === 7) {
      return (
        <GlucoseChartContainer
          navigation={this.props.navigation}
          onKindChange={this._onChartKindChange}
          ref={instance => (this._childs[index] = instance)}
        />
      );
      /* if (this.state.chartKind === 0) {
        return (
          <GlucoseChartContainer
            navigation={this.props.navigation}
            onKindChange={this._onChartKindChange}
            ref={instance => (this._childs[index] = instance)}
          />
        );
      } else {
        return (
          <GlucoseDayChartContainer
            navigation={this.props.navigation}
            onKindChange={this._onChartKindChange}
            ref={instance => (this._childs[index] = instance)}
          />
        );
      } */
    } else if (index === 8) {
      return (
        <TodayTaskContainer
          navigation={this.props.navigation}
          ref={instance => (this._childs[index] = instance)}
        />
      );
    }
  };
  _buildTab = (item: MenuDataModel, index: number) => {
    return (
      <View style={{ flex: 1 }} key={`tab_${index}`} tabLabel={`${item.caption}`}>
        {this._getMenuContainer(index)}
      </View>
    );
  };
  _onTabChange = param => {

    this._setNavigationParams(param.i);
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <ScrollableTabView
        style={themedStyle.container}
        // page={3}
        initialPage={this.props.tabIndex}
        locked={true}
        renderTabBar={() => <ScrollableTabBar />}
        tabBarTextStyle={themedStyle.tabText}
        onChangeTab={param => {
          this._onTabChange(param);
        }}
        tabBarUnderlineStyle={themedStyle.tabUnderline}
        showsHorizontalScrollIndicator={false}
      // refreshControlStyle={themedStyle.tabUnderline}
      // pullToRefresh={this._onRefresh}
      >
        {GLOBAL.MENUDATA_PATIENT.map((tab, index) => {
          if (
            GLOBAL.curUser.hospital_id != GLOBAL.curHospitalId &&
            index === GLOBAL.MENUDATA_PATIENT.length - 1
          ) {
            // UTILS.showToast(Strings.message.warning_noPrivillage);
          } else return this._buildTab(tab, index);
        })}
      </ScrollableTabView>
    );
  }

  getChannelList = (page: number) => {
    if (page == 0) {
      return;
    }
  };
}

export const DetailMain = withStyles(MainComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    marginVertical: 0,
    marginHorizontal: 0,
    backgroundColor: theme["mycolor-background"]
  },
  tabText: {
    fontSize: 18,
    lineHeight: 20,
    textAlign: "left",
    fontStyle: "normal",
    color: theme["color-primary-500"]
  },
  tabUnderline: {
    backgroundColor: theme["color-primary-500"]
  },
  collapsibleTabBar: {
    backgroundColor: "blue",
    paddingVertical: 20,
    minHeight: 80
  }
}));
