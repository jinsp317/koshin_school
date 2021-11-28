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
/**
 * Renders a group of radio buttons.
 *
 * @extends React.Component
 *
 * @property {React.ReactElement<RadioProps> | React.ReactElement<RadioProps>[]} children -
 * Determines radio buttons in group.
 *
 * @property {number} selectedIndex - Determines the index of selected button
 *
 * @property {(index: number) => void} onChange - Fires when selected radio is changed.
 *
 * @property ViewProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import { Radio, RadioGroup } from 'react-native-ui-kitten';
 *
 * export class RadioGroupShowcase extends React.Component {
 *
 *   public state = {
 *     selectedIndex: 0,
 *   };
 *
 *   private onGroupSelectionChange = (selectedIndex: number) => {
 *     this.setState({ selectedIndex });
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <RadioGroup
 *         selectedIndex={this.state.selectedIndex}
 *         onChange={this.onGroupSelectionChange}>
 *         <Radio />
 *         <Radio />
 *         <Radio />
 *       </RadioGroup>
 *     );
 *   }
 * }
 * ```
 */
class RadioGroupComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onRadioChange = (index) => {
            if (this.props.onChange) {
                this.props.onChange(index);
            }
        };
        this.getComponentStyle = (source) => {
            const { style } = this.props;
            return Object.assign({}, source, StyleSheet.flatten(style));
        };
        this.renderRadioElement = (element, index) => {
            return React.cloneElement(element, {
                key: index,
                checked: this.props.selectedIndex === index,
                onChange: () => this.onRadioChange(index),
            });
        };
        this.renderRadioElements = (source) => {
            return React.Children.map(source, this.renderRadioElement);
        };
    }
    render() {
        const _a = this.props, { style, themedStyle, children } = _a, derivedProps = __rest(_a, ["style", "themedStyle", "children"]);
        const componentStyle = this.getComponentStyle(themedStyle);
        const radioElements = this.renderRadioElements(children);
        return (<View {...derivedProps} style={componentStyle}>
        {radioElements}
      </View>);
    }
}
RadioGroupComponent.styledComponentName = 'RadioGroup';
RadioGroupComponent.defaultProps = {
    selectedIndex: -1,
};
export const RadioGroup = styled(RadioGroupComponent);
