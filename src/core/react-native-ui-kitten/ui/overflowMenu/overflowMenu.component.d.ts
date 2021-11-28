/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { GestureResponderEvent } from 'react-native';
import { ModalComponentCloseProps, StyledComponentProps } from '../../theme';
import { OverflowMenuItemProps } from './overflowMenuItem.component';
import { PopoverProps } from '../popover/popover.component';
import { Omit } from '../support/typings';
declare type PopoverContentProps = Omit<PopoverProps, 'content'>;
interface ComponentProps extends PopoverContentProps, ModalComponentCloseProps {
    children: React.ReactElement<any>;
    items: OverflowMenuItemProps[];
    onSelect?: (index: number, event: GestureResponderEvent) => void;
}
export declare type OverflowMenuProps = StyledComponentProps & ComponentProps;
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
export declare class OverflowMenuComponent extends React.Component<OverflowMenuProps> {
    static styledComponentName: string;
    static defaultProps: Partial<OverflowMenuProps>;
    private onItemSelect;
    private getComponentStyle;
    private isLastItem;
    private renderItemElement;
    private renderContentElementChildren;
    private renderPopoverContentElement;
    render(): React.ReactNode;
}
export declare const OverflowMenu: React.ComponentClass<OverflowMenuProps, any>;
export {};
