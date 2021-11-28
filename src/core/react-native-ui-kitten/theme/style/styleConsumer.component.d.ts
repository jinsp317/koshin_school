/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ThemeStyleType } from '@src/core/@eva-design/dss';
import { Interaction, StyleType } from './type';
import { ThemeType } from '../theme/type';
export interface StyledComponentProps {
    appearance?: string;
    theme?: ThemeType;
    themedStyle?: StyleType;
    dispatch?: (interaction: Interaction[]) => void;
}
export interface ContextProps {
    style: ThemeStyleType;
    theme: ThemeType;
}
export declare type StyledComponentClass<P> = React.ComponentClass<StyledComponentProps & P>;
/**
 * High Order Function which is used to apply style mapping on component.
 *
 * Requires component to have `styledComponentName` string property which defines
 * corresponding component name in mapping. (e.g 'Button' for Button component).
 * Returns component class which can be used as styled component.
 *
 * @property {string} appearance - Determines style appearance of component. Default is provided by mapping.
 *
 * @property {ThemeType} theme - Determines theme used to style component.
 *
 * @property {StyleType} themedStyle - Determines component style for it's current state.
 *
 * @property {(interaction: Interaction[]) => void} dispatch - Determines function
 * for dispatching current state of component. This is designed to be used as style request function.
 * Calls component re-render if style for requested state differ from current.
 *
 * @param Component - Type: {React.ComponentClass}. Determines class or functional component to be styled.
 *
 * @example Declaring Styled Component
 *
 * ```
 * import React from 'react';
 * import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
 * import { styled, StyledComponentProps, Interaction } from 'react-native-ui-kitten';
 *
 * type StyledButtonProps = TouchableOpacityProps & StyledComponentProps;
 *
 * class Button extends React.Component<StyledButtonProps> {
 *
 *   // Define component name used in `mapping`
 *   static styledComponentName: string = 'Button';
 *
 *   private onPressIn = (e: GestureResponderEvent) => {
 *     // Request styles for `active` state and re-render
 *
 *     this.props.dispatch([Interaction.ACTIVE]);
 *
 *     if(this.props.onPressIn) {
 *       this.props.onPressIn(e);
 *     }
 *   };
 *
 *   private onPressOut = (e: GestureResponderEvent) => {
 *     // Request styles for default state and re-render
 *
 *     this.props.dispatch([]);
 *
 *     if(this.props.onPressOut) {
 *       this.props.onPressOut(e);
 *     }
 *   };
 *
 *   public render(): React.ReactElement<ButtonProps> {
 *     // Retrieve styles for current state from props (provided with themedStyle prop)
 *     // And apply it with saving priority of `style` prop
 *
 *     const { style, themedStyle, ...restProps } = this.props;
 *
 *     return (
 *       <TouchableOpacity
 *         {...restProps}
 *         style={[themedStyle, style]}
 *         onPressIn={this.onPressIn}
 *         onPressOut={this.onPressOut}
 *       />
 *     );
 *   }
 * }
 *
 * export const StyledButton = styled<StyledButtonProps>(Button);
 * ```
 *
 * @example Styled Component Usage
 *
 * ```
 * import React from 'react';
 * import {
 *   StyledButton,
 *   StyledButtonProps,
 * } from './path-to/styledButton.component';
 *
 * export const StyledButtonShowcase = (props?: StyledButtonProps): React.ReactElement<StyledButtonProps> => {
 *   return (
 *     <StyledButton {...props}/>
 *   );
 * };
 * ```
 */
export declare const styled: <P extends object>(Component: React.ComponentType<P>) => React.ComponentClass<StyledComponentProps & P, any>;
