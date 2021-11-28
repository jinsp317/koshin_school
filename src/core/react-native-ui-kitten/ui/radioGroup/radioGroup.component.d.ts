/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ViewProps } from 'react-native';
import { StyledComponentProps } from '../../theme';
import { RadioProps } from '../radio/radio.component';
declare type RadioElement = React.ReactElement<RadioProps>;
declare type ChildrenProp = RadioElement | RadioElement[];
interface ComponentProps {
    children: ChildrenProp;
    selectedIndex?: number;
    onChange?: (index: number) => void;
}
export declare type RadioGroupProps = StyledComponentProps & ViewProps & ComponentProps;
export declare const RadioGroup: React.ComponentClass<RadioGroupProps, any>;
export {};
