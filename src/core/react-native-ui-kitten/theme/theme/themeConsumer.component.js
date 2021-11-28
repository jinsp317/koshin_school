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
import hoistNonReactStatics from 'hoist-non-react-statics';
import { ThemeContext } from './themeContext';
import { createThemedStyle } from '../style/style.service';
/**
 * High Order Function which is used to create themed style for non-styled component.
 * Basically used when need to use theme variable somewhere.
 * Returns component class which can be used as themed component.
 *
 * @property {ThemeType} theme - Determines theme used to style component.
 *
 * @property {StyleType} themedStyle - Determines component style for it's current state.
 *
 * @param Component - Type: {React.ComponentClass}. Determines class of component to be themed.
 *
 * @param createStyles - Type: {(theme: ThemeType) => any}. Determines arrow function used to create styles.
 *
 * @example Declaring Themed Component
 *
 * ```
 * import React from 'react';
 * import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
 * import { withStyles, ThemedComponentProps } from 'react-native-ui-kitten';
 *
 * type ThemedButtonProps = TouchableOpacityProps & ThemedComponentProps;
 *
 * class Button extends React.Component<ThemedButtonProps> {
 *
 *   public render(): React.ReactElement<TouchableOpacityProps> {
 *     // Retrieve styles from props (provided with themedStyle prop)
 *     // And apply it with saving priority of `style` prop
 *
 *     const { style, themedStyle, ...restProps } = this.props;
 *
 *     return (
 *       <TouchableOpacity
 *         {...restProps}
 *         style={[themedStyle, style]}
 *       />
 *     );
 *   }
 * }
 *
 * export const ThemedButton = withStyles(Button, (theme: ThemeType) => ({
 *   backgroundColor: theme['color-primary-default'],
 * }));
 * ```
 *
 * @example Themed Component Usage
 *
 * ```
 * import React from 'react';
 * import {
 *  ThemedButton,
 *  ThemedButtonProps,
 * } from './path-to/themedButton.component';
 *
 * export const ThemedButtonShowcase = (props?: ThemedButtonProps): React.ReactElement<ThemedButtonProps> => {
 *   return (
 *     <ThemedButton {...props}/>
 *   );
 * };
 * ```
 */
export const withStyles = (Component, createStyles) => {
    class Wrapper extends React.Component {
        constructor() {
            super(...arguments);
            this.createThemedStyles = (style, theme) => {
                return Object.keys(style).reduce((acc, current) => {
                    return Object.assign({}, acc, { [current]: createThemedStyle(style[current], theme) });
                }, {});
            };
            this.withThemedProps = (source, context) => {
                const style = createStyles ? createStyles(context.theme) : {};
                return Object.assign({}, source, { theme: context.theme, themedStyle: this.createThemedStyles(style, context.theme) });
            };
            this.renderWrappedElement = (context) => {
                const _a = this.props, { forwardedRef } = _a, restProps = __rest(_a, ["forwardedRef"]);
                const props = this.withThemedProps(restProps, context);
                return (<Component {...props} ref={forwardedRef}/>);
            };
        }
        render() {
            const ThemedElement = this.renderWrappedElement;
            return (<ThemeContext.Consumer>{(theme) => (<ThemedElement theme={theme}/>)}</ThemeContext.Consumer>);
        }
    }
    const WrappingElement = (props, ref) => {
        return (<Wrapper {...props} forwardedRef={ref}/>);
    };
    const ThemedComponent = React.forwardRef(WrappingElement);
    ThemedComponent.displayName = Component.displayName || Component.name;
    // @ts-ignore
    hoistNonReactStatics(ThemedComponent, Component);
    // @ts-ignore
    return ThemedComponent;
};
