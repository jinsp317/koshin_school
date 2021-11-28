import React from 'react';
import { ViewProps, ViewStyle, StyleProp } from 'react-native';
import { PopoverPlacement } from './type';
interface ComponentProps {
    placement?: string | PopoverPlacement;
    indicatorOffset?: number;
    indicatorStyle?: StyleProp<ViewStyle>;
}
export declare type PopoverViewProps = ViewProps & ComponentProps;
export declare class PopoverView extends React.Component<PopoverViewProps> {
    static defaultProps: Partial<PopoverViewProps>;
    private getComponentStyle;
    render(): React.ReactElement<ViewProps>;
}
export {};
