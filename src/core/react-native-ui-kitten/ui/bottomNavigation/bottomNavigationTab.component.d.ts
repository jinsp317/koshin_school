/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ImageProps, TouchableOpacityProps, StyleProp, TextStyle } from 'react-native';
import { StyledComponentProps, StyleType } from '../../theme';
declare type IconElement = React.ReactElement<ImageProps>;
declare type IconProp = (style: StyleType) => IconElement;
interface ComponentProps {
    title?: string;
    titleStyle?: StyleProp<TextStyle>;
    icon?: IconProp;
    selected?: boolean;
    onSelect?: (selected: boolean) => void;
}
export declare type BottomNavigationTabProps = StyledComponentProps & TouchableOpacityProps & ComponentProps;
/**
 * BottomNavigationTab component is a part of the BottomNavigation component.
 * BottomNavigation tabs should be wrapped in BottomNavigation to provide usable component.
 * See usage examples at BottomNavigation component documentation.
 *
 * @extends React.Component
 *
 * @property {boolean} selected - Determines whether component is selected.
 *
 * @property {string} title - Determines the title of the tab.
 *
 * @property {StyleProp<TextStyle>} titleStyle - Customizes title style.
 *
 * @property {(style: StyleType) => React.ReactElement<ImageProps>} icon - Determines the icon of the tab.
 *
 * @property {(selected: boolean) => void} onSelect - Triggered on select value.
 *
 * @property TouchableOpacityProps
 *
 * @property StyledComponentProps
 *
 */
export declare class BottomNavigationTabComponent extends React.Component<BottomNavigationTabProps> {
    static styledComponentName: string;
    private onPress;
    private getComponentStyle;
    private renderIconElement;
    private renderTitleElement;
    private renderComponentChildren;
    render(): React.ReactNode;
}
export declare const BottomNavigationTab: React.ComponentClass<BottomNavigationTabProps, any>;
export {};
