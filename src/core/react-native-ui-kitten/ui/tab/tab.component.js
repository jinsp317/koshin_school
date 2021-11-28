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
 * Tab component is a part of TabBar or TabView component.
 * TabView Tabs should be wrapped in TabBar or TabView to provide usable component.
 * See usage examples at TabView component documentation.
 *
 * @extends React.Component
 *
 * @property {string} title - Determines the title of the component.
 *
 * @property {StyleProp<TextStyle>} titleStyle - Determines style of the title.
 *
 * @property {React.ReactElement<any>} children - Determines content of the tab.
 *
 * @property {(style: StyleType) => React.ReactElement<ImageProps>} icon - Determines icon of the component.
 *
 * @property {boolean} selected - Determines tab selection state.
 *
 * @property {(selected: boolean) => void} onSelect = Fires on onSelect event.
 *
 * @property TouchableOpacityProps
 *
 * @property StyledComponentProps
 */
export class TabComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onPress = () => {
            if (this.props.onSelect) {
                this.props.onSelect(!this.props.selected);
            }
        };
        this.getComponentStyle = (source) => {
            const { style, titleStyle } = this.props;
            const { textMarginVertical, textFontSize, textLineHeight, textFontWeight, textColor, iconWidth, iconHeight, iconMarginVertical, iconTintColor } = source, containerParameters = __rest(source, ["textMarginVertical", "textFontSize", "textLineHeight", "textFontWeight", "textColor", "iconWidth", "iconHeight", "iconMarginVertical", "iconTintColor"]);
            return {
                container: Object.assign({}, containerParameters, styles.container, StyleSheet.flatten(style)),
                icon: Object.assign({ width: iconWidth, height: iconHeight, marginVertical: iconMarginVertical, tintColor: iconTintColor }, styles.icon),
                title: Object.assign({ marginVertical: textMarginVertical, fontSize: textFontSize, lineHeight: textLineHeight, fontWeight: textFontWeight, color: textColor }, styles.title, StyleSheet.flatten(titleStyle)),
            };
        };
        this.renderTitleElement = (style) => {
            const { title: text } = this.props;
            return (<Text key={1} style={style}>
        {text}
      </Text>);
        };
        this.renderIconElement = (style) => {
            const { icon } = this.props;
            const iconElement = icon(style);
            return React.cloneElement(iconElement, {
                key: 2,
                style: [style, iconElement.props.style],
            });
        };
        this.renderComponentChildren = (style) => {
            const { title, icon } = this.props;
            return [
                icon && this.renderIconElement(style.icon),
                isValidString(title) && this.renderTitleElement(style.title),
            ];
        };
    }
    render() {
        const _a = this.props, { themedStyle } = _a, derivedProps = __rest(_a, ["themedStyle"]);
        const _b = this.getComponentStyle(themedStyle), { container } = _b, componentStyles = __rest(_b, ["container"]);
        const [iconElement, titleElement] = this.renderComponentChildren(componentStyles);
        return (<TouchableOpacity activeOpacity={1.0} {...derivedProps} style={container} onPress={this.onPress}>
        {iconElement}
        {titleElement}
      </TouchableOpacity>);
    }
}
TabComponent.styledComponentName = 'Tab';
TabComponent.defaultProps = {
    selected: false,
};
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {},
    title: {},
});
export const Tab = styled(TabComponent);
