/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ImageProps, TouchableOpacityProps } from 'react-native';
import { StyledComponentProps } from '../../theme';
interface ComponentProps {
    shape?: string;
    size?: string;
}
export declare type AvatarProps = StyledComponentProps & ImageProps & ComponentProps;
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
export declare class AvatarComponent extends React.Component<AvatarProps> {
    static styledComponentName: string;
    private getComponentStyle;
    render(): React.ReactElement<TouchableOpacityProps>;
}
export declare const Avatar: React.ComponentClass<AvatarProps, any>;
export {};
