/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { TouchableOpacityProps, StyleProp, TextStyle } from 'react-native';
import { StyledComponentProps } from '../../theme';
interface ComponentProps {
    textStyle?: StyleProp<TextStyle>;
    text?: string;
    checked?: boolean;
    indeterminate?: boolean;
    status?: string;
    onChange?: (checked: boolean, indeterminate: boolean) => void;
}
export declare type CheckBoxProps = StyledComponentProps & TouchableOpacityProps & ComponentProps;
export declare const CheckBox: React.ComponentClass<CheckBoxProps, any>;
export {};
