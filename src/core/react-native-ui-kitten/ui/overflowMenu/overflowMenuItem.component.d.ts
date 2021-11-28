/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ImageProps, StyleProp, TextStyle } from 'react-native';
import { StyledComponentProps, StyleType } from '../../theme';
import { TouchableIndexedProps } from '../support/typings';
declare type IconElement = React.ReactElement<ImageProps>;
declare type IconProp = (style: StyleType) => IconElement;
interface ListDerivedProps {
    index?: number;
}
export interface OverflowMenuItemType extends ListDerivedProps {
    icon?: IconProp;
    text: string;
    textStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
}
export declare type OverflowMenuItemProps = StyledComponentProps & TouchableIndexedProps & OverflowMenuItemType;
/**
 * OverflowMenuItem is a part of the OverflowMenu component.
 * OverflowMenu items should be wrapped in OverflowMenu to provide usable component.
 * See usage examples at OverflowMenu component documentation.
 *
 * @extends React.Component
 *
 * @property {string} text - Determines title of the menu item.
 *
 * @property {StyleProp<TextStyle>} textStyle - Customizes text style.
 *
 * @property {string} size - Determines size of the component.
 * Can be `small`, `medium` or `large`.
 * Default is `medium`.
 *
 * @property {boolean} disabled - Determines whether component is disabled.
 * By default is `false`.
 *
 * @property {(style: StyleType) => React.ReactElement<ImageProps>} icon - Determines the icon of the menu item.
 *
 * @property TouchableOpacityIndexedProps
 *
 * @property StyledComponentProps
 *
 */
export declare class OverflowMenuItemComponent extends React.Component<OverflowMenuItemProps> {
    static styledComponentName: string;
    private onPress;
    private onPressIn;
    private onPressOut;
    private onLongPress;
    private getComponentStyle;
    private renderTextElement;
    private renderIconElement;
    private renderComponentChildren;
    render(): React.ReactNode;
}
export declare const OverflowMenuItem: React.ComponentClass<OverflowMenuItemProps, any>;
export {};
