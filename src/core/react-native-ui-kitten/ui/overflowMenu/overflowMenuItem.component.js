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
import { TouchableOpacity, StyleSheet, } from 'react-native';
import { Interaction, styled, } from '../../theme';
import { Text, } from '../text/text.component';
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
export class OverflowMenuItemComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onPress = (event) => {
            if (this.props.onPress) {
                this.props.onPress(this.props.index, event);
            }
        };
        this.onPressIn = (event) => {
            this.props.dispatch([Interaction.ACTIVE]);
            if (this.props.onPressIn) {
                this.props.onPressIn(this.props.index, event);
            }
        };
        this.onPressOut = (event) => {
            this.props.dispatch([]);
            if (this.props.onPressOut) {
                this.props.onPressOut(this.props.index, event);
            }
        };
        this.onLongPress = (event) => {
            if (this.props.onLongPress) {
                this.props.onLongPress(this.props.index, event);
            }
        };
        this.getComponentStyle = (source) => {
            const { style, textStyle } = this.props;
            const { textMarginHorizontal, textFontSize, textLineHeight, textFontWeight, textColor, iconWidth, iconHeight, iconMarginHorizontal, iconTintColor } = source, containerStyle = __rest(source, ["textMarginHorizontal", "textFontSize", "textLineHeight", "textFontWeight", "textColor", "iconWidth", "iconHeight", "iconMarginHorizontal", "iconTintColor"]);
            return {
                container: Object.assign({}, containerStyle, styles.container, StyleSheet.flatten(style)),
                text: Object.assign({ marginHorizontal: textMarginHorizontal, fontSize: textFontSize, lineHeight: textLineHeight, fontWeight: textFontWeight, color: textColor }, StyleSheet.flatten(textStyle)),
                icon: {
                    width: iconWidth,
                    height: iconHeight,
                    marginHorizontal: iconMarginHorizontal,
                    tintColor: iconTintColor,
                },
            };
        };
        this.renderTextElement = (style) => {
            return (<Text key={2} style={style}>
        {this.props.text}
      </Text>);
        };
        this.renderIconElement = (style) => {
            const iconElement = this.props.icon(style);
            return React.cloneElement(iconElement, {
                key: 1,
                style: [style, iconElement.props.style],
            });
        };
        this.renderComponentChildren = (style) => {
            const { icon } = this.props;
            return [
                icon && this.renderIconElement(style.icon),
                this.renderTextElement(style.text),
            ];
        };
    }
    render() {
        const _a = this.props, { style, themedStyle } = _a, restProps = __rest(_a, ["style", "themedStyle"]);
        const _b = this.getComponentStyle(themedStyle), { container } = _b, componentStyles = __rest(_b, ["container"]);
        const [iconElement, textElement] = this.renderComponentChildren(componentStyles);
        return (<TouchableOpacity activeOpacity={1.0} {...restProps} style={container} onPress={this.onPress} onPressIn={this.onPressIn} onPressOut={this.onPressOut} onLongPress={this.onLongPress}>
        {iconElement}
        {textElement}
      </TouchableOpacity>);
    }
}
OverflowMenuItemComponent.styledComponentName = 'OverflowMenuItem';
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
export const OverflowMenuItem = styled(OverflowMenuItemComponent);
