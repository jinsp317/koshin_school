/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
/**
 * Singleton service designed to manage modal components.
 *
 * @type ModalServiceType
 *
 * @method {(element: React.ReactElement<ModalComponentCloseProps>,
 * closeOnBackDrop: boolean = false) => string} show - Shows component in a modal window.
 *
 * @method {(identifier: string) => void} hide - Hides component from a modal window.
 *
 * @example Simple Usage example
 *
 * ```
 * import React from 'react';
 * import { View, ViewProps } from 'react-native';
 * import { Button, Text, ModalService } from 'react-native-ui-kitten';
 *
 * export const ModalServiceShowcase = (): React.ReactElement<ViewProps> => {
 *
 *   const modalID: string = '';
 *
 *   const showModal = () => {
 *     const component: React.ReactElement<ViewProps> =
 *
 *     this.modalID = ModalService.show(this.renderModalContentElement);
 *   };
 *
 *   const hideModal = () => {
 *     ModalService.hide(this.modalID);
 *   };
 *
 *   const renderModalContentElement = (): React.ReactElement<ViewProps> => {
 *     return (
 *       <View>
 *         <Text>Hi, I'm modal!</Text>
 *       </View>
 *     );
 *   };
 *
 *   return (
 *     <View>
 *       <Button onPress={this.showModal}>
 *         SHOW MODAL
 *       </Button>
 *       <Button onPress={this.hideModal}>
 *         HIDE MODAL
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */
declare class ModalServiceType {
    panel: ModalPresenting | null;
    mount(panel: ModalPresenting | null): void;
    unmount(): void;
    show(element: React.ReactElement<ModalComponentCloseProps>, closeOnBackDrop?: boolean): string;
    hide(identifier: string): void;
}
export interface ModalComponentCloseProps {
    [key: string]: any;
    onRequestClose: () => void;
}
export interface ModalPresenting {
    show(element: React.ReactElement<ModalComponentCloseProps>, closeOnBackDrop: boolean): string;
    hide(identifier: string): void;
}
export declare const ModalService: ModalServiceType;
export {};
