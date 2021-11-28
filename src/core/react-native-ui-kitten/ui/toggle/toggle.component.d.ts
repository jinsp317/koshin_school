/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ViewProps, GestureResponderEvent, PanResponderGestureState, PanResponderCallbacks } from 'react-native';
import { StyledComponentProps } from '../../theme';
interface ComponentProps {
    checked?: boolean;
    disabled?: boolean;
    status?: string;
    size?: string;
    onChange?: (checked: boolean) => void;
}
export declare type ToggleProps = StyledComponentProps & ViewProps & ComponentProps;
/**
 * Styled Toggle component.
 *
 * @extends React.Component
 *
 * @property {boolean} value - Determines whether component is checked.
 * Default is `false`.
 *
 * @property {boolean} disabled - Determines whether component is disabled.
 * Default is `false`.
 *
 * @property {string} status - Determines the status of the component.
 * Can be `primary`, `success`, `info`, `warning` or `danger`.
 *
 * @property {string} size - Determines the size of the component.
 * Can be `giant`, `large`, `medium`, `small`, or `tiny`.
 * Default is `medium`.
 *
 * @property {(value: boolean) => void} onChange - Fires when selection state is changed.
 *
 * @property TouchableOpacityProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import { Toggle } from 'react-native-ui-kitten';
 *
 * export class ToggleShowcase extends React.Component {
 *
 *   public state = {
 *     checked: false,
 *   };
 *
 *   private onChange = (checked: boolean) => {
 *     this.setState({ checked });
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <Toggle
 *         value={this.state.checked}
 *         onValueChange={this.onChange}
 *       />
 *     );
 *   }
 * }
 * ```
 */
export declare class ToggleComponent extends React.Component<ToggleProps> implements PanResponderCallbacks {
    static styledComponentName: string;
    private panResponder;
    private thumbWidthAnimation;
    private thumbTranslateAnimation;
    private ellipseScaleAnimation;
    private thumbTranslateAnimationActive;
    constructor(props: ToggleProps);
    onStartShouldSetPanResponder: () => boolean;
    onStartShouldSetPanResponderCapture: () => boolean;
    onMoveShouldSetPanResponder: () => boolean;
    onMoveShouldSetPanResponderCapture: () => boolean;
    onPanResponderTerminationRequest: () => boolean;
    onPanResponderGrant: () => void;
    onPanResponderMove: () => boolean;
    onPanResponderRelease: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => void;
    private onPressIn;
    private onPressOut;
    private onPress;
    private getComponentStyle;
    private animateThumbTranslate;
    private animateThumbWidth;
    private animateEllipseScale;
    private animateThumbScale;
    private stopAnimations;
    private toggle;
    private getInterpolatedColor;
    render(): React.ReactElement<ViewProps>;
}
export declare const Toggle: React.ComponentClass<ToggleProps, any>;
export {};
