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
import { StyleSheet, View, } from 'react-native';
import { styled, } from '../../theme';
import { Text, } from '../text/text.component';
import { Popover, } from '../popover/popover.component';
/**
 * Displays informative text when users focus on or tap an element.
 *
 * @extends React.Component
 *
 * @property {string} text - Determines the text of the tooltip
 *
 * @property {StyleProp<TextStyle>} textStyle - Customizes text style.
 *
 * @property {(style: StyleType) => React.ReactElement<ImageProps>} icon - Determines icon of the component.
 *
 * @property {React.ReactElement<any>} children - Determines the element "above" which popover will be shown.
 *
 * @property {boolean} visible - Determines whether popover is visible or not.
 *
 * @property {string | PopoverPlacement} placement - Determines the placement of the popover.
 * Can be `left`, `top`, `right`, `bottom`, `left start`, `left end`, `top start`, `top end`, `right start`,
 * `right end`, `bottom start` or `bottom end`.
 * Default is `bottom`.
 *
 * @property {number} indicatorOffset - Determines the offset of indicator (arrow).
 * @property {StyleProp<ViewStyle>} indicatorStyle - Determines style of indicator (arrow).
 *
 * @property ViewProps
 *
 * @property ModalComponentCloseProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import {
 *   Tooltip,
 *   Button,
 * } from 'react-native-ui-kitten';
 *
 * export class TooltipShowcase extends React.Component {
 *
 *   public state = {
 *     tooltipVisible: false,
 *   };
 *
 *   private toggleTooltip = () => {
 *     this.setState({ tooltipVisible: !this.state.tooltipVisible });
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <Tooltip
 *         visible={this.state.tooltipVisible}
 *         text='Tooltip Text'
 *         onRequestClose={this.toggleTooltip}>
 *         <Button onPress={this.toggleTooltip}>
 *           TOGGLE TOOLTIP
 *         </Button>
 *       </Tooltip>
 *     );
 *   }
 * }
 * ```
 */
export class TooltipComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.getComponentStyle = (source) => {
            const { style, indicatorStyle, textStyle } = this.props;
            const { indicatorBackgroundColor, iconWidth, iconHeight, iconMarginHorizontal, iconTintColor, textMarginHorizontal, textFontSize, textLineHeight, textColor } = source, containerParameters = __rest(source, ["indicatorBackgroundColor", "iconWidth", "iconHeight", "iconMarginHorizontal", "iconTintColor", "textMarginHorizontal", "textFontSize", "textLineHeight", "textColor"]);
            return {
                popover: Object.assign({}, containerParameters, styles.popover, StyleSheet.flatten(style)),
                content: styles.content,
                indicator: Object.assign({ backgroundColor: indicatorBackgroundColor }, StyleSheet.flatten(indicatorStyle)),
                icon: Object.assign({ width: iconWidth, height: iconHeight, marginHorizontal: iconMarginHorizontal, tintColor: iconTintColor }, styles.icon),
                text: Object.assign({ marginHorizontal: textMarginHorizontal, fontSize: textFontSize, lineHeight: textLineHeight, color: textColor }, styles.text, StyleSheet.flatten(textStyle)),
            };
        };
        this.renderTextElement = (style) => {
            return (<Text key={1} style={style}>
        {this.props.text}
      </Text>);
        };
        this.renderIconElement = (style) => {
            const iconElement = this.props.icon(style);
            return React.cloneElement(iconElement, {
                key: 0,
                style: [style, iconElement.props.style],
            });
        };
        this.renderContentElementChildren = (style) => {
            const { icon } = this.props;
            return [
                icon && this.renderIconElement(style.icon),
                this.renderTextElement(style.text),
            ];
        };
        this.renderPopoverContentElement = (style) => {
            const { content } = style, childrenStyle = __rest(style, ["content"]);
            const contentChildren = this.renderContentElementChildren(childrenStyle);
            return (<View style={content}>
        {contentChildren}
      </View>);
        };
    }
    render() {
        const _a = this.props, { style, themedStyle, indicatorStyle, children } = _a, derivedProps = __rest(_a, ["style", "themedStyle", "indicatorStyle", "children"]);
        const _b = this.getComponentStyle(themedStyle), { popover, indicator } = _b, componentStyle = __rest(_b, ["popover", "indicator"]);
        const contentElement = this.renderPopoverContentElement(componentStyle);
        return (<Popover {...derivedProps} style={popover} indicatorStyle={indicator} content={contentElement}>
        {children}
      </Popover>);
    }
}
TooltipComponent.styledComponentName = 'Tooltip';
TooltipComponent.defaultProps = {
    indicatorOffset: 8,
};
const styles = StyleSheet.create({
    popover: {},
    content: {
        flexDirection: 'row',
    },
    icon: {},
    text: {
        alignSelf: 'center',
    },
});
export const Tooltip = styled(TooltipComponent);
