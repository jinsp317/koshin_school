/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ViewProps, TouchableOpacityProps } from 'react-native';
export declare type ModalAnimationType = 'slideInUp' | 'fade' | 'none';
declare type ChildElement = React.ReactElement<any>;
declare type ChildrenProp = ChildElement | ChildElement[];
interface ComponentProps {
    visible: boolean;
    children: ChildrenProp;
    isBackDropAllowed?: boolean;
    identifier?: string;
    animationType?: ModalAnimationType;
    animationDuration?: number;
    onCloseModal?: (index: string) => void;
}
export declare type ModalProps = ViewProps & ComponentProps;
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
export declare class Modal extends React.Component<ModalProps> {
    static defaultProps: Partial<ModalProps>;
    private animation;
    constructor(props: ModalProps);
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: Readonly<ModalProps>): void;
    private getAnimationStyle;
    private setAnimation;
    private startAnimation;
    private closeModal;
    private closeOnBackdrop;
    private onStartShouldSetResponder;
    private onResponderRelease;
    private onStartShouldSetResponderCapture;
    private renderComponentChild;
    private renderComponentChildren;
    private renderWithBackDrop;
    private renderWithoutBackDrop;
    private renderComponent;
    render(): React.ReactElement<ViewProps | TouchableOpacityProps> | null;
}
export {};
