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
import { Image, StyleSheet, } from 'react-native';
import { styled, } from '../../theme';
/**
 * Styled Image component.
 *
 * @extends React.Component
 *
 * @property {string} shape - Determines the shape of the component.
 * Can be `round`, `rounded` or `square`.
 * Default is `round`.
 *
 * @property {string} size - Determines the size of the component.
 * Can be `giant`, `large`, `medium`, `small`, or `tiny`.
 * Default is `medium`.
 *
 * @property ImageProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import { Avatar, AvatarProps } from 'react-native-ui-kitten';
 *
 * export const AvatarShowcase = (props?: AvatarProps): React.ReactElement<AvatarProps> => {
 *   return (
 *     <Avatar source={{uri: 'https://path-to/awesome-image.png'}} />
 *   );
 * };
 * ```
 */
export class AvatarComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.getComponentStyle = (source) => {
            const { roundCoefficient } = source, containerParameters = __rest(source, ["roundCoefficient"]);
            const baseStyle = Object.assign({}, containerParameters, styles.container, StyleSheet.flatten(this.props.style));
            // @ts-ignore: rhs operator is restricted to be number
            const borderRadius = roundCoefficient * baseStyle.height;
            return Object.assign({ borderRadius }, baseStyle);
        };
    }
    render() {
        const _a = this.props, { themedStyle } = _a, derivedProps = __rest(_a, ["themedStyle"]);
        const componentStyle = this.getComponentStyle(themedStyle);
        return (<Image {...derivedProps} style={componentStyle}/>);
    }
}
AvatarComponent.styledComponentName = 'Avatar';
const styles = StyleSheet.create({
    container: {},
});
export const Avatar = styled(AvatarComponent);
