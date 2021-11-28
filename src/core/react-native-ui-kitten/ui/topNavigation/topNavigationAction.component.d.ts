/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ImageProps, TouchableOpacityProps } from 'react-native';
import { StyledComponentProps, StyleType } from '../../theme';
declare type IconElement = React.ReactElement<ImageProps>;
declare type IconProp = (style: StyleType) => IconElement;
interface ComponentProps {
    icon: IconProp;
}
export declare type TopNavigationActionProps = StyledComponentProps & TouchableOpacityProps & ComponentProps;
export declare const TopNavigationAction: React.ComponentClass<TopNavigationActionProps, any>;
export {};
