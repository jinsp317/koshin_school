/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ImageProps, TouchableOpacityProps, StyleProp, TextStyle } from 'react-native';
import { StyledComponentProps, StyleType } from '../../theme';
declare type IconProp = (style: StyleType) => React.ReactElement<ImageProps>;
declare type ContentElement = React.ReactElement<any>;
interface ComponentProps {
    title?: string;
    titleStyle?: StyleProp<TextStyle>;
    icon?: IconProp;
    selected?: boolean;
    onSelect?: (selected: boolean) => void;
    children?: ContentElement;
}
export declare type TabProps = StyledComponentProps & TouchableOpacityProps & ComponentProps;
/**
 * Tab component is a part of TabBar or TabView component.
 * TabView Tabs should be wrapped in TabBar or TabView to provide usable component.
 * See usage examples at TabView component documentation.
 *
 * @extends React.Component
 *
 * @property {string} title - Determines the title of the component.
 *
 * @property {StyleProp<TextStyle>} titleStyle - Determines style of the title.
 *
 * @property {React.ReactElement<any>} children - Determines content of the tab.
 *
 * @property {(style: StyleType) => React.ReactElement<ImageProps>} icon - Determines icon of the component.
 *
 * @property {boolean} selected - Determines tab selection state.
 *
 * @property {(selected: boolean) => void} onSelect = Fires on onSelect event.
 *
 * @property TouchableOpacityProps
 *
 * @property StyledComponentProps
 */
export declare class TabComponent extends React.Component<TabProps> {
    static styledComponentName: string;
    static defaultProps: Partial<TabProps>;
    private onPress;
    private getComponentStyle;
    private renderTitleElement;
    private renderIconElement;
    private renderComponentChildren;
    render(): React.ReactElement<TouchableOpacityProps>;
}
export declare const Tab: React.ComponentClass<TabProps, any>;
export {};
