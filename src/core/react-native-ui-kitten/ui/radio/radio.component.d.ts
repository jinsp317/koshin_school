/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { StyleProp, TextStyle, TouchableOpacityProps } from 'react-native';
import { StyledComponentProps } from '../../theme';
interface ComponentProps {
    textStyle?: StyleProp<TextStyle>;
    text?: string;
    checked?: boolean;
    status?: string;
    onChange?: (selected: boolean) => void;
}
export declare type RadioProps = StyledComponentProps & TouchableOpacityProps & ComponentProps;
/**
 * Styled Radio component.
 *
 * @extends React.Component
 *
 * @property {boolean} checked - Determines whether component is checked.
 * Default is `false`.
 *
 * @property {boolean} disabled - Determines whether component is disabled.
 * Default is `false`.
 *
 * @property {string} status - Determines the status of the component.
 * Can be `primary`, `success`, `info`, `warning` or `danger`.
 *
 * @property {string} text - Determines text of the component.
 *
 * @property {StyleProp<TextStyle>} textStyle - Customizes text style.
 *
 * @property {(selected: boolean) => void} onChange - Triggered on onChange value.
 *
 * @property TouchableOpacityProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import { Radio } from 'react-native-ui-kitten';
 *
 * export class RadioShowcase extends React.Component {
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
 *       <Radio
 *         checked={this.state.checked}
 *         onChange={this.onChange}
 *       />
 *     )
 *   }
 * }
 * ```
 *
 * @example Inline styling example
 *
 * ```
 * import React from 'react';
 * import { Radio, RadioProps } from 'react-native-ui-kitten';
 *
 * export const RadioShowcase = (props?: RadioProps): React.ReactElement<RadioProps> => {
 *   return (
 *     <Radio
 *       style={styles.radio}
 *       textStyle={styles.radioText}
 *       text='Place your text'
 *       checked={true}
 *     />
 *   );
 * };
 * ```
 */
export declare class RadioComponent extends React.Component<RadioProps> {
    static styledComponentName: string;
    private onPress;
    private onPressIn;
    private onPressOut;
    private getComponentStyle;
    private renderTextElement;
    private renderComponentChildren;
    render(): React.ReactElement<TouchableOpacityProps>;
}
export declare const Radio: React.ComponentClass<RadioProps, any>;
export {};
