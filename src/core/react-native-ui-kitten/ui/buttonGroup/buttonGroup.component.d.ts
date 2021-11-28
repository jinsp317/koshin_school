/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ViewProps } from 'react-native';
import { StyledComponentProps } from '../../theme';
import { ButtonProps } from '../button/button.component';
declare type ButtonElement = React.ReactElement<ButtonProps>;
declare type ChildrenProp = ButtonElement | ButtonElement[];
interface ComponentProps {
    size?: string;
    status?: string;
    children: ChildrenProp;
}
export declare type ButtonGroupProps = StyledComponentProps & ViewProps & ComponentProps;
export declare const ButtonGroup: React.ComponentClass<ButtonGroupProps, any>;
export {};
