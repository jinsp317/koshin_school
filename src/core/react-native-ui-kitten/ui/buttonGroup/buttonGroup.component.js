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
import { Button, } from '../button/button.component';
/**
 * Renders a group of buttons.
 *
 * @extends React.Component
 *
 * @property {string} status - Determines the status of the component.
 * Can be `primary`, `success`, `info`, `warning`, `danger` or `white`.
 *
 * @property {string} size - Determines the size of the component.
 * Can be `giant`, `large`, `medium`, `small`, or `tiny`.
 * Default is `medium`.
 *
 * @property {React.ReactElement<ButtonProps>[]} children - Determines buttons in group.
 *
 * @property {string} appearance - Determines the appearance of the component.
 * Can be `filled` or `outline`.
 * Default is `filled`.
 *
 * @property ViewProps
 *
 * @property StyledComponentProps
 *
 * @example ButtonGroup usage example
 *
 * ```
 * import React from 'react';
 * import { Button, ButtonGroup, ButtonGroupProps } from 'react-native-ui-kitten';
 *
 * export const ButtonGroupShowcase = (props?: ButtonGroupProps): React.ReactElement<ButtonGroupProps> => {
 *   return (
 *     <ButtonGroup>
 *       <Button>Left</Button>
 *       <Button>Mid</Button>
 *       <Button>Right</Button>
 *     </ButtonGroup>
 *   );
 * };
 * ```
 */
class ButtonGroupComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.getComponentStyle = (source) => {
            const { style } = this.props;
            const { dividerBackgroundColor, dividerWidth } = source, containerParameters = __rest(source, ["dividerBackgroundColor", "dividerWidth"]);
            return {
                container: Object.assign({}, containerParameters, styles.container, StyleSheet.flatten(style)),
                button: Object.assign({ borderEndColor: dividerBackgroundColor, borderEndWidth: dividerWidth }, styles.button),
            };
        };
        this.isLastElement = (index) => {
            const { children } = this.props;
            return index === React.Children.count(children) - 1;
        };
        this.renderButtonElement = (element, index, style) => {
            const { appearance, size, status } = this.props;
            const additionalStyle = this.isLastElement(index) ? styles.lastButton : style;
            return React.cloneElement(element, {
                key: index,
                appearance: appearance,
                size: size,
                status: status,
                style: [element.props.style, additionalStyle],
            });
        };
        this.renderButtonElements = (source, style) => {
            return React.Children.map(source, (element, index) => {
                return this.renderButtonElement(element, index, style.button);
            });
        };
    }
    render() {
        const _a = this.props, { style, themedStyle, children } = _a, derivedProps = __rest(_a, ["style", "themedStyle", "children"]);
        const _b = this.getComponentStyle(themedStyle), { container } = _b, componentStyles = __rest(_b, ["container"]);
        const buttonElements = this.renderButtonElements(children, componentStyles);
        return (<View {...derivedProps} style={container}>
        {buttonElements}
      </View>);
    }
}
ButtonGroupComponent.styledComponentName = 'ButtonGroup';
ButtonGroupComponent.Button = Button;
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        overflow: 'hidden',
    },
    button: {
        borderRadius: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomWidth: 0,
    },
    lastButton: {
        borderWidth: 0,
        borderRadius: 0,
    },
});
export const ButtonGroup = styled(ButtonGroupComponent);
