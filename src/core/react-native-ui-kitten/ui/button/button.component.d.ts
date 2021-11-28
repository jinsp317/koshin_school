/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ImageProps, StyleProp, TextStyle, TouchableOpacityProps } from 'react-native';
import { StyledComponentProps, StyleType } from '../../theme';
declare type IconElement = React.ReactElement<ImageProps>;
declare type IconProp = (style: StyleType) => IconElement;
interface ComponentProps {
    textStyle?: StyleProp<TextStyle>;
    icon?: IconProp;
    status?: string;
    size?: string;
    children?: string;
}
export declare type ButtonProps = StyledComponentProps & TouchableOpacityProps & ComponentProps;
/**
 * Styled Button component.
 *
 * @extends React.Component
 *
 * @property {boolean} disabled - Determines whether component is disabled.
 * Default is `false`.
 *
 * @property {string} status - Determines the status of the component.
 * Can be `primary`, `success`, `info`, `warning`, `danger` or `white`.
 *
 * @property {string} size - Determines the size of the component.
 * Can be `giant`, `large`, `medium`, `small`, or `tiny`.
 * Default is `medium`.
 *
 * @property {string} children - Determines text of the component.
 *
 * @property {StyleProp<TextStyle>} textStyle - Customizes text style.
 *
 * @property {(style: StyleType) => React.ReactElement<ImageProps>} icon - Determines icon of the component.
 *
 * @property {string} appearance - Determines the appearance of the component.
 * Can be `filled` | `outline` | `ghost`.
 * Default is `filled`.
 *
 * @property TouchableOpacityProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import {
 *   Button,
 *   ButtonProps,
 * } from 'react-native-ui-kitten';
 *
 * export const ButtonShowcase = (props?: ButtonProps): React.ReactElement<ButtonProps> => {
 *
 *   const onPress = () => {
 *     // Handle Button press
 *   };
 *
 *   return (
 *     <Button onPress={onPress}>
 *       BUTTON
 *     </Button>
 *   );
 * };
 * ```
 *
 * @example Inline styling example
 *
 * ```
 * import React from 'react';
 * import {
 *   Button,
 *   ButtonProps,
 * } from 'react-native-ui-kitten';
 *
 * export const ButtonShowcase = (props?: ButtonProps): React.ReactElement<ButtonProps> => {
 *   return (
 *     <Button
 *       style={styles.button}
 *       textStyle={styles.buttonText}>
 *       BUTTON
 *     </Button>
 *   );
 * };
 * ```
 */
export declare class ButtonComponent extends React.Component<ButtonProps> {
    static styledComponentName: string;
    private onPress;
    private onPressIn;
    private onPressOut;
    private getComponentStyle;
    private renderTextElement;
    private renderIconElement;
    private renderComponentChildren;
    render(): React.ReactElement<TouchableOpacityProps>;
}
export declare const Button: React.ComponentClass<ButtonProps, any>;
export {};
