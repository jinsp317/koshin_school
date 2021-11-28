/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ThemeType } from './type';
export interface ThemeProviderProps {
    theme: ThemeType;
    children?: React.ReactNode;
}
export declare class ThemeProvider extends React.PureComponent<ThemeProviderProps> {
    render(): React.ReactNode;
}
