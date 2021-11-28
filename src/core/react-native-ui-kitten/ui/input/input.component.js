/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
import { Image, StyleSheet, TextInput, View, TouchableOpacity, Alert, } from 'react-native';
import { Interaction, styled, } from '../../theme';
import { Text, } from '../text/text.component';
import { allWithRest, isValidString, } from '../support/services';
import { FlexStyleProps, } from '../support/typings';
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
export class InputComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onFocus = (event) => {
            this.props.dispatch([Interaction.FOCUSED]);
            if (this.props.onFocus) {
                this.props.onFocus(event);
            }
        };
        this.onEndEditing = (event) => {
            this.props.dispatch([]);
            if (this.props.onEndEditing) {
                this.props.onEndEditing(event);
            }
        };
        this.onIconPress = () => {
            this.props.dispatch([]);
            if (this.props.onIconPress) {
                this.props.onIconPress();
            }
        };

        this.getComponentStyle = (source) => {
            const { style, textStyle, labelStyle, captionTextStyle, } = this.props;
            const _a = allWithRest(StyleSheet.flatten(style), FlexStyleProps), { rest: inputContainerStyle } = _a, containerStyle = __rest(_a, ["rest"]);
            const { textMarginHorizontal, textFontSize, textLineHeight, textFontWeight, textColor, placeholderColor, iconWidth, iconHeight, iconMarginHorizontal, iconTintColor, labelColor, labelFontSize, labelLineHeight, labelMarginBottom, labelFontWeight, captionMarginTop, captionColor, captionFontSize, captionLineHeight, captionFontWeight, captionIconWidth, captionIconHeight, captionIconMarginRight, captionIconTintColor } = source, containerParameters = __rest(source, ["textMarginHorizontal", "textFontSize", "textLineHeight", "textFontWeight", "textColor", "placeholderColor", "iconWidth", "iconHeight", "iconMarginHorizontal", "iconTintColor", "labelColor", "labelFontSize", "labelLineHeight", "labelMarginBottom", "labelFontWeight", "captionMarginTop", "captionColor", "captionFontSize", "captionLineHeight", "captionFontWeight", "captionIconWidth", "captionIconHeight", "captionIconMarginRight", "captionIconTintColor"]);
            return {
                container: Object.assign({}, styles.container, containerStyle),
                inputContainer: Object.assign({}, containerParameters, styles.inputContainer, inputContainerStyle),
                captionContainer: Object.assign({ marginTop: captionMarginTop }, styles.captionContainer),
                text: Object.assign({
                    marginHorizontal: textMarginHorizontal, fontSize: textFontSize,
                    // FIXME: RN issue (https://github.com/facebook/react-native/issues/7823)
                    // lineHeight: textLineHeight,
                    fontWeight: textFontWeight, color: textColor
                }, styles.text, StyleSheet.flatten(textStyle)),
                placeholder: {
                    color: placeholderColor,
                },
                icon: Object.assign({ width: iconWidth, height: iconHeight, marginHorizontal: iconMarginHorizontal, tintColor: iconTintColor }, styles.icon),
                label: Object.assign({ color: labelColor, fontSize: labelFontSize, lineHeight: labelLineHeight, marginBottom: labelMarginBottom, fontWeight: labelFontWeight }, styles.label, StyleSheet.flatten(labelStyle)),
                captionIcon: Object.assign({ width: captionIconWidth, height: captionIconHeight, tintColor: captionIconTintColor, marginRight: captionIconMarginRight }, styles.captionIcon),
                captionLabel: Object.assign({ fontSize: captionFontSize, fontWeight: captionFontWeight, lineHeight: captionLineHeight, color: captionColor }, styles.captionLabel, StyleSheet.flatten(captionTextStyle)),
            };
        };
        this.renderIconElement = (style) => {
            const iconElement = this.props.icon(style);
            return React.cloneElement(iconElement, {
                key: 0,
                style: [style, iconElement.props.style],
            });
        };
        this.renderLabelElement = (style) => {
            return (<Text key={1} style={style}>
                {this.props.label}
            </Text>);
        };
        this.renderCaptionElement = (style) => {
            return (<Text key={2} style={style}>
                {this.props.caption}
            </Text>);
        };
        this.renderCaptionIconElement = (style) => {
            const iconElement = this.props.captionIcon(style);
            return React.cloneElement(iconElement, {
                key: 3,
                style: [style, iconElement.props.style],
            });
        };
        this.renderComponentChildren = (style) => {
            const { icon, label, captionIcon, caption } = this.props;
            return [
                icon && this.renderIconElement(style.icon),
                isValidString(label) && this.renderLabelElement(style.label),
                isValidString(caption) && this.renderCaptionElement(style.captionLabel),
                captionIcon && this.renderCaptionIconElement(style.captionIcon),
            ];
        };
    }
    render() {
        const _a = this.props, { themedStyle, disabled } = _a, restProps = __rest(_a, ["themedStyle", "disabled"]);
        const componentStyle = this.getComponentStyle(themedStyle);
        const [iconElement, labelElement, captionElement, captionIconElement,] = this.renderComponentChildren(componentStyle);
        return (<View style={componentStyle.container}>
            {labelElement}
            <View style={componentStyle.inputContainer}>
                <TextInput {...restProps} style={componentStyle.text} placeholderTextColor={componentStyle.placeholder.color} editable={!disabled} onFocus={this.onFocus} onEndEditing={this.onEndEditing} />
                <TouchableOpacity onPress={this.onIconPress}>
                    {iconElement}
                </TouchableOpacity>

            </View>
            <View style={componentStyle.captionContainer}>
                {captionIconElement}
                {captionElement}
            </View>
        </View>);
    }
}
InputComponent.styledComponentName = 'Input';
InputComponent.Icon = Image;
const styles = StyleSheet.create({
    container: {},
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    captionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 'auto',
    },
    icon: {},
    label: {},
    captionIcon: {},
    captionLabel: {},
});
export const Input = styled(InputComponent);
