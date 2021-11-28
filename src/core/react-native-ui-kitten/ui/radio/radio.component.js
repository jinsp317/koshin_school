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
import { isValidString } from '../support/services';
/**
 * Styled Radio component.
 *
 * @extends React.Component
 *
 * @property {boolean} checked - Determines whether component is checked.
 * Default is `false`.
 *
 * @property {boolean} disabled - Determines whether component is disabled.
 * Default is `false`.
 *
 * @property {string} status - Determines the status of the component.
 * Can be `primary`, `success`, `info`, `warning` or `danger`.
 *
 * @property {string} text - Determines text of the component.
 *
 * @property {StyleProp<TextStyle>} textStyle - Customizes text style.
 *
 * @property {(selected: boolean) => void} onChange - Triggered on onChange value.
 *
 * @property TouchableOpacityProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import { Radio } from 'react-native-ui-kitten';
 *
 * export class RadioShowcase extends React.Component {
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
 *       <Radio
 *         checked={this.state.checked}
 *         onChange={this.onChange}
 *       />
 *     )
 *   }
 * }
 * ```
 *
 * @example Inline styling example
 *
 * ```
 * import React from 'react';
 * import { Radio, RadioProps } from 'react-native-ui-kitten';
 *
 * export const RadioShowcase = (props?: RadioProps): React.ReactElement<RadioProps> => {
 *   return (
 *     <Radio
 *       style={styles.radio}
 *       textStyle={styles.radioText}
 *       text='Place your text'
 *       checked={true}
 *     />
 *   );
 * };
 * ```
 */
export class RadioComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onPress = () => {
            if (this.props.onChange) {
                this.props.onChange(!this.props.checked);
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
            const { textMarginHorizontal, textFontSize, textFontWeight, textLineHeight, textColor, iconWidth, iconHeight, iconBorderRadius, iconTintColor, outlineWidth, outlineHeight, outlineBorderRadius, outlineBackgroundColor } = source, containerParameters = __rest(source, ["textMarginHorizontal", "textFontSize", "textFontWeight", "textLineHeight", "textColor", "iconWidth", "iconHeight", "iconBorderRadius", "iconTintColor", "outlineWidth", "outlineHeight", "outlineBorderRadius", "outlineBackgroundColor"]);
            const hitSlop = 40 - containerParameters.width;
            return {
                container: Object.assign({}, styles.container, StyleSheet.flatten(style)),
                highlightContainer: styles.highlightContainer,
                selectContainer: Object.assign({}, containerParameters, styles.iconContainer),
                text: Object.assign({ marginHorizontal: textMarginHorizontal, fontSize: textFontSize, lineHeight: textLineHeight, fontWeight: textFontWeight, color: textColor }, styles.text, StyleSheet.flatten(textStyle)),
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
            return (<Text key={0} style={style}>
        {this.props.text}
      </Text>);
        };
        this.renderComponentChildren = (style) => {
            const { text } = this.props;
            return [
                isValidString(text) && this.renderTextElement(style.text),
            ];
        };
    }
    render() {
        const _a = this.props, { style, themedStyle, disabled } = _a, derivedProps = __rest(_a, ["style", "themedStyle", "disabled"]);
        const _b = this.getComponentStyle(themedStyle), { container, highlightContainer, selectContainer, icon, highlight, hitSlop } = _b, componentStyles = __rest(_b, ["container", "highlightContainer", "selectContainer", "icon", "highlight", "hitSlop"]);
        const [textElement] = this.renderComponentChildren(componentStyles);
        return (<TouchableOpacity style={container} activeOpacity={1.0} disabled={disabled} hitSlop={hitSlop} onPress={this.onPress} onPressIn={this.onPressIn} onPressOut={this.onPressOut}>
        <View style={highlightContainer}>
          <View style={highlight}/>
          <TouchableOpacity activeOpacity={1.0} {...derivedProps} disabled={disabled} style={selectContainer} onPress={this.onPress} onPressIn={this.onPressIn} onPressOut={this.onPressOut}>
            <View style={icon}/>
          </TouchableOpacity>
        </View>
        {textElement}
      </TouchableOpacity>);
    }
}
RadioComponent.styledComponentName = 'Radio';
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    highlightContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {},
    highlight: {
        position: 'absolute',
    },
    text: {},
});
export const Radio = styled(RadioComponent);
