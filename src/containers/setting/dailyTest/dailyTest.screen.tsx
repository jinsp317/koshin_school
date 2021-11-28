import Strings from "@src/assets/strings";
import React, { Component } from "react";
import { StyleSheet, View, ToastAndroid, Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import {
  GlucoseMonitorModel,
  RequestGlucoseMonitorModel,
  PatientModel,
  MANAGE_KIND
} from "@src/core/model";
import { DailyTest } from "./dailyTest.component";
import commonStyles from "@src/containers/styles/common";
interface State {
  isLoading: boolean;
}
interface ComponentProps {
  kind?: MANAGE_KIND;
}

type Props = NavigationScreenProps & ComponentProps;
export class DailyTestScreen extends React.Component<Props, State> {
  constructor(props: NavigationScreenProps) {
    super(props);
    this.state = { isLoading: false };
  }

  componentWillReceiveProps(nextProps: Props) { }
  componentDidMount() {
    this.updateData();
  }

  private updateData = () => { };

  render() {
    return (
      <View style={commonStyles.container}>
        <DailyTest navigation={this.props.navigation} />
      </View>
    );
  }
}
