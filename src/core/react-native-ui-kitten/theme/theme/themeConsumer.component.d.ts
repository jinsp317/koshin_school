/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { StyleSheetType, ThemedStyleType, ThemeType } from './type';
export interface ThemedComponentProps {
    theme?: ThemeType;
    themedStyle?: ThemedStyleType | undefined;
}
export declare type CreateStylesFunction = (theme: ThemeType) => StyleSheetType;
export interface Context {
    theme: ThemeType;
}
export declare type ThemedComponentClass<P> = React.ComponentClass<ThemedComponentProps & P>;
/**
 * High Order Function which is used to create themed style for non-styled component.
 * Basically used when need to use theme variable somewhere.
 * Returns component class which can be used as themed component.
 *
 * @property {ThemeType} theme - Determines theme used to style component.
 *
 * @property {StyleType} themedStyle - Determines component style for it's current state.
 *
 * @param Component - Type: {React.ComponentClass}. Determines class of component to be themed.
 *
 * @param createStyles - Type: {(theme: ThemeType) => any}. Determines arrow function used to create styles.
 *
 * @example Declaring Themed Component
 *
 * ```
 * import React from 'react';
 * import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
 * import { withStyles, ThemedComponentProps } from 'react-native-ui-kitten';
 *
 * type ThemedButtonProps = TouchableOpacityProps & ThemedComponentProps;
 *
 * class Button extends React.Component<ThemedButtonProps> {
 *
 *   public render(): React.ReactElement<TouchableOpacityProps> {
 *     // Retrieve styles from props (provided with themedStyle prop)
 *     // And apply it with saving priority of `style` prop
 *
 *     const { style, themedStyle, ...restProps } = this.props;
 *
 *     return (
 *       <TouchableOpacity
 *         {...restProps}
 *         style={[themedStyle, style]}
 *       />
 *     );
 *   }
 * }
 *
 * export const ThemedButton = withStyles(Button, (theme: ThemeType) => ({
 *   backgroundColor: theme['color-primary-default'],
 * }));
 * ```
 *
 * @example Themed Component Usage
 *
 * ```
 * import React from 'react';
 * import {
 *  ThemedButton,
 *  ThemedButtonProps,
 * } from './path-to/themedButton.component';
 *
 * export const ThemedButtonShowcase = (props?: ThemedButtonProps): React.ReactElement<ThemedButtonProps> => {
 *   return (
 *     <ThemedButton {...props}/>
 *   );
 * };
 * ```
 */
export declare const withStyles: <P extends object>(Component: React.ComponentType<P>, createStyles?: CreateStylesFunction) => React.ComponentClass<ThemedComponentProps & P, any>;
