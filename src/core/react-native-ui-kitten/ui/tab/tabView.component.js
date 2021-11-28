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
import { View, } from 'react-native';
import { TabBar } from './tabBar.component';
import { ViewPager } from '../viewPager/viewPager.component';
class TabViewChildElement {
}
class TabViewChildren {
    constructor() {
        this.tabs = [];
        this.content = [];
    }
}
/**
 * Dynamic tabset component. Allows flipping through the tab "pages".
 *
 * @extends React.Component
 **
 * @property {number} selectedIndex - Determines current tab index.
 *
 * @property {StyleProp<ViewStyle>} tabBarStyle - Determines style TabBar component.
 *
 * @property {StyleProp<ViewStyle>} indicatorStyle - Determines style of selected tab indicator.
 *
 * @property {(index: number) => void} onSelect - Fires on "page" select with corresponding index.
 *
 * @property {TabElement | TabElement[]} children - Determines children of the component.
 *
 * @property {(index: number) => boolean} shouldLoadComponent - Determines loading behavior particular page and can be
 * used for lazy loading.
 *
 * @property {(offset: number) => void} onOffsetChange - Fires on scroll event with current scroll offset.
 *
 * @property ViewProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import {
 *   TabView,
 *   Tab,
 * } from 'react-native-ui-kitten';
 *
 * export class TabViewShowcase extends React.Component {
 *   public state: State = {
 *     selectedIndex: 0,
 *   };
 *
 *   private onSelect = (selectedIndex: number) => {
 *     this.setState({ selectedIndex });
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <TabView
 *         selectedIndex={this.state.selectedIndex}
 *         onSelect={this.onSelect}>
 *         <Tab title='TAB 1'
 *           <Text>Tab 1</Text>
 *         </Tab>
 *         <Tab title='TAB 2'
 *           <Text>Tab 2</Text>
 *         </Tab>
 *         <Tab title='TAB 3'
 *           <Text>Tab 3</Text>
 *         </Tab>
 *       </TabView>
 *     );
 *   }
 * }
 * ```
 *
 * @example Lazy loading usage example
 *
 * ```
 * import React from 'react';
 * import {
 *   TabView,
 *   Tab,
 * } from 'react-native-ui-kitten';
 *
 * export class TabViewShowcase extends React.Component {
 *
 *   public state = {
 *     selectedIndex: 0,
 *   };
 *
 *   private onSelect = (selectedIndex: number) => {
 *     this.setState({ selectedIndex });
 *   };
 *
 *   private shouldLoadTabContent = (index: number): boolean => {
 *     return index === this.state.selectedIndex;
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <TabView
 *         selectedIndex={this.state.selectedIndex}
 *         shouldLoadComponent={this.shouldLoadTabContent}
 *         onSelect={this.onSelect}>
 *         <Tab title='TAB 1'>
 *           <Text>Tab 1</Text>
 *         </Tab>
 *         <Tab title='TAB 2'>
 *           <Text>Tab 2</Text>
 *         </Tab>
 *         <Tab title='TAB 3'>
 *           <Text>Tab 3</Text>
 *         </Tab>
 *       </TabView>
 *     );
 *   }
 * }
 * ```
 *
 * @example Inline styling example
 *
 * ```
 * import React from 'react';
 * import { TabView, Tab, TabViewProps } from 'react-native-ui-kitten';
 *
 * export const TabViewShowcase = (props?: TabViewProps): React.ReactElement<TabViewProps> => {
 *   return (
 *     <TabView
 *       style={styles.tabView}
 *       tabBarStyle={styles.tabBar}
 *       indicatorStyle={styles.tabViewIndicator}>
 *       <Tab titleStyle={styles.tabTitle} title='TAB 1'>
 *         <Text>Tab 1</Text>
 *       </Tab>
 *       <Tab titleStyle={styles.tabTitle} title='TAB 2'>
 *         <Text>Tab 2</Text>
 *       </Tab>
 *       <Tab titleStyle={styles.tabTitle} title='TAB 3'>
 *         <Text>Tab 3</Text>
 *       </Tab>
 *     </TabView>
 *   );
 * };
 * ```
 * */
export class TabView extends React.Component {
    constructor() {
        super(...arguments);
        this.viewPagerRef = React.createRef();
        this.tabBarRef = React.createRef();
        this.onBarSelect = (index) => {
            const { current: viewPager } = this.viewPagerRef;
            viewPager.scrollToIndex({ index });
        };
        this.onPagerOffsetChange = (offset) => {
            const { current: tabBar } = this.tabBarRef;
            const tabCount = React.Children.count(tabBar.props.children);
            tabBar.scrollToOffset({ offset: offset / tabCount });
        };
        this.onPagerSelect = (selectedIndex) => {
            if (this.props.onSelect) {
                this.props.onSelect(selectedIndex);
            }
        };
        this.renderComponentChild = (element, index) => {
            return {
                tab: React.cloneElement(element, { key: index }),
                content: element.props.children,
            };
        };
        this.renderComponentChildren = (source) => {
            return React.Children.toArray(source).reduce((acc, element, index) => {
                const { tab, content } = this.renderComponentChild(element, index);
                return {
                    tabs: [...acc.tabs, tab],
                    content: [...acc.content, content],
                };
            }, new TabViewChildren());
        };
    }
    render() {
        const _a = this.props, { selectedIndex, children, tabBarStyle, indicatorStyle } = _a, derivedProps = __rest(_a, ["selectedIndex", "children", "tabBarStyle", "indicatorStyle"]);
        const { tabs, content } = this.renderComponentChildren(children);
        return (<View {...derivedProps}>
        <TabBar style={tabBarStyle} ref={this.tabBarRef} selectedIndex={selectedIndex} indicatorStyle={indicatorStyle} onSelect={this.onBarSelect}>
          {tabs}
        </TabBar>
        <ViewPager ref={this.viewPagerRef} selectedIndex={selectedIndex} shouldLoadComponent={this.props.shouldLoadComponent} onOffsetChange={this.onPagerOffsetChange} onSelect={this.onPagerSelect}>
          {content}
        </ViewPager>
      </View>);
    }
}
TabView.defaultProps = {
    selectedIndex: 0,
};
