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
import { TabIndicator } from '../support/components';
/**
 * The `TabBar` component that manages Tab components.
 *
 * @extends React.Component
 *
 * @property {number} selectedIndex - Determines current tab index.
 *
 * @property {StyleProp<ViewStyle>} indicatorStyle - Determines style of selected tab indicator.
 *
 * @property {(index: number) => void} onSelect - Fires on tab select with corresponding index.
 *
 * @property {React.ReactElement<TabProps>} children - Determines tabs.
 *
 * @property ViewProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import {
 *   TabBar,
 *   Tab,
 * } from 'react-native-ui-kitten';
 *
 * export class TabBarShowcase extends React.Component {
 *
 *   public state = {
 *     selectedIndex: 0,
 *   };
 *
 *   private onBarSelect = (selectedIndex: number) => {
 *     this.setState({ selectedIndex });
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <TabBar
 *         selectedIndex={this.state.selectedIndex}
 *         onSelect={this.onBarSelect}>
 *         <Tab title='Tab 1'/>
 *         <Tab title='Tab 2'/>
 *         <Tab title='Tab 3'/>
 *       </TabBar>
 *     );
 *   }
 * }
 * ```
 */
export class TabBarComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.tabIndicatorRef = React.createRef();
        this.onTabSelect = (index) => {
            if (this.props.onSelect) {
                this.props.onSelect(index);
            }
        };
        this.getComponentStyle = (source) => {
            const { style, indicatorStyle } = this.props;
            const { indicatorHeight, indicatorBorderRadius, indicatorBackgroundColor } = source, containerParameters = __rest(source, ["indicatorHeight", "indicatorBorderRadius", "indicatorBackgroundColor"]);
            return {
                container: Object.assign({}, containerParameters, styles.container, StyleSheet.flatten(style)),
                indicator: Object.assign({ height: indicatorHeight, borderRadius: indicatorBorderRadius, backgroundColor: indicatorBackgroundColor }, styles.indicator, StyleSheet.flatten(indicatorStyle)),
            };
        };
        this.isTabSelected = (index) => {
            const { selectedIndex } = this.props;
            return index === selectedIndex;
        };
        this.renderTabElement = (element, index) => {
            return React.cloneElement(element, {
                key: index,
                style: [styles.item, element.props.style],
                selected: this.isTabSelected(index),
                onSelect: () => this.onTabSelect(index),
            });
        };
        this.renderTabElements = (source) => {
            return React.Children.map(source, this.renderTabElement);
        };
    }
    scrollToIndex(params) {
        const { current: tabIndicator } = this.tabIndicatorRef;
        tabIndicator.scrollToIndex(params);
    }
    scrollToOffset(params) {
        const { current: tabIndicator } = this.tabIndicatorRef;
        tabIndicator.scrollToOffset(params);
    }
    render() {
        const _a = this.props, { themedStyle, selectedIndex, children } = _a, derivedProps = __rest(_a, ["themedStyle", "selectedIndex", "children"]);
        const componentStyle = this.getComponentStyle(themedStyle);
        const tabElements = this.renderTabElements(children);
        return (<View>
        <View {...derivedProps} style={componentStyle.container}>
          {tabElements}
        </View>
        <TabIndicator ref={this.tabIndicatorRef} style={componentStyle.indicator} selectedPosition={selectedIndex} positions={tabElements.length}/>
      </View>);
    }
}
TabBarComponent.styledComponentName = 'TabBar';
TabBarComponent.defaultProps = {
    selectedIndex: 0,
};
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    indicator: {},
    item: {
        flex: 1,
    },
});
export const TabBar = styled(TabBarComponent);
