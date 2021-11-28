import React from 'react';
import { ThemeStyleType } from '@src/core/@eva-design/dss';
export interface MappingProviderProps {
    styles: ThemeStyleType;
    children?: React.ReactNode;
}
export declare class MappingProvider extends React.PureComponent<MappingProviderProps> {
    render(): React.ReactNode;
}
