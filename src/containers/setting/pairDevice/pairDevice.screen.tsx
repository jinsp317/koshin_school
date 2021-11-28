import React from "react";
import { Alert } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { PairDevice } from "./pairDevice.component";

import GLOBAL from "@src/core/globals";
import BackgroundJob from "react-native-background-job";

type Props = NavigationScreenProps;
export class PairDeviceScreen extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  componentDidMount() {
    BackgroundJob.cancelAll();
  }
  componentWillUnmount() {
    GLOBAL.startBackgroundJobs();
  }
  componentWillReceiveProps(nextProps) {}

  public render(): React.ReactNode {
    return <PairDevice />;
  }
}
