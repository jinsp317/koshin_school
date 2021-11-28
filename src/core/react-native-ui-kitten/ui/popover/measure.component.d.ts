import React from 'react';
import { ViewProps } from 'react-native';
import { Frame } from './type';
export declare type MeasuringElement = React.ReactElement<MeasuringElementProps>;
export declare type MeasuringElementProps = {
    tag: React.ReactText;
} & any;
export declare type MeasuringNode = React.ReactElement<MeasureNodeProps>;
export declare type MeasuringNodeProps = MeasureNodeProps & ViewProps;
export declare type MeasuredElementProps = MeasuringElementProps & {
    frame: Frame;
};
export declare type MeasuredElement = React.ReactElement<MeasuredElementProps>;
export interface MeasureResult {
    [tag: string]: Frame;
}
export interface MeasureElementProps {
    onResult: (result: MeasuredElement) => void;
    children: MeasuringElement;
}
export interface MeasureNodeProps {
    onResult: (result: MeasureResult) => void;
    children: MeasuringElement[];
}
/**
 * Measures child element size and it's screen position asynchronously.
 * Returns measure result in `onResult` callback.
 *
 * Usage:
 *
 * const onMeasure = (element: ElementToMeasure): void => {
 *   const { x, y, width, height } = element.props.frame;
 *   ...
 * };
 *
 * <MeasureElement onResult={this.onMeasure}>
 *   <ElementToMeasure tag='@measure/measure-me!'/>
 * </MeasureElement>
 */
export declare const MeasureElement: (props: MeasureElementProps) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>;
/**
 * Measures passed child elements size and it's screen position asynchronously.
 * Returns measure result in `onResult` callback.
 *
 * Does the same as `MeasureElement` but calls `onResult` after all children are measured.
 *
 * Usage:
 *
 * const onMeasure = (result: MeasureResult): void => {
 *   const { [0]: firstElementFrame, [1]: secondElementFrame } = result;
 *   const { x, y, width, height } = firstElementFrame;
 *   ...
 * };
 *
 * <MeasureNode onResult={this.onMeasure}>
 *   <ElementToMeasure tag={0}/>
 *   <ElementToMeasure tag={1}/>
 * </MeasureNode>
 */
export declare const MeasureNode: (props: MeasuringNodeProps) => React.ReactElement<MeasureNodeProps, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>;
