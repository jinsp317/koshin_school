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
import { View, StyleSheet, Dimensions, Animated, TouchableOpacity, } from 'react-native';
const { width, height } = Dimensions.get('window');
/**
 * Modal component is a wrapper than presents content above an enclosing view.
 *
 * @extends React.Component
 *
 * @property {boolean} visible - Determines whether component is visible. By default is false.
 *
 * @property {React.ReactElement<any> | React.ReactElement<any>[]} children -
 * Determines component's children.
 *
 * @property {boolean} isBackDropAllowed - Determines whether user can close
 * modal by tapping on backdrop. This feature works in pair with the
 * `onCloseModal` property.
 * Default is `false`.
 *
 * @property {() => void} onCloseModal - Allows passing a function that will
 * be called once the modal has been dismissed.
 *
 * @property {ModalAnimationType} animationType - Controls how the modal showing animates.
 * Can be `slideInUp`, `fade` or `none`.
 * Default is 'none'.
 *
 * @property {number} animationDuration - Time of the animation duration.
 *
 * @property ViewProps
 *
 * @example Simple usage example
 *
 * ```
 * import { Modal } from 'react-native-ui-kitten';
 * <Modal visible={true}>
 *  <View><Text>Hello! I'm modal!</Text></View>
 * </Modal>
 * ```
 * @example Modal usage and API example
 *
 * ```
 * import { Modal } from 'react-native-ui-kitten';
 *
 * state: State = {
 *   visible: false,
 * };
 *
 * private setVisible = (): void => {
 *   this.setState({ visible: !this.state.visible });
 * };
 *
 * private onModalDismiss = (): void => {
 *   this.setState({ visible: false });
 * };
 *
 * public render(): React.ReactNode {
 *   return (
 *     <View>
 *       <Button title='Show Modal' onPress={this.setVisible}/>
 *       <Modal
 *         visible={this.state.visible}
 *         animationType='fade'
 *         animationDuration={600}
 *         isBackDropAllowed={true}
 *         onCloseModal={this.onModalDismiss}
 *         onValueChange={this.onChange}>
 *         <View>
 *           <Text>Hi! This is modal component!</Test>
 *           <Button title='Close Modal' onPress={this.setVisible}/>
 *         <View/>
 *       </Modal>
 *     </View>
 *   )
 * }
 * ```
 * */
export class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.closeModal = () => {
            if (this.props.onCloseModal) {
                this.props.onCloseModal(this.props.identifier);
            }
        };
        this.closeOnBackdrop = () => {
            if (this.props.isBackDropAllowed) {
                this.closeModal();
            }
        };
        this.onStartShouldSetResponder = () => true;
        this.onResponderRelease = () => {
            return;
        };
        this.onStartShouldSetResponderCapture = () => false;
        this.renderComponentChild = (source) => {
            return React.cloneElement(source, Object.assign({}, source.props, { onCloseModal: this.closeModal, style: Object.assign({}, source.props.style, StyleSheet.flatten(this.props.style)) }));
        };
        this.renderComponentChildren = (source) => {
            return React.Children.map(source, this.renderComponentChild);
        };
        this.renderWithBackDrop = (component) => (<TouchableOpacity style={styles.container} onPress={this.closeOnBackdrop} activeOpacity={1}>
      {component}
    </TouchableOpacity>);
        this.renderWithoutBackDrop = (component) => (<View style={styles.notVisibleWrapper}>
      <View style={styles.container} pointerEvents='none'/>
      {component}
    </View>);
        this.renderComponent = () => {
            const _a = this.props, { animationType, children, isBackDropAllowed } = _a, derivedProps = __rest(_a, ["animationType", "children", "isBackDropAllowed"]);
            const animationStyle = this.getAnimationStyle(animationType);
            const componentChildren = this.renderComponentChildren(children);
            const dialog = <Animated.View {...derivedProps} style={[animationStyle, styles.animatedWrapper]} onStartShouldSetResponder={this.onStartShouldSetResponder} onResponderRelease={this.onResponderRelease} onStartShouldSetResponderCapture={this.onStartShouldSetResponderCapture} pointerEvents='box-none'>
        {componentChildren}
      </Animated.View>;
            return isBackDropAllowed ?
                this.renderWithBackDrop(dialog) : this.renderWithoutBackDrop(dialog);
        };
        this.setAnimation();
    }
    componentDidMount() {
        this.startAnimation();
    }
    componentWillReceiveProps(nextProps) {
        const { visible, animationType } = this.props;
        const isVisibilityChanged = nextProps.visible !== visible;
        const isAnimated = animationType !== 'none';
        if (isVisibilityChanged && isAnimated) {
            const initialValue = animationType === 'fade' ? 0 : height;
            this.animation.setValue(initialValue);
            this.startAnimation();
        }
    }
    getAnimationStyle(type) {
        switch (type) {
            case 'none':
                return {};
            case 'fade':
                return { opacity: this.animation };
            default:
                return { transform: [{ translateY: this.animation }] };
        }
    }
    setAnimation() {
        if (this.props.animationType === 'slideInUp') {
            this.animation = new Animated.Value(height);
        }
        else {
            this.animation = new Animated.Value(0);
        }
    }
    startAnimation() {
        const { animationType, animationDuration } = this.props;
        const animationValue = animationType === 'fade' ? 1 : 0;
        Animated.timing(this.animation, {
            toValue: animationValue,
            duration: animationDuration,
        }).start();
    }
    render() {
        return this.props.visible ? this.renderComponent() : null;
    }
}
Modal.defaultProps = {
    visible: false,
    isBackDropAllowed: false,
    animationType: 'none',
    animationDuration: 300,
};
const styles = StyleSheet.create({
    container: Object.assign({}, StyleSheet.absoluteFillObject),
    notVisibleWrapper: {
        position: 'absolute',
        width: 0,
        height: 0,
    },
    animatedWrapper: {
        alignSelf: 'flex-start',
    },
});
