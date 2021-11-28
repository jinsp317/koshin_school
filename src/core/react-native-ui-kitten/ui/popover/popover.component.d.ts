/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ViewProps } from 'react-native';
import { ModalComponentCloseProps, StyledComponentProps } from '../../theme';
import { PopoverViewProps } from './popoverView.component';
import { MeasuringNode } from './measure.component';
declare type ContentElement = React.ReactElement<any>;
declare type ChildElement = React.ReactElement<any>;
interface ComponentProps extends PopoverViewProps, ModalComponentCloseProps {
    content: ContentElement;
    children: ChildElement;
    visible?: boolean;
}
export declare type PopoverProps = StyledComponentProps & ViewProps & ComponentProps;
/**
 * Displays content in a modal when users focus on or tap an element.
 *
 * @extends React.Component
 *
 * @property {React.ReactElement<any>} content - Determines the content of the popover.
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
 * @example Popover usage example
 *
 * ```
 * import React from 'react';
 * import {
 *  View,
 *  ViewProps,
 * } from 'react-native';
 * import {
 *   Popover,
 *   Button,
 *   Text,
 * } from 'react-native-ui-kitten';
 *
 * export class PopoverShowcase extends React.Component {
 *   public state: State = {
 *     popoverVisible: false,
 *   };
 *
 *   private togglePopover = () => {
 *     this.setState({ popoverVisible: !this.state.popoverVisible });
 *   };
 *
 *   private renderPopoverContentElement = (): React.ReactElement<ViewProps> => {
 *     return (
 *       <View style={styles.popoverContent}>
 *         <Text>Hi! This is popover.</Text>
 *       </View>
 *     );
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <Popover
 *         visible={this.state.popoverVisible}
 *         content={this.renderPopoverContentElement()}
 *         onRequestClose={this.togglePopover}>
 *         <Button onPress={this.togglePopover}>
 *           TOGGLE POPOVER
 *         </Button>
 *       </Popover>
 *     );
 *   }
 * }
 * ```
 */
export declare class PopoverComponent extends React.Component<PopoverProps> {
    static styledComponentName: string;
    static defaultProps: Partial<PopoverProps>;
    private popoverElement;
    private popoverModalId;
    componentDidUpdate(prevProps: PopoverProps): void;
    componentWillUnmount(): void;
    private getComponentStyle;
    private onMeasure;
    private showPopoverModal;
    private getPopoverFrame;
    private renderPopoverElement;
    private renderChildElement;
    private renderMeasuringElement;
    render(): MeasuringNode | React.ReactNode;
}
export declare const Popover: React.ComponentClass<PopoverProps, any>;
export {};
