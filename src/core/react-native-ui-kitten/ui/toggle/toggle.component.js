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
import { Animated, Easing, PanResponder, StyleSheet, View, TouchableOpacity, } from 'react-native';
import { Interaction, styled, } from '../../theme';
import { CheckMark } from '../support/components';
/**
 * Styled Toggle component.
 *
 * @extends React.Component
 *
 * @property {boolean} value - Determines whether component is checked.
 * Default is `false`.
 *
 * @property {boolean} disabled - Determines whether component is disabled.
 * Default is `false`.
 *
 * @property {string} status - Determines the status of the component.
 * Can be `primary`, `success`, `info`, `warning` or `danger`.
 *
 * @property {string} size - Determines the size of the component.
 * Can be `giant`, `large`, `medium`, `small`, or `tiny`.
 * Default is `medium`.
 *
 * @property {(value: boolean) => void} onChange - Fires when selection state is changed.
 *
 * @property TouchableOpacityProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import { Toggle } from 'react-native-ui-kitten';
 *
 * export class ToggleShowcase extends React.Component {
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
 *       <Toggle
 *         value={this.state.checked}
 *         onValueChange={this.onChange}
 *       />
 *     );
 *   }
 * }
 * ```
 */
export class ToggleComponent extends React.Component {
    constructor(props) {
        super(props);
        this.onStartShouldSetPanResponder = () => {
            return true;
        };
        this.onStartShouldSetPanResponderCapture = () => {
            return true;
        };
        this.onMoveShouldSetPanResponder = () => {
            return true;
        };
        this.onMoveShouldSetPanResponderCapture = () => {
            return true;
        };
        this.onPanResponderTerminationRequest = () => {
            return false;
        };
        this.onPanResponderGrant = () => {
            const { checked, disabled, themedStyle } = this.props;
            if (disabled) {
                return;
            }
            this.onPressIn();
            if (this.thumbTranslateAnimationActive) {
                this.thumbTranslateAnimationActive = false;
                this.stopAnimations();
                return;
            }
            this.animateThumbWidth(themedStyle.thumbWidth * 1.2);
            this.animateEllipseScale(checked ? 1 : 0.01);
        };
        this.onPanResponderMove = () => {
            return true;
        };
        this.onPanResponderRelease = (e, gestureState) => {
            const { checked, disabled, themedStyle } = this.props;
            if (!disabled) {
                if ((!checked && gestureState.dx > -5) || (checked && gestureState.dx < 5)) {
                    this.toggle(this.onPress);
                }
                else {
                    this.animateEllipseScale(checked ? 0.01 : 1);
                }
            }
            this.animateThumbWidth(themedStyle.thumbWidth);
            this.onPressOut();
        };
        this.onPressIn = () => {
            this.props.dispatch([Interaction.ACTIVE]);
        };
        this.onPressOut = () => {
            this.props.dispatch([]);
        };
        this.onPress = () => {
            if (this.props.onChange) {
                this.props.onChange(!this.props.checked);
            }
        };
        this.getComponentStyle = (source) => {
            const { style, checked, disabled } = this.props;
            const { outlineWidth, outlineHeight, outlineBorderRadius, outlineBackgroundColor, thumbWidth, thumbHeight, thumbBorderRadius, thumbBackgroundColor, iconWidth, iconHeight, iconTintColor, offsetValue, backgroundColor, borderColor } = source, containerParameters = __rest(source, ["outlineWidth", "outlineHeight", "outlineBorderRadius", "outlineBackgroundColor", "thumbWidth", "thumbHeight", "thumbBorderRadius", "thumbBackgroundColor", "iconWidth", "iconHeight", "iconTintColor", "offsetValue", "backgroundColor", "borderColor"]);
            const interpolatedBackgroundColor = this.getInterpolatedColor(backgroundColor, borderColor);
            const interpolatedIconColor = this.getInterpolatedColor(thumbBackgroundColor, iconTintColor);
            const thumbScale = this.animateThumbScale(offsetValue);
            return {
                container: Object.assign({}, styles.container, StyleSheet.flatten(style)),
                componentContainer: Object.assign({ borderColor: borderColor, backgroundColor: interpolatedBackgroundColor }, containerParameters, styles.componentContainer),
                highlight: Object.assign({ width: outlineWidth, height: outlineHeight, borderRadius: outlineBorderRadius, backgroundColor: outlineBackgroundColor }, styles.highlight),
                ellipse: Object.assign({ width: containerParameters.width - (containerParameters.borderWidth * 2), height: containerParameters.height - (containerParameters.borderWidth * 2), borderRadius: (source.height - (source.borderWidth * 2)) / 2, backgroundColor: interpolatedBackgroundColor, transform: [{ scale: checked ? thumbScale : this.ellipseScaleAnimation }] }, styles.ellipse),
                thumb: Object.assign({ alignSelf: checked ? 'flex-end' : 'flex-start', width: this.thumbWidthAnimation, height: thumbHeight, borderRadius: thumbBorderRadius, backgroundColor: thumbBackgroundColor, elevation: disabled ? 0 : 5, transform: [{ translateX: this.thumbTranslateAnimation }] }, styles.thumb),
                icon: {
                    width: source.iconWidth,
                    height: source.iconHeight,
                    backgroundColor: interpolatedIconColor,
                },
            };
        };
        this.animateThumbTranslate = (value, callback = () => null) => {
            this.thumbTranslateAnimationActive = true;
            Animated.timing(this.thumbTranslateAnimation, {
                toValue: value,
                duration: 150,
                easing: Easing.linear,
            }).start(() => {
                this.thumbTranslateAnimationActive = false;
                callback();
            });
        };
        this.animateThumbWidth = (value, callback = () => null) => {
            Animated.timing(this.thumbWidthAnimation, {
                toValue: value,
                duration: 150,
                easing: Easing.linear,
            }).start(callback);
        };
        this.animateEllipseScale = (value, callback = () => null) => {
            Animated.timing(this.ellipseScaleAnimation, {
                toValue: value,
                duration: 200,
                easing: Easing.linear,
            }).start(callback);
        };
        this.animateThumbScale = (value) => {
            return this.thumbTranslateAnimation.interpolate({
                inputRange: [-value, 0],
                outputRange: [1, 0.01],
            });
        };
        this.stopAnimations = () => {
            const value = this.props.checked ? 0.01 : 1;
            this.thumbTranslateAnimation.stopAnimation();
            this.ellipseScaleAnimation.stopAnimation();
            this.thumbWidthAnimation.stopAnimation();
            this.ellipseScaleAnimation.setValue(value);
        };
        this.toggle = (callback = (nextValue) => null) => {
            const { checked, themedStyle } = this.props;
            const value = checked ? -themedStyle.offsetValue : themedStyle.offsetValue;
            this.animateThumbTranslate(value, () => {
                this.thumbTranslateAnimation.setValue(0);
                callback(!checked);
            });
            this.animateThumbWidth(this.props.themedStyle.thumbWidth);
        };
        this.getInterpolatedColor = (startColor, endColor) => {
            const { checked, themedStyle } = this.props;
            return this.thumbTranslateAnimation.interpolate({
                inputRange: checked ? [-themedStyle.offsetValue, 0] : [0, themedStyle.offsetValue],
                outputRange: [startColor, endColor],
            });
        };
        const { checked, themedStyle } = props;
        this.thumbWidthAnimation = new Animated.Value(themedStyle.thumbWidth);
        this.thumbTranslateAnimation = new Animated.Value(0);
        this.ellipseScaleAnimation = new Animated.Value(checked ? 0.01 : 1.0);
        this.thumbTranslateAnimationActive = false;
        this.panResponder = PanResponder.create(this);
    }
    render() {
        const _a = this.props, { themedStyle, disabled, checked } = _a, restProps = __rest(_a, ["themedStyle", "disabled", "checked"]);
        const componentStyle = this.getComponentStyle(themedStyle);
        return (<View {...restProps} style={componentStyle.container}>
        <View style={componentStyle.highlight}/>
        <TouchableOpacity onPressIn={this.onPressIn} onPressOut={this.onPressOut} onPress={this.onPress}>
          <Animated.View style={componentStyle.componentContainer} {...this.panResponder.panHandlers}>
            <Animated.View style={componentStyle.ellipse}/>
            <Animated.View style={componentStyle.thumb}>
              <CheckMark style={componentStyle.icon} isAnimated={true}/>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </View>);
    }
}
ToggleComponent.styledComponentName = 'Toggle';
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    componentContainer: {
        justifyContent: 'center',
        alignSelf: 'center',
        overflow: 'hidden',
    },
    ellipse: {
        alignSelf: 'center',
        position: 'absolute',
    },
    highlight: {
        alignSelf: 'center',
        position: 'absolute',
    },
    thumb: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
export const Toggle = styled(ToggleComponent);
