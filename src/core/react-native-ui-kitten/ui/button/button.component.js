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
import { StyleSheet, TouchableOpacity, } from 'react-native';
import { Interaction, styled, } from '../../theme';
import { Text, } from '../text/text.component';
import { isValidString } from '../support/services';
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
export class ButtonComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onPress = (event) => {
            if (this.props.onPress) {
                this.props.onPress(event);
            }
        };
        this.onPressIn = (event) => {
            this.props.dispatch([Interaction.ACTIVE]);
            if (this.props.onPressIn) {
                this.props.onPressIn(event);
            }
        };
        this.onPressOut = (event) => {
            this.props.dispatch([]);
            if (this.props.onPressOut) {
                this.props.onPressOut(event);
            }
        };
        this.getComponentStyle = (source) => {
            const { style, textStyle } = this.props;
            const { textColor, textFontSize, textLineHeight, textFontWeight, textMarginHorizontal, iconWidth, iconHeight, iconTintColor, iconMarginHorizontal } = source, containerParameters = __rest(source, ["textColor", "textFontSize", "textLineHeight", "textFontWeight", "textMarginHorizontal", "iconWidth", "iconHeight", "iconTintColor", "iconMarginHorizontal"]);
            return {
                container: Object.assign({}, containerParameters, styles.container, StyleSheet.flatten(style)),
                text: Object.assign({ color: textColor, fontSize: textFontSize, lineHeight: textLineHeight, fontWeight: textFontWeight, marginHorizontal: textMarginHorizontal }, styles.text, StyleSheet.flatten(textStyle)),
                icon: Object.assign({ width: iconWidth, height: iconHeight, tintColor: iconTintColor, marginHorizontal: iconMarginHorizontal }, styles.icon),
            };
        };
        this.renderTextElement = (style) => {
            return (<Text key={1} style={style}>
        {this.props.children}
      </Text>);
        };
        this.renderIconElement = (style) => {
            const iconElement = this.props.icon(style);
            return React.cloneElement(iconElement, {
                key: 2,
                style: [style, iconElement.props.style],
            });
        };
        this.renderComponentChildren = (style) => {
            const { icon, children } = this.props;
            return [
                icon && this.renderIconElement(style.icon),
                isValidString(children) && this.renderTextElement(style.text),
            ];
        };
    }
    render() {
        const _a = this.props, { themedStyle } = _a, derivedProps = __rest(_a, ["themedStyle"]);
        const _b = this.getComponentStyle(themedStyle), { container } = _b, componentStyles = __rest(_b, ["container"]);
        const [iconElement, textElement] = this.renderComponentChildren(componentStyles);
        return (<TouchableOpacity activeOpacity={1.0} {...derivedProps} style={container} onPress={this.onPress} onPressIn={this.onPressIn} onPressOut={this.onPressOut}>
        {iconElement}
        {textElement}
      </TouchableOpacity>);
    }
}
ButtonComponent.styledComponentName = 'Button';
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {},
    icon: {},
});
export const Button = styled(ButtonComponent);
