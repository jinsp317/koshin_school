import Strings from "@src/assets/strings";
import React from "react";
import { NavigationParams, NavigationScreenProps } from "react-navigation";
import { MenuContainer } from "@src/containers/menu";
import { ArrowIosBackFill, HomeIconOutline } from "@src/assets/icons";
import { TopNavigationBar } from "./components/topNavigationBar.component";
import { getCurrentRouteState, NavigationRouteState } from "./routeUtil";
import GLOBAL from "@src/core/globals";
import SwitchTaskMenu from "@src/components/common/switchTaskMenu";
import { database } from "@src/core/utils/database";
export type TopNavigationElement = React.ReactElement<any>;
export type BottomNavigationElement = React.ReactElement<any>;

export interface TopNavigationParams extends NavigationParams {
  topNavigation: (props: NavigationScreenProps) => TopNavigationElement | null;
}

export interface BottomNavigationParams extends NavigationParams {
  bottomNavigation: (props: NavigationScreenProps) => BottomNavigationElement | null;
}

export const MenuTopNavigationParams: TopNavigationParams = {
  topNavigation: (props: NavigationScreenProps): TopNavigationElement => {
    const state: NavigationRouteState = getCurrentRouteState(props.navigation);

    return (
      <TopNavigationBar
        {...props}
        // title={state.routeName}
        title={state.params.caption}
        backIcon={!state.params.root && ArrowIosBackFill}
        onBackPress={() => {
          props.navigation.goBack(null);
        }}
      />
    );
  }
};

export const OutPatientTopNavigatiorParams: TopNavigationParams = {
  topNavigation: (props: NavigationScreenProps): TopNavigationElement => {
    const state: NavigationRouteState = getCurrentRouteState(props.navigation);

    return (
      <TopNavigationBar
        {...props}
        // title={state.routeName}
        title={state.params.caption}
        backIcon={!state.params.root && ArrowIosBackFill}
        onBackPress={() => {
          GLOBAL.curHospitalMode = 0;
          const xpath = "Setting Container";
          if (GLOBAL.curUser) {
            database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
          }
          props.navigation.navigate(xpath);
        }}
      />
    );
  }
};

export const MeasureNavigationParams: TopNavigationParams = {
  topNavigation: (props: NavigationScreenProps): TopNavigationElement => {
    const state: NavigationRouteState = getCurrentRouteState(props.navigation);

    return (
      <TopNavigationBar
        {...props}
        // title={state.routeName}
        title={state.params.caption}
        backIcon={!state.params.root && ArrowIosBackFill}
        onBackPress={() => {
          props.navigation.goBack(null);
        }}
      />
    );
  }
};
export const MenuBottomNavigationParams: BottomNavigationParams = {
  bottomNavigation: (props: NavigationScreenProps): BottomNavigationElement => {
    return <MenuContainer {...props} />;
  }
};

export const RootNavigatorParams: NavigationParams = {
  root: true
};

export const MenuNavigatorParams: NavigationParams = {
  ...MenuTopNavigationParams,
  ...MenuBottomNavigationParams
};

export const PatientsNavigationParams: TopNavigationParams = {
  topNavigation: (props: NavigationScreenProps): TopNavigationElement => {
    const state: NavigationRouteState = getCurrentRouteState(props.navigation);

    return (
      <SwitchTaskMenu
        {...props}
        menuText={`${state.params.caption} (${GLOBAL.curPatient.name})`}
        data={GLOBAL.MENUDATA_PATIENT}
        onItemSelect={route => {
          if (GLOBAL.curUser) {
            database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: route });
          }
          props.navigation.navigate(route);
        }}
        leftItemText={"home"}
        leftIcon={ArrowIosBackFill}
        onLeftItemPress={() => {
          const xpath = "Patients Screen";
          if (GLOBAL.curUser) {
            database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: xpath });
          }
          props.navigation.navigate(xpath); // ;goBack(null);
        }}
        rightItemText={state.params.rightText}
        rightIcon={state.params.rightIcon}
        onRightItemPress={state.params.onRightPress}
      />
    );
  }
};
export const TaskNavigationParams: TopNavigationParams = {
  topNavigation: (props: NavigationScreenProps): TopNavigationElement => {
    const state: NavigationRouteState = getCurrentRouteState(props.navigation);

    return (
      <SwitchTaskMenu
        {...props}
        menuText={`${state.params.caption}`}
        data={GLOBAL.MENUDATA_TASK}
        onItemSelect={route => {
          if (GLOBAL.curUser) {
            database.userAccessLogSet({ id: GLOBAL.curUser.id, remember_token: route });
          }
          props.navigation.navigate(route)
        }}
        leftItemText={state.params.leftText}
        leftIcon={state.params.leftIcon}
        onLeftItemPress={state.params.onLeftPress}
        rightItemText={state.params.rightText}
        rightIcon={state.params.rightIcon && state.params.rightIcon}
        onRightItemPress={state.params.onRightPress}
      />
    );
  }
};
export const MyTopNavigationParams: TopNavigationParams = {
  topNavigation: (props: NavigationScreenProps): TopNavigationElement => {
    const state: NavigationRouteState = getCurrentRouteState(props.navigation);

    return (
      <TopNavigationBar
        {...props}
        title={state.params.caption}
        backIcon={
          state.params.leftIcon ? state.params.leftIcon : !state.params.root && ArrowIosBackFill
        }
        onBackPress={() => {
          state.params.onLeftPress ? state.params.onLeftPress() : props.navigation.goBack(null);
        }}
        right1Icon={state.params.rightIcon}
        onRight1Press={() => {
          state.params.onRightPress();
        }}
      />
    );
  }
};
