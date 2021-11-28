/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
import { StyleSheet, View, } from 'react-native';
import { styled, } from '../../theme';
import { TabIndicator, } from '../support/components';
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
export class BottomNavigationComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onTabSelect = (index) => {
            if (this.props.onSelect && this.props.selectedIndex !== index) {
                this.props.onSelect(index);
            }
        };
        this.getComponentStyle = (source) => {
            const { style, indicatorStyle } = this.props;
            const { indicatorHeight, indicatorBackgroundColor } = source, containerParameters = __rest(source, ["indicatorHeight", "indicatorBackgroundColor"]);
            return {
                container: Object.assign({}, containerParameters, styles.container, StyleSheet.flatten(style)),
                indicator: Object.assign({ height: indicatorHeight, backgroundColor: indicatorBackgroundColor }, styles.indicator, StyleSheet.flatten(indicatorStyle)),
            };
        };
        this.renderIndicatorElement = (positions, style) => {
            return (<TabIndicator key={0} style={style} selectedPosition={this.props.selectedIndex} positions={positions}/>);
        };
        this.renderTabElement = (element, index) => {
            return React.cloneElement(element, {
                key: index,
                style: [styles.item, element.props.style],
                selected: index === this.props.selectedIndex,
                onSelect: () => this.onTabSelect(index),
            });
        };
        this.renderTabElements = (source) => {
            return React.Children.map(source, this.renderTabElement);
        };
        this.renderComponentChildren = (source, style) => {
            const tabElements = this.renderTabElements(source);
            const hasIndicator = style.indicator.height > 0;
            return [
                hasIndicator ? this.renderIndicatorElement(tabElements.length, style.indicator) : null,
                ...tabElements,
            ];
        };
    }
    render() {
        const _a = this.props, { style, themedStyle, children } = _a, derivedProps = __rest(_a, ["style", "themedStyle", "children"]);
        const _b = this.getComponentStyle(themedStyle), { container } = _b, componentStyles = __rest(_b, ["container"]);
        const [indicatorElement, ...tabElements] = this.renderComponentChildren(children, componentStyles);
        return (<View {...derivedProps} style={container}>
        {indicatorElement}
        {tabElements}
      </View>);
    }
}
BottomNavigationComponent.styledComponentName = 'BottomNavigation';
BottomNavigationComponent.defaultProps = {
    selectedIndex: 0,
};
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    item: {
        flex: 1,
    },
    indicator: {
        position: 'absolute',
    },
});
export const BottomNavigation = styled(BottomNavigationComponent);
