import React from 'react';
import { ViewProps } from 'react-native';
interface ComponentProps {
    isAnimated?: boolean;
}
export declare type CheckMarkProps = ViewProps & ComponentProps;
export declare class CheckMark extends React.Component<CheckMarkProps> {
    static defaultProps: {
        isAnimated: boolean;
    };
    private getComponentStyle;
    render(): React.ReactNode;
}
export {};
