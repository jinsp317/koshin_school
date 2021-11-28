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
import { ModalService, styled, } from '../../theme';
import { PopoverView, } from './popoverView.component';
import { MeasureNode, } from './measure.component';
import { Offsets, PopoverPlacements, } from './type';
const TAG_CHILD = 0;
const TAG_CONTENT = 1;
const PLACEMENT_DEFAULT = PopoverPlacements.BOTTOM;
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
export class PopoverComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.popoverModalId = '';
        this.getComponentStyle = (source) => {
            const { style, indicatorStyle } = this.props;
            const { indicatorWidth, indicatorHeight, indicatorBackgroundColor } = source, containerParameters = __rest(source, ["indicatorWidth", "indicatorHeight", "indicatorBackgroundColor"]);
            return {
                child: {},
                popover: Object.assign({}, containerParameters, StyleSheet.flatten(style)),
                popoverIndicator: Object.assign({ width: indicatorWidth, height: indicatorHeight, backgroundColor: indicatorBackgroundColor }, StyleSheet.flatten(indicatorStyle)),
            };
        };
        this.onMeasure = (layout) => {
            const { visible } = this.props;
            if (visible) {
                this.popoverModalId = this.showPopoverModal(this.popoverElement, layout);
            }
        };
        this.showPopoverModal = (element, layout) => {
            const { placement, onRequestClose } = this.props;
            const popoverFrame = this.getPopoverFrame(layout, placement);
            const { origin: popoverPosition } = popoverFrame;
            const additionalStyle = {
                left: popoverPosition.x,
                top: popoverPosition.y,
                opacity: 1,
            };
            const popover = React.cloneElement(element, {
                style: additionalStyle,
                onRequestClose: onRequestClose,
            });
            return ModalService.show(popover, true);
        };
        this.getPopoverFrame = (layout, rawPlacement) => {
            const { children } = this.props;
            const { [TAG_CONTENT]: popoverFrame, [TAG_CHILD]: childFrame } = layout;
            const offsetRect = Offsets.find(children.props.style);
            const placement = PopoverPlacements.parse(rawPlacement, PLACEMENT_DEFAULT);
            return placement.frame(popoverFrame, childFrame, offsetRect);
        };
        this.renderPopoverElement = (children, style) => {
            const _a = this.props, { placement } = _a, derivedProps = __rest(_a, ["placement"]);
            const measuringProps = {
                tag: TAG_CONTENT,
            };
            const popoverPlacement = PopoverPlacements.parse(placement, PLACEMENT_DEFAULT);
            const indicatorPlacement = popoverPlacement.reverse();
            return (<View {...measuringProps} key={TAG_CONTENT} style={styles.popover}>
        <PopoverView {...derivedProps} style={style.popover} indicatorStyle={style.popoverIndicator} placement={indicatorPlacement.rawValue}>
          {children}
        </PopoverView>
      </View>);
        };
        this.renderChildElement = (source, style) => {
            const measuringProps = { tag: TAG_CHILD };
            return (<View {...measuringProps} key={TAG_CHILD} style={style}>
        {source}
      </View>);
        };
        this.renderMeasuringElement = (...children) => {
            return (<MeasureNode onResult={this.onMeasure}>
        {children}
      </MeasureNode>);
        };
    }
    componentDidUpdate(prevProps) {
        const { visible } = this.props;
        if (prevProps.visible !== visible) {
            if (visible) {
                // Toggles re-measuring
                this.setState({ layout: undefined });
            }
            else {
                ModalService.hide(this.popoverModalId);
            }
        }
    }
    componentWillUnmount() {
        this.popoverModalId = '';
    }
    render() {
        const { themedStyle, content, visible, children } = this.props;
        const _a = this.getComponentStyle(themedStyle), { child } = _a, popoverStyles = __rest(_a, ["child"]);
        if (visible) {
            this.popoverElement = this.renderPopoverElement(content, popoverStyles);
            const childElement = this.renderChildElement(children, child);
            return this.renderMeasuringElement(childElement, this.popoverElement);
        }
        return children;
    }
}
PopoverComponent.styledComponentName = 'Popover';
PopoverComponent.defaultProps = {
    placement: PLACEMENT_DEFAULT.rawValue,
    visible: false,
};
const styles = StyleSheet.create({
    popover: {
        position: 'absolute',
        opacity: 0,
    },
});
export const Popover = styled(PopoverComponent);
