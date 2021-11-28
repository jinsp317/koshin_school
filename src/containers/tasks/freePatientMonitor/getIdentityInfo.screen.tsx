import React from "react";
import { NavigationScreenProps } from "react-navigation";
import { GetIdentityInfo } from "./getIdentityInfo.component";

interface State {}

export class GetIdentityInfoScreen extends React.Component<
  NavigationScreenProps,
  State
> {
  constructor(props, ctx) {
    super(props, ctx);
  }

  public state: State = {};

  private onItemPress = (index: number) => {
    this.props.navigation.goBack();
    const callback = this.props.navigation.state.params.onGoBack;
    callback && callback({ dataReady: true });
    // this.props.navigation.state.params.onGoBack2({ dataReady: true });
  };

  public render(): React.ReactNode {
    const identityInfo = this.props.navigation.getParam("identityInfo", null);
    return (
      <GetIdentityInfo onItemPress={this.onItemPress} data={identityInfo} />
    );
  }
}
