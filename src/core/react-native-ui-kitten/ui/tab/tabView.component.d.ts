/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from "react";
import { StyleProp, ViewProps, ViewStyle } from "react-native";
import { TabProps } from "./tab.component";
declare type TabElement = React.ReactElement<TabProps>;
declare type ChildrenProp = TabElement | TabElement[];
interface ComponentProps {
  children: ChildrenProp;
  selectedIndex?: number;
  tabBarStyle?: StyleProp<ViewStyle>;
  indicatorStyle?: StyleProp<ViewStyle>;
  shouldLoadComponent?: (index: number) => boolean;
  onOffsetChange?: (offset: number) => void;
  onSelect?: (index: number) => void;
}
export declare type TabViewProps = ViewProps & ComponentProps;
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
export declare class TabView extends React.Component<TabViewProps> {
  static defaultProps: Partial<TabViewProps>;
  private viewPagerRef;
  private tabBarRef;
  private onBarSelect;
  private onPagerOffsetChange;
  private onPagerSelect;
  private renderComponentChild;
  private renderComponentChildren;
  render(): React.ReactElement<ViewProps>;
}
export {};
