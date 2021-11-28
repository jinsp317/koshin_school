/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { StyledComponentProps } from '../../theme';
import { BottomNavigationTabProps } from './bottomNavigationTab.component';
declare type TabElement = React.ReactElement<BottomNavigationTabProps>;
declare type ChildrenProp = TabElement | TabElement[];
interface ComponentProps {
    children: ChildrenProp;
    selectedIndex?: number;
    indicatorStyle?: StyleProp<ViewStyle>;
    onSelect?: (index: number) => void;
}
export declare type BottomNavigationProps = StyledComponentProps & ViewProps & ComponentProps;
/**
 * BottomNavigation component is designed to be a Bottom Tab Bar.
 * Can be used for navigation.
 *
 * @extends React.Component
 *
 * @property {number} selectedIndex - Determines index of the selected tab.
 *
 * @property {React.ReactElement<TabProps> | React.ReactElement<TabProps>[]} children -
 * Determines tabs of the Bottom Navigation.
 *
 * @property {StyleProp<ViewStyle>} indicatorStyle - Determines styles of the indicator.
 *
 * @property {(index: number) => void} onSelect - Triggered on select value.
 *
 * @property ViewProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import { BottomNavigation, BottomNavigationTab } from 'react-native-ui-kitten';
 *
 * export class BottomNavigationShowcase extends React.Component {
 *
 *   public state = {
 *     selectedIndex: 0,
 *   };
 *
 *   private onTabSelect = (selectedIndex: number) => {
 *     this.setState({ selectedIndex });
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <BottomNavigation
 *          selectedIndex={this.state.selectedIndex}
 *          onSelect={this.onTabSelect}
 *          <BottomNavigationTab title='Tab 1/>
 *          <BottomNavigationTab title='Tab 2/>
 *          <BottomNavigationTab title='Tab 3/>
 *       </BottomNavigation>
 *     );
 *   }
 * }
 * ```
 *
 * @example Inline styling example
 *
 * ```
 * import React, { ReactElement } from 'react';
 * import { BottomNavigation, BottomNavigationProps, BottomNavigationTab } from 'react-native-ui-kitten';
 *
 * export const BottomNavigationShowcase = (props?: BottomNavigationProps): ReactElement<BottomNavigationProps> => {
 *   return (
 *     <BottomNavigation
 *        style={styles.bottomBar}
 *        indicatorStyle={styles.indicator}>
 *        <BottomNavigationTab title='Tab 1/>
 *        <BottomNavigationTab title='Tab 2/>
 *        <BottomNavigationTab title='Tab 3/>
 *     </BottomNavigation>
 *   );
 * };
 * ```
 *
 * @example With React Navigation API and usage example
 *
 * ```
 * import React, { ReactElement } from 'react';
 * import {
 *   BottomNavigation,
 *   BottomNavigationTab,
 *   BottomNavigationProps,
 * } from 'react-native-ui-kitten';
 * import {
 *   createBottomTabNavigator,
 *   NavigationContainer,
 *   NavigationContainerProps,
 *   NavigationRoute,
 * } from 'react-navigation';
 *
 * type CommonNavigationProps = NavigationProps & NavigationContainerProps;
 *
 * export const TabNavigatorScreen: NavigationContainer = createBottomTabNavigator({
 *   ...screens,
 * }, {
 *   initialRouteName: 'Screen1',
 *   tabBarComponent: BottomNavigationShowcase,
 * });
 *
 * export const BottomNavigationShowcase = (props?: BottomNavigationProps): ReactElement<BottomNavigationProps> {
 *
 *  const onTabSelect = (selectedIndex: number) => {
 *    const { [index]: selectedRoute } = props.navigation.state.routes;
 *
 *    navigation.navigate(selectedRoute.routeName);
 *  };
 *
 *  return (
 *    <BottomNavigation
 *      selectedIndex={props.navigation.state.index}
 *      onSelect={onTabSelect}>
 *      <BottomNavigationTab title='Tab 1'/>
 *      <BottomNavigationTab title='Tab 2'/>
 *      <BottomNavigationTab title='Tab 3'/>
 *    </BottomNavigation>
 *   );
 * }
 * ```
 */
export declare class BottomNavigationComponent extends React.Component<BottomNavigationProps> {
    static styledComponentName: string;
    static defaultProps: Partial<BottomNavigationProps>;
    private onTabSelect;
    private getComponentStyle;
    private renderIndicatorElement;
    private renderTabElement;
    private renderTabElements;
    private renderComponentChildren;
    render(): React.ReactNode;
}
export declare const BottomNavigation: React.ComponentClass<BottomNavigationProps, any>;
export {};
