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
/**
 * The `TopNavigationAction` component is a part of the TopNavigation component.
 * Top Navigation Actions should be used in TopNavigation to provide usable component.
 * See usage examples at TopNavigation component documentation.
 *
 * @extends React.Component
 *
 * @property {(style: StyleType) => React.ReactElement<ImageProps>} icon - Determines the icon of the tab.
 *
 * @property TouchableOpacityProps
 *
 * @property StyledComponentProps
 */
class TopNavigationActionComponent extends React.Component {
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
            const { iconTintColor, iconWidth, iconHeight, iconMarginHorizontal, } = source;
            return {
                container: Object.assign({ marginHorizontal: iconMarginHorizontal }, styles.container, StyleSheet.flatten(this.props.style)),
                icon: Object.assign({ tintColor: iconTintColor, width: iconWidth, height: iconHeight }, styles.icon),
            };
        };
        this.renderIconElement = (style) => {
            return this.props.icon(style);
        };
    }
    render() {
        const _a = this.props, { themedStyle, icon } = _a, touchableProps = __rest(_a, ["themedStyle", "icon"]);
        const componentStyle = this.getComponentStyle(themedStyle);
        return (<TouchableOpacity activeOpacity={1.0} {...touchableProps} style={componentStyle.container} onPress={this.onPress} onPressIn={this.onPressIn} onPressOut={this.onPressOut}>
        {this.renderIconElement(componentStyle.icon)}
      </TouchableOpacity>);
    }
}
TopNavigationActionComponent.styledComponentName = 'TopNavigationAction';
const styles = StyleSheet.create({
    container: {},
    icon: {},
});
export const TopNavigationAction = styled(TopNavigationActionComponent);
