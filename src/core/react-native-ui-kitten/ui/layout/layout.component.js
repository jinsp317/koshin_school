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
 * Layout container component. Behaves like React Native View.
 * The key feature of using Layout instead of View is that
 * it automatically picks background color fitting to current theme.
 *
 * @extends React.Component
 *
 * @property {string} level - Determines background color level of component.
 * Can be `level='1'`, `level='2'`, `level='3'` or `level='4'`.
 *
 * @property {React.ReactElement<any> | React.ReactElement<any>[]} children - Determines the children of the component.
 *
 * @property ViewProps
 *
 * @property StyledComponentProps
 *
 * @example Layout usage and API example
 *
 * ```
 * import React from 'react';
 * import {
 *   Layout,
 *   Text,
 * } from 'react-native-ui-kitten';
 *
 * public render(): React.ReactNode {
 *   return (
 *     <Layout>
 *       <Text>Layout</Text>
 *     </Layout>
 *   );
 * }
 * ```
 * */
export class LayoutComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.getComponentStyle = (source) => {
            return Object.assign({}, source, StyleSheet.flatten(this.props.style));
        };
    }
    render() {
        const _a = this.props, { style, themedStyle } = _a, derivedProps = __rest(_a, ["style", "themedStyle"]);
        const componentStyle = this.getComponentStyle(themedStyle);
        return (<View {...derivedProps} style={componentStyle}/>);
    }
}
LayoutComponent.styledComponentName = 'Layout';
export const Layout = styled(LayoutComponent);
