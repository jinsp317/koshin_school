var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
import { findNodeHandle, UIManager, View, Dimensions, } from 'react-native';
import { Frame } from './type';
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
export const MeasureElement = (props) => {
    const ref = React.createRef();
    const { children, onResult } = props;
    const bindToWindow = (frame, window) => {
        if (frame.origin.x < window.width) {
            return frame;
        }
        const boundFrame = new Frame(frame.origin.x - window.width, frame.origin.y, frame.size.width, frame.size.height);
        return bindToWindow(boundFrame, window);
    };
    const measureSelf = () => {
        const node = findNodeHandle(ref.current);
        UIManager.measureInWindow(node, (x, y, w, h) => {
            const window = Dimensions.get('window');
            const frame = bindToWindow(new Frame(x, y, w, h), window);
            const measuredElement = React.cloneElement(children, { frame });
            onResult(measuredElement);
        });
    };
    return React.cloneElement(children, {
        ref,
        onLayout: measureSelf,
    });
};
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
export const MeasureNode = (props) => {
    const result = {};
    const { children, onResult } = props, derivedProps = __rest(props, ["children", "onResult"]);
    const onChildMeasure = (element) => {
        const { tag, frame } = element.props;
        result[tag] = frame;
        if (Object.keys(result).length === children.length) {
            onResult(result);
        }
    };
    const renderMeasuringElement = (element, index) => {
        return (<MeasureElement key={index} onResult={onChildMeasure}>
        {element}
      </MeasureElement>);
    };
    return (<View {...derivedProps}>
      {children.map(renderMeasuringElement)}
    </View>);
};
