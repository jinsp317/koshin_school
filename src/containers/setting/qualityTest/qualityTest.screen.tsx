import React from "react";
import { NavigationScreenProps } from "react-navigation";
import GLOBAL from "@src/core/globals";
import { Alert, View, TouchableOpacity } from "react-native";
import { QualityTest } from "./qualityTest.component";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";
import { PeopleIconFill, SwtichUserIcon } from "@src/assets/icons";
import { database } from "@src/core/utils/database";
export class QualityTestScreen extends React.Component<NavigationScreenProps> {
  private _isDailyTest: boolean;
  private _clickCount: number;
  private _timeOut;
  componentWillMount() {
    this._isDailyTest = this.props.navigation.state.routeName === "Daily Quality Test";
    this._isDailyTest && this.setNavigationParams();
    this._clickCount = 0;
  }
  private setNavigationParams() {
    const onRightPress = this.onTopRightPress;
    this.props.navigation.setParams({
      onRightPress,
      rightIcon: SwtichUserIcon
    });
  }
  onTopRightPress = () => {
    const xpath = "Daily Swtich User";
    if (GLOBAL.curUser) {
      database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
    }
    this.props.navigation.navigate(xpath);
  };
  private onGetDataPress = () => {
    asyncStorageHelper.setTestQuality();
    const route = this._isDailyTest ? "Daily Test Glucose" : "Test Glucose";
    if (GLOBAL.curUser) {
      database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: route });
    }
    if (GLOBAL.curDevice.id || GLOBAL.curDevice.type  > 0 ) {
      const route = this._isDailyTest ? "Daily Test Glucose" : "Test Glucose";
      this.props.navigation.navigate(route);
    }
    else {
      this.props.navigation.navigate("Pair Device");
    }
    // this.props.navigation.navigate(route);
  };
  onGoMainPress = () => {
    // 1000(1초) 안에 버튼을 한번 더 클릭 할 경우
    if (this._clickCount < 5) {
      if (this._clickCount > 0) {
        clearTimeout(this._timeOut);
        this._timeOut = setTimeout(() => {
          this._clickCount = 0;
        }, 1000);
      } else {
        this._timeOut = setTimeout(() => {
          this._clickCount = 0;
        }, 1000);
      }
    } else {
      clearTimeout(this._timeOut);
      const xpath = "MainNavigator";
      if (GLOBAL.curUser) {
        database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
      }
      this.props.navigation.navigate(xpath);
    }
    this._clickCount++;
    //console.log("count is " + this._clickCount);
    return;
  };
  public render(): React.ReactNode {
    return (
      <View style={{ flex: 1 }}>
        <QualityTest onGetDataPress={this.onGetDataPress} />
        {this._isDailyTest && (
          <TouchableOpacity
            style={{ flex: 1, width: "100%", backgroundColor: "white" }}
            onPress={this.onGoMainPress}
          ></TouchableOpacity>
        )}
      </View>
    );
  }
}
