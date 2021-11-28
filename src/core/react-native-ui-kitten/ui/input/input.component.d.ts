/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ImageProps, StyleProp, TextInputProps, TextStyle } from 'react-native';
import { StyledComponentProps, StyleType } from '../../theme';
declare type IconElement = React.ReactElement<ImageProps>;
declare type IconProp = (style: StyleType) => IconElement;
interface ComponentProps {
    status?: string;
    size?: string;
    disabled?: boolean;
    label?: string;
    caption?: string;
    captionIcon?: IconProp;
    icon?: IconProp;
    textStyle?: StyleProp<TextStyle>;
    labelStyle?: StyleProp<TextStyle>;
    captionTextStyle?: StyleProp<TextStyle>;

}
export declare type InputProps = StyledComponentProps & TextInputProps & ComponentProps;
/**
 * Styled Input component.
 *
 * @extends React.Component
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
 * @property {string} label - Determines label of the component.
 *
 * @property {StyleProp<TextStyle>} labelStyle - Customizes label style.
 *
 * @property {string} caption - Determines caption of the component.
 *
 * @property {StyleProp<TextStyle>} captionStyle - Customizes caption style.
 *
 * @property {StyleProp<TextStyle>} textStyle - Customizes text style.
 *
 * @property {(style: StyleType) => React.ReactElement<ImageProps>} icon - Determines icon of the component.
 *
 * @property {(style: StyleType) => React.ReactElement<ImageProps>} captionIcon - Determines caption icon.
 *
 * @property TextInputProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import { Input } from 'react-native-ui-kitten';
 *
 * export class InputShowcase extends React.Component {
 *
 *   public state = {
 *     inputValue: '',
 *   };
 *
 *   private onInputValueChange = (inputValue: string) => {
 *     this.setState({ inputValue });
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <Input
 *         value={this.state.inputValue}
 *         onChangeText={this.onInputValueChange}
 *       />
 *     );
 *   }
 * }
 * ```
 *
 * @example Inline styling example
 *
 * ```
 * import React from 'react';
 * import { Input, InputProps } from 'react-native-ui-kitten';
 *
 * export const InputShowcase = (props?: InputProps): React.ReactElement<InputProps> => {
 *   return (
 *     <Input
 *       style={styles.input}
 *       textStyle={styles.inputText}
 *       labelStyle={styles.inputLabel}
 *       captionStyle={styles.inputCaption}
 *       label='Label'
 *       caption='Caption'
 *       placeholder='Placeholder'
 *     />
 *   );
 * };
 * ```
 * */
export declare class InputComponent extends React.Component<InputProps> {
    static styledComponentName: string;
    static Icon: React.ComponentClass<ImageProps>;
    private onFocus;
    private onEndEditing;
    private getComponentStyle;
    private renderIconElement;
    private renderLabelElement;
    private renderCaptionElement;
    private renderCaptionIconElement;
    private renderComponentChildren;
    private onIconPress;//rhj
    render(): React.ReactElement<TextInputProps>;
}
export declare const Input: React.ComponentClass<InputProps, any>;
export { };
