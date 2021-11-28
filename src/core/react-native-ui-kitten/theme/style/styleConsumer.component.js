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
import { StyleConsumerService } from './styleConsumer.service';
import { MappingContext } from '../mapping/mappingContext';
import { ThemeContext } from '../theme/themeContext';
/**
 * High Order Function which is used to apply style mapping on component.
 *
 * Requires component to have `styledComponentName` string property which defines
 * corresponding component name in mapping. (e.g 'Button' for Button component).
 * Returns component class which can be used as styled component.
 *
 * @property {string} appearance - Determines style appearance of component. Default is provided by mapping.
 *
 * @property {ThemeType} theme - Determines theme used to style component.
 *
 * @property {StyleType} themedStyle - Determines component style for it's current state.
 *
 * @property {(interaction: Interaction[]) => void} dispatch - Determines function
 * for dispatching current state of component. This is designed to be used as style request function.
 * Calls component re-render if style for requested state differ from current.
 *
 * @param Component - Type: {React.ComponentClass}. Determines class or functional component to be styled.
 *
 * @example Declaring Styled Component
 *
 * ```
 * import React from 'react';
 * import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
 * import { styled, StyledComponentProps, Interaction } from 'react-native-ui-kitten';
 *
 * type StyledButtonProps = TouchableOpacityProps & StyledComponentProps;
 *
 * class Button extends React.Component<StyledButtonProps> {
 *
 *   // Define component name used in `mapping`
 *   static styledComponentName: string = 'Button';
 *
 *   private onPressIn = (e: GestureResponderEvent) => {
 *     // Request styles for `active` state and re-render
 *
 *     this.props.dispatch([Interaction.ACTIVE]);
 *
 *     if(this.props.onPressIn) {
 *       this.props.onPressIn(e);
 *     }
 *   };
 *
 *   private onPressOut = (e: GestureResponderEvent) => {
 *     // Request styles for default state and re-render
 *
 *     this.props.dispatch([]);
 *
 *     if(this.props.onPressOut) {
 *       this.props.onPressOut(e);
 *     }
 *   };
 *
 *   public render(): React.ReactElement<ButtonProps> {
 *     // Retrieve styles for current state from props (provided with themedStyle prop)
 *     // And apply it with saving priority of `style` prop
 *
 *     const { style, themedStyle, ...restProps } = this.props;
 *
 *     return (
 *       <TouchableOpacity
 *         {...restProps}
 *         style={[themedStyle, style]}
 *         onPressIn={this.onPressIn}
 *         onPressOut={this.onPressOut}
 *       />
 *     );
 *   }
 * }
 *
 * export const StyledButton = styled<StyledButtonProps>(Button);
 * ```
 *
 * @example Styled Component Usage
 *
 * ```
 * import React from 'react';
 * import {
 *   StyledButton,
 *   StyledButtonProps,
 * } from './path-to/styledButton.component';
 *
 * export const StyledButtonShowcase = (props?: StyledButtonProps): React.ReactElement<StyledButtonProps> => {
 *   return (
 *     <StyledButton {...props}/>
 *   );
 * };
 * ```
 */
export const styled = (Component) => {
    // @ts-ignore
    if (!Component.styledComponentName) {
        console.warn('Styled components should specify corresponding style name.');
        return null;
    }
    class Wrapper extends React.Component {
        constructor() {
            super(...arguments);
            this.state = {
                interaction: [],
            };
            this.init = false;
            this.onInit = (context) => {
                // @ts-ignore
                this.service = new StyleConsumerService(Component.styledComponentName, context);
                this.defaultProps = this.service.createDefaultProps();
                this.init = true;
            };
            this.onDispatch = (interaction) => {
                this.setState({ interaction });
            };
            this.withStyledProps = (source, context) => {
                const { interaction } = this.state;
                const props = Object.assign({}, this.defaultProps, source);
                return this.service.withStyledProps(props, context, interaction);
            };
            this.renderWrappedElement = (context) => {
                if (!this.init) {
                    this.onInit(context);
                }
                const _a = this.props, { forwardedRef } = _a, restProps = __rest(_a, ["forwardedRef"]);
                const props = this.withStyledProps(restProps, context);
                return (<Component {...props} ref={forwardedRef} dispatch={this.onDispatch}/>);
            };
        }
        render() {
            const StyledElement = this.renderWrappedElement;
            return (<MappingContext.Consumer>{(styles) => (<ThemeContext.Consumer>{(theme) => (<StyledElement style={styles} theme={theme}/>)}</ThemeContext.Consumer>)}</MappingContext.Consumer>);
        }
    }
    const WrappingElement = (props, ref) => {
        return (<Wrapper {...props} forwardedRef={ref}/>);
    };
    const ResultComponent = React.forwardRef(WrappingElement);
    ResultComponent.displayName = Component.displayName || Component.name;
    // @ts-ignore
    hoistNonReactStatics(ResultComponent, Component);
    // @ts-ignore
    return ResultComponent;
};
