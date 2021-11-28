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
import { OverflowMenuItem, } from './overflowMenuItem.component';
import { Popover, } from '../popover/popover.component';
/**
 * Renders vertical list of menu items in a modal.
 *
 * @extends React.Component
 *
 * @property {React.ReactElement<any>} children - Determines the element above
 * which the menu will be rendered.
 *
 * @property {OverflowMenuItemType[]} items - Determines menu items.
 *
 * @property {string} size - Determines the size of the menu items components.
 * Can be `small`, `medium` or `large`.
 * Default is `medium`.
 *
 * @property {(event: GestureResponderEvent, index: number) => void} onSelect - Fires when selected item is changed.
 *
 * @property {Omit<PopoverProps, 'content'>}
 *
 * @property StyledComponentProps
 *
 * @example OverflowMenu usage example
 *
 * ```
 * import React from 'react';
 * import {
 *   OverflowMenu,
 *   Button,
 * } from 'react-native-ui-kitten';
 *
 * export class OverflowMenuShowcase extends React.Component {
 *
 *   private items: OverflowMenuItemType[] = [
 *     { text: 'Menu Item 1' },
 *     { text: 'Menu Item 2' },
 *     { text: 'Menu Item 3' },
 *   ];
 *
 *   public state = {
 *     menuVisible: false,
 *   };
 *
 *   private onItemSelect = (index: number) => {
 *     // Handle Menu Item selection
 *   };
 *
 *   private toggleMenu = () => {
 *     this.setState({ menuVisible: !this.state.menuVisible });
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <OverflowMenu
 *         items={this.items}
 *         visible={this.state.menuVisible}
 *         onSelect={this.onItemSelect}
 *         onRequestClose={this.toggleMenu}>
 *         <Button onPress={this.toggleMenu}>
 *           TOGGLE MENU
 *         </Button>
 *       </OverflowMenu>
 *     );
 *   }
 * }
 * ```
 */
export class OverflowMenuComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onItemSelect = (index, event) => {
            if (this.props.onSelect) {
                this.props.onSelect(index, event);
            }
        };
        this.getComponentStyle = (source) => {
            const { style, indicatorStyle } = this.props;
            const { dividerHeight, dividerBackgroundColor, indicatorBackgroundColor } = source, containerParameters = __rest(source, ["dividerHeight", "dividerBackgroundColor", "indicatorBackgroundColor"]);
            return {
                popover: Object.assign({}, containerParameters, styles.popover, StyleSheet.flatten(style)),
                divider: {
                    height: dividerHeight,
                    backgroundColor: dividerBackgroundColor,
                },
                indicator: Object.assign({ backgroundColor: indicatorBackgroundColor }, StyleSheet.flatten(indicatorStyle)),
                item: styles.item,
            };
        };
        this.isLastItem = (index) => {
            return index === this.props.items.length - 1;
        };
        this.renderItemElement = (item, index, style) => {
            return (<OverflowMenuItem key={index} style={style} {...item} index={index} onPress={this.onItemSelect}/>);
        };
        this.renderContentElementChildren = (style) => {
            return this.props.items.map((item, index) => {
                const itemElement = this.renderItemElement(item, index, style.item);
                const isLastItem = this.isLastItem(index);
                const borderStyle = {
                    borderBottomColor: style.divider.backgroundColor,
                    borderBottomWidth: isLastItem ? 0 : style.divider.height,
                };
                return React.cloneElement(itemElement, {
                    style: [itemElement.props.style, borderStyle],
                });
            });
        };
        this.renderPopoverContentElement = (style) => {
            const menuItems = this.renderContentElementChildren(style);
            return (<View style={this.props.style}>
        {menuItems}
      </View>);
        };
    }
    render() {
        const _a = this.props, { style, themedStyle, children } = _a, restProps = __rest(_a, ["style", "themedStyle", "children"]);
        const _b = this.getComponentStyle(themedStyle), { popover, indicator } = _b, componentStyle = __rest(_b, ["popover", "indicator"]);
        const contentElement = this.renderPopoverContentElement(componentStyle);
        return (<Popover {...restProps} style={popover} indicatorStyle={indicator} content={contentElement}>
        {children}
      </Popover>);
    }
}
OverflowMenuComponent.styledComponentName = 'OverflowMenu';
OverflowMenuComponent.defaultProps = {
    indicatorOffset: 12,
};
const styles = StyleSheet.create({
    popover: {
        overflow: 'hidden',
    },
    item: {},
});
export const OverflowMenu = styled(OverflowMenuComponent);
