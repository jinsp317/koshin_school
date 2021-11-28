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
import { StyleSheet, TouchableOpacity, View, } from 'react-native';
import { Interaction, styled, } from '../../theme';
import { Text, } from '../text/text.component';
import { CheckMark } from '../support/components';
import { isValidString } from '../support/services';
/**
 * Styled CheckBox component.
 *
 * @extends React.Component
 *
 * @property {boolean} checked - Determines whether component is checked.`
 * Default is `false`.
 *
 * @property {boolean} disabled - Determines whether component is disabled.
 * Default is `false.
 *
 * @property {string} status - Determines the status of the component.
 * Can be `primary`, `success`, `info`, `warning` or `danger`.
 *
 * @property {string} text - Determines text of the component.
 *
 * @property {StyleProp<TextStyle>} textStyle - Customizes text style.
 *
 * @property {(checked: boolean) => void} onChange - Fires on checkbox value change.
 *
 * @property TouchableOpacityProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import { Checkbox } from 'react-native-ui-kitten';
 *
 * export class CheckBoxShowcase extends React.Component {
 *
 *   public state = {
 *     checked: false,
 *   };
 *
 *   private onChange = (checked: boolean) => {
 *     this.setState({ checked });
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <Checkbox
 *         checked={this.state.checked}
 *         onChange={this.onChange}
 *       />
 *     );
 *   }
 * }
 * ```
 *
 * @example Inline styling example
 *
 * ```
 * import React from 'react';
 * import { CheckBox, CheckBoxProps } from 'react-native-ui-kitten';
 *
 * export const CheckBoxShowcase = (props?: CheckBoxProps): React.ReactElement<CheckBoxProps> => {
 *   return (
 *     <Checkbox
 *       style={styles.checkbox}
 *       textStyle={styles.checkboxText}
 *       text='Place your text'
 *       checked={this.state.checked}
 *     />
 *   );
 * };
 * ```
 * */
class CheckBoxComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onPress = () => {
            this.props.dispatch([]);
            if (this.props.onChange) {
                this.props.onChange(!this.props.checked, false);
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
            const { style, textStyle } = this.props;
            const { textMarginHorizontal, textColor, textFontSize, textFontWeight, textLineHeight, iconWidth, iconHeight, iconBorderRadius, iconTintColor, outlineWidth, outlineHeight, outlineBorderRadius, outlineBackgroundColor } = source, containerParameters = __rest(source, ["textMarginHorizontal", "textColor", "textFontSize", "textFontWeight", "textLineHeight", "iconWidth", "iconHeight", "iconBorderRadius", "iconTintColor", "outlineWidth", "outlineHeight", "outlineBorderRadius", "outlineBackgroundColor"]);
            const hitSlop = 40 - containerParameters.width;
            return {
                container: Object.assign({}, StyleSheet.flatten(style), styles.container),
                highlightContainer: styles.highlightContainer,
                selectContainer: Object.assign({}, containerParameters, styles.selectContainer),
                text: Object.assign({ marginHorizontal: textMarginHorizontal, color: textColor, fontSize: textFontSize, fontWeight: textFontWeight, lineHeight: textLineHeight }, styles.text, StyleSheet.flatten(textStyle)),
                icon: {
                    width: iconWidth,
                    height: iconHeight,
                    borderRadius: iconBorderRadius,
                    backgroundColor: iconTintColor,
                },
                highlight: Object.assign({ width: outlineWidth, height: outlineHeight, borderRadius: outlineBorderRadius, backgroundColor: outlineBackgroundColor }, styles.highlight),
                hitSlop: {
                    top: hitSlop,
                    left: hitSlop,
                    bottom: hitSlop,
                    right: hitSlop,
                },
            };
        };
        this.renderTextElement = (style) => {
            const { text } = this.props;
            return (<Text style={style}>{text}</Text>);
        };
        this.renderSelectIconElement = (style) => {
            return (<CheckMark style={[style, styles.selectIcon]}/>);
        };
        this.renderIndeterminateIconElement = (style) => {
            return (<View style={[style, styles.indeterminateIcon]}/>);
        };
        this.renderIconElement = (style) => {
            if (this.props.indeterminate) {
                return this.renderIndeterminateIconElement(style);
            }
            else {
                return this.renderSelectIconElement(style);
            }
        };
        this.renderComponentChildren = (style) => {
            const { text } = this.props;
            return [
                this.renderIconElement(style.icon),
                isValidString(text) && this.renderTextElement(style.text),
            ];
        };
    }
    render() {
        const _a = this.props, { style, themedStyle, disabled, text } = _a, derivedProps = __rest(_a, ["style", "themedStyle", "disabled", "text"]);
        const _b = this.getComponentStyle(themedStyle), { container, highlightContainer, highlight, selectContainer, hitSlop } = _b, componentStyle = __rest(_b, ["container", "highlightContainer", "highlight", "selectContainer", "hitSlop"]);
        const [iconElement, textElement] = this.renderComponentChildren(componentStyle);
        return (<TouchableOpacity style={container} activeOpacity={1.0} disabled={disabled} hitSlop={hitSlop} onPress={this.onPress} onPressIn={this.onPressIn} onPressOut={this.onPressOut}>
        <View style={highlightContainer}>
          <View style={highlight}/>
          <TouchableOpacity activeOpacity={1.0} {...derivedProps} disabled={disabled} style={selectContainer} onPress={this.onPress} onPressIn={this.onPressIn} onPressOut={this.onPressOut}>
            {iconElement}
          </TouchableOpacity>
        </View>
        {textElement}
      </TouchableOpacity>);
    }
}
CheckBoxComponent.styledComponentName = 'CheckBox';
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    highlightContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectIcon: {},
    indeterminateIcon: {
        borderRadius: 6,
    },
    highlight: {
        position: 'absolute',
    },
    text: {},
});
export const CheckBox = styled(CheckBoxComponent);
