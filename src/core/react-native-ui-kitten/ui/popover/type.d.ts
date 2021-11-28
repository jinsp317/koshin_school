import { FlexStyle, StyleProp } from 'react-native';
export declare class Point {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number);
    static zero(): Point;
}
export declare class Size {
    readonly width: number;
    readonly height: number;
    constructor(width: number, height: number);
    static zero(): Size;
}
export declare class Frame {
    readonly origin: Point;
    readonly size: Size;
    constructor(x: number, y: number, width: number, height: number);
    /**
     * Creates new frame aligned to left of other
     */
    leftOf(other: Frame): Frame;
    /**
     * Creates new frame aligned to top of other
     */
    topOf(other: Frame): Frame;
    /**
     * Creates new frame aligned to right of other
     */
    rightOf(other: Frame): Frame;
    /**
     * Creates new frame aligned to bottom of other
     */
    bottomOf(other: Frame): Frame;
    /**
     * Creates new frame centered horizontally to other
     */
    centerHorizontalOf(other: Frame): Frame;
    /**
     * Creates new frame centered vertically to other
     */
    centerVerticalOf(other: Frame): Frame;
    static zero(): Frame;
    static from(point: Point, size: Size): Frame;
}
export interface OffsetValue {
    rawValue: string;
    applyToRect(rect: OffsetRect, value: number): OffsetRect;
}
export declare class OffsetRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
    static zero(): OffsetRect;
}
export declare class Offsets {
    static MARGIN: OffsetValue;
    static MARGIN_HORIZONTAL: OffsetValue;
    static MARGIN_VERTICAL: OffsetValue;
    static MARGIN_LEFT: OffsetValue;
    static MARGIN_TOP: OffsetValue;
    static MARGIN_RIGHT: OffsetValue;
    static MARGIN_BOTTOM: OffsetValue;
    static find(source: StyleProp<FlexStyle>): OffsetRect;
    private static parseString;
}
export interface PopoverPlacement {
    rawValue: string;
    frame(source: Frame, other: Frame, offset?: OffsetRect): Frame;
    flex(): FlexPlacement;
    parent(): PopoverPlacement;
    reverse(): PopoverPlacement;
}
export interface FlexPlacement {
    direction: 'column' | 'row' | 'column-reverse' | 'row-reverse';
    alignment: 'flex-start' | 'flex-end' | 'center';
}
export declare class PopoverPlacements {
    static LEFT: PopoverPlacement;
    static LEFT_START: PopoverPlacement;
    static LEFT_END: PopoverPlacement;
    static TOP: PopoverPlacement;
    static TOP_START: PopoverPlacement;
    static TOP_END: PopoverPlacement;
    static RIGHT: PopoverPlacement;
    static RIGHT_START: PopoverPlacement;
    static RIGHT_END: PopoverPlacement;
    static BOTTOM: PopoverPlacement;
    static BOTTOM_START: PopoverPlacement;
    static BOTTOM_END: PopoverPlacement;
    static parse(value: string | PopoverPlacement, fallback?: PopoverPlacement): PopoverPlacement | undefined;
    private static parseString;
    private static typeOf;
}
