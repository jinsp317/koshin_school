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
import { StyleSheet, Text as RNText, } from 'react-native';
import { styled, } from '../../theme';
/**
 * Styled Text component.
 *
 * @extends React.Component
 *
 * @property {string} status - Determines the status of the component.
 * Can be `primary`, `success`, `info`, `warning` or `danger`.
 *
 * @property {string} children - Determines text of the component.
 *
 * @property {string} category - Determines the category of the component.
 * Can be `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `s1`, `s2`, `p1`, `p2`, `c1`, `c2`, `label`.
 * Default is `p1`.
 *
 * @property {string} appearance - Determines the appearance of the component.
 * Can be `default`, `alternative`, `hint`.
 * Default is `default`.
 *
 * @property TextComponentProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import { Text, TextProps } from 'react-native-ui-kitten';
 *
 * export const TextShowcase = (props?: TextProps): React.ReactElement<TextProps> => {
 *   return (
 *     <Text>
 *       Sample Text
 *     </Text>
 *   );
 * };
 * ```
 */
export class TextComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.getComponentStyle = (source) => {
            const { style } = this.props;
            return Object.assign({ fontSize: source.fontSize, lineHeight: source.lineHeight, fontWeight: source.fontWeight, color: source.color }, StyleSheet.flatten(style));
        };
    }
    render() {
        const _a = this.props, { themedStyle } = _a, derivedProps = __rest(_a, ["themedStyle"]);
        const componentStyle = this.getComponentStyle(themedStyle);
        return (<RNText {...derivedProps} style={componentStyle}/>);
    }
}
TextComponent.styledComponentName = 'Text';
export const Text = styled(TextComponent);
