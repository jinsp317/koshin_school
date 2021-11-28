/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { StyledComponentProps } from '../../theme';
import { TabProps } from './tab.component';
declare type TabElement = React.ReactElement<TabProps>;
declare type ChildrenProp = TabElement | TabElement[];
interface ComponentProps {
    children: ChildrenProp;
    selectedIndex?: number;
    indicatorStyle?: StyleProp<ViewStyle>;
    onSelect?: (index: number) => void;
}
export declare type TabBarProps = StyledComponentProps & ViewProps & ComponentProps;
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
export declare class TabBarComponent extends React.Component<TabBarProps> {
    static styledComponentName: string;
    static defaultProps: Partial<TabBarProps>;
    private tabIndicatorRef;
    scrollToIndex(params: {
        index: number;
        animated?: boolean;
    }): void;
    scrollToOffset(params: {
        offset: number;
        animated?: boolean;
    }): void;
    private onTabSelect;
    private getComponentStyle;
    private isTabSelected;
    private renderTabElement;
    private renderTabElements;
    render(): React.ReactElement<ViewProps>;
}
export declare const TabBar: React.ComponentClass<TabBarProps, any>;
export {};
