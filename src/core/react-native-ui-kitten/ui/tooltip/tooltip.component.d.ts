/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ImageProps, StyleProp, TextStyle } from 'react-native';
import { ModalComponentCloseProps, StyledComponentProps, StyleType } from '../../theme';
import { PopoverProps } from '../popover/popover.component';
import { Omit } from '../support/typings';
declare type IconElement = React.ReactElement<ImageProps>;
declare type IconProp = (style: StyleType) => IconElement;
declare type WrappingElement = React.ReactElement<any>;
declare type PopoverContentProps = Omit<PopoverProps, 'content'>;
interface ComponentProps extends PopoverContentProps, ModalComponentCloseProps {
    text: string;
    textStyle?: StyleProp<TextStyle>;
    icon?: IconProp;
    children: WrappingElement;
}
export declare type TooltipProps = StyledComponentProps & ComponentProps;
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
export declare class TooltipComponent extends React.Component<TooltipProps> {
    static styledComponentName: string;
    static defaultProps: Partial<TooltipProps>;
    private getComponentStyle;
    private renderTextElement;
    private renderIconElement;
    private renderContentElementChildren;
    private renderPopoverContentElement;
    render(): React.ReactElement<PopoverProps>;
}
export declare const Tooltip: React.ComponentClass<TooltipProps, any>;
export {};
