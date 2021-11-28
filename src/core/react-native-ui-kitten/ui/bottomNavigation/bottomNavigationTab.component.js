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
import { styled, } from '../../theme';
import { Text, } from '../text/text.component';
import { isValidString } from '../support/services';
/**
 * BottomNavigationTab component is a part of the BottomNavigation component.
 * BottomNavigation tabs should be wrapped in BottomNavigation to provide usable component.
 * See usage examples at BottomNavigation component documentation.
 *
 * @extends React.Component
 *
 * @property {boolean} selected - Determines whether component is selected.
 *
 * @property {string} title - Determines the title of the tab.
 *
 * @property {StyleProp<TextStyle>} titleStyle - Customizes title style.
 *
 * @property {(style: StyleType) => React.ReactElement<ImageProps>} icon - Determines the icon of the tab.
 *
 * @property {(selected: boolean) => void} onSelect - Triggered on select value.
 *
 * @property TouchableOpacityProps
 *
 * @property StyledComponentProps
 *
 */
export class BottomNavigationTabComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onPress = () => {
            if (this.props.onSelect) {
                this.props.onSelect(!this.props.selected);
            }
        };
        this.getComponentStyle = (source) => {
            const { style, titleStyle } = this.props;
            const { iconWidth, iconHeight, iconMarginVertical, iconTintColor, textMarginVertical, textFontSize, textLineHeight, textFontWeight, textColor } = source, containerStyle = __rest(source, ["iconWidth", "iconHeight", "iconMarginVertical", "iconTintColor", "textMarginVertical", "textFontSize", "textLineHeight", "textFontWeight", "textColor"]);
            return {
                container: Object.assign({}, containerStyle, styles.container, StyleSheet.flatten(style)),
                icon: Object.assign({ width: iconWidth, height: iconHeight, marginVertical: iconMarginVertical, tintColor: iconTintColor }, styles.icon),
                text: Object.assign({ marginVertical: textMarginVertical, fontSize: textFontSize, lineHeight: textLineHeight, fontWeight: textFontWeight, color: textColor }, styles.text, StyleSheet.flatten(titleStyle)),
            };
        };
        this.renderIconElement = (style) => {
            const iconElement = this.props.icon(style);
            return React.cloneElement(iconElement, {
                key: 1,
                style: [style, iconElement.props.style],
            });
        };
        this.renderTitleElement = (style) => {
            const { title } = this.props;
            return (<Text key={2} style={style}>
        {title}
      </Text>);
        };
        this.renderComponentChildren = (style) => {
            const { icon, title } = this.props;
            return [
                icon && this.renderIconElement(style.icon),
                isValidString(title) && this.renderTitleElement(style.text),
            ];
        };
    }
    render() {
        const _a = this.props, { style, themedStyle } = _a, derivedProps = __rest(_a, ["style", "themedStyle"]);
        const _b = this.getComponentStyle(themedStyle), { container } = _b, componentStyles = __rest(_b, ["container"]);
        const [iconElement, titleElement] = this.renderComponentChildren(componentStyles);
        return (<TouchableOpacity {...derivedProps} style={container} activeOpacity={1.0} onPress={this.onPress}>
        {iconElement}
        {titleElement}
      </TouchableOpacity>);
    }
}
BottomNavigationTabComponent.styledComponentName = 'BottomNavigationTab';
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {},
    text: {},
});
export const BottomNavigationTab = styled(BottomNavigationTabComponent);
