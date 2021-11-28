import { StyleSheet, } from 'react-native';
export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static zero() {
        return new Point(0, 0);
    }
}
export class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    static zero() {
        return new Size(0, 0);
    }
}
export class Frame {
    constructor(x, y, width, height) {
        this.origin = new Point(x, y);
        this.size = new Size(width, height);
    }
    /**
     * Creates new frame aligned to left of other
     */
    leftOf(other) {
        return new Frame(other.origin.x - this.size.width, this.origin.y, this.size.width, this.size.height);
    }
    /**
     * Creates new frame aligned to top of other
     */
    topOf(other) {
        return new Frame(this.origin.x, other.origin.y - this.size.height, this.size.width, this.size.height);
    }
    /**
     * Creates new frame aligned to right of other
     */
    rightOf(other) {
        return new Frame(other.origin.x + other.size.width, this.origin.y, this.size.width, this.size.height);
    }
    /**
     * Creates new frame aligned to bottom of other
     */
    bottomOf(other) {
        return new Frame(this.origin.x, other.origin.y + other.size.height, this.size.width, this.size.height);
    }
    /**
     * Creates new frame centered horizontally to other
     */
    centerHorizontalOf(other) {
        return new Frame(other.origin.x + (other.size.width - this.size.width) / 2, this.origin.y, this.size.width, this.size.height);
    }
    /**
     * Creates new frame centered vertically to other
     */
    centerVerticalOf(other) {
        return new Frame(this.origin.x, other.origin.y + (other.size.height - this.size.height) / 2, this.size.width, this.size.height);
    }
    static zero() {
        return Frame.from(Point.zero(), Size.zero());
    }
    static from(point, size) {
        return new Frame(point.x, point.y, size.width, size.height);
    }
}
export class OffsetRect {
    static zero() {
        return { left: 0, top: 0, right: 0, bottom: 0 };
    }
}
export class Offsets {
    static find(source) {
        const keys = [
            Offsets.MARGIN.rawValue,
            Offsets.MARGIN_HORIZONTAL.rawValue,
            Offsets.MARGIN_VERTICAL.rawValue,
            Offsets.MARGIN_LEFT.rawValue,
            Offsets.MARGIN_TOP.rawValue,
            Offsets.MARGIN_RIGHT.rawValue,
            Offsets.MARGIN_BOTTOM.rawValue,
        ];
        const flatStyle = StyleSheet.flatten(source) || {};
        return Object.keys(flatStyle).filter((key) => {
            return keys.includes(key);
        }).reduce((acc, key) => {
            const value = flatStyle[key];
            const offsetValue = Offsets.parseString(key);
            return offsetValue ? offsetValue.applyToRect(acc, value) : acc;
        }, OffsetRect.zero());
    }
    static parseString(rawValue, fallback) {
        switch (rawValue) {
            case Offsets.MARGIN.rawValue:
                return Offsets.MARGIN;
            case Offsets.MARGIN_HORIZONTAL.rawValue:
                return Offsets.MARGIN_HORIZONTAL;
            case Offsets.MARGIN_VERTICAL.rawValue:
                return Offsets.MARGIN_VERTICAL;
            case Offsets.MARGIN_LEFT.rawValue:
                return Offsets.MARGIN_LEFT;
            case Offsets.MARGIN_TOP.rawValue:
                return Offsets.MARGIN_TOP;
            case Offsets.MARGIN_RIGHT.rawValue:
                return Offsets.MARGIN_RIGHT;
            case Offsets.MARGIN_BOTTOM.rawValue:
                return Offsets.MARGIN_BOTTOM;
            default:
                return fallback;
        }
    }
}
Offsets.MARGIN = new class {
    constructor() {
        this.rawValue = 'margin';
    }
    applyToRect(rect, value) {
        return {
            left: value,
            top: value,
            right: value,
            bottom: value,
        };
    }
};
Offsets.MARGIN_HORIZONTAL = new class {
    constructor() {
        this.rawValue = 'marginHorizontal';
    }
    applyToRect(rect, value) {
        return Object.assign({}, rect, { left: value, right: value });
    }
};
Offsets.MARGIN_VERTICAL = new class {
    constructor() {
        this.rawValue = 'marginVertical';
    }
    applyToRect(rect, value) {
        return Object.assign({}, rect, { top: value, bottom: value });
    }
};
Offsets.MARGIN_LEFT = new class {
    constructor() {
        this.rawValue = 'marginLeft';
    }
    applyToRect(rect, value) {
        return Object.assign({}, rect, { left: value });
    }
};
Offsets.MARGIN_TOP = new class {
    constructor() {
        this.rawValue = 'marginTop';
    }
    applyToRect(rect, value) {
        return Object.assign({}, rect, { top: value });
    }
};
Offsets.MARGIN_RIGHT = new class {
    constructor() {
        this.rawValue = 'marginRight';
    }
    applyToRect(rect, value) {
        return Object.assign({}, rect, { right: value });
    }
};
Offsets.MARGIN_BOTTOM = new class {
    constructor() {
        this.rawValue = 'marginBottom';
    }
    applyToRect(rect, value) {
        return Object.assign({}, rect, { bottom: value });
    }
};
export class PopoverPlacements {
    static parse(value, fallback) {
        return PopoverPlacements.typeOf(value) ? value : PopoverPlacements.parseString(value, fallback);
    }
    static parseString(rawValue, fallback) {
        switch (rawValue) {
            case PopoverPlacements.LEFT.rawValue:
                return PopoverPlacements.LEFT;
            case PopoverPlacements.TOP.rawValue:
                return PopoverPlacements.TOP;
            case PopoverPlacements.RIGHT.rawValue:
                return PopoverPlacements.RIGHT;
            case PopoverPlacements.BOTTOM.rawValue:
                return PopoverPlacements.BOTTOM;
            case PopoverPlacements.LEFT_START.rawValue:
                return PopoverPlacements.LEFT_START;
            case PopoverPlacements.LEFT_END.rawValue:
                return PopoverPlacements.LEFT_END;
            case PopoverPlacements.TOP_START.rawValue:
                return PopoverPlacements.TOP_START;
            case PopoverPlacements.TOP_END.rawValue:
                return PopoverPlacements.TOP_END;
            case PopoverPlacements.RIGHT_START.rawValue:
                return PopoverPlacements.RIGHT_START;
            case PopoverPlacements.RIGHT_END.rawValue:
                return PopoverPlacements.RIGHT_END;
            case PopoverPlacements.BOTTOM_START.rawValue:
                return PopoverPlacements.BOTTOM_START;
            case PopoverPlacements.BOTTOM_END.rawValue:
                return PopoverPlacements.BOTTOM_END;
            default:
                return fallback;
        }
    }
    static typeOf(value) {
        const { rawValue } = value;
        return rawValue !== undefined;
    }
}
PopoverPlacements.LEFT = new class {
    constructor() {
        this.rawValue = 'left';
    }
    frame(source, other, offset = OffsetRect.zero()) {
        const { origin, size } = source.leftOf(other).centerVerticalOf(other);
        return new Frame(origin.x + offset.left, origin.y, size.width, size.height);
    }
    flex() {
        return {
            direction: 'row',
            alignment: 'center',
        };
    }
    parent() {
        return this;
    }
    reverse() {
        return PopoverPlacements.RIGHT;
    }
};
PopoverPlacements.LEFT_START = new class {
    constructor() {
        this.rawValue = 'left start';
    }
    frame(source, other, offset = OffsetRect.zero()) {
        const { origin, size } = this.parent().frame(source, other, offset);
        return new Frame(origin.x, origin.y - (other.size.height - size.height) / 2 + offset.top, size.width, size.height);
    }
    flex() {
        return {
            direction: 'row',
            alignment: 'flex-start',
        };
    }
    parent() {
        return PopoverPlacements.LEFT;
    }
    reverse() {
        return PopoverPlacements.RIGHT_START;
    }
};
PopoverPlacements.LEFT_END = new class {
    constructor() {
        this.rawValue = 'left end';
    }
    frame(source, other, offset = OffsetRect.zero()) {
        const { origin, size } = this.parent().frame(source, other, offset);
        return new Frame(origin.x, origin.y + (other.size.height - size.height) / 2 - offset.bottom, size.width, size.height);
    }
    flex() {
        return {
            direction: 'row',
            alignment: 'flex-end',
        };
    }
    parent() {
        return PopoverPlacements.LEFT;
    }
    reverse() {
        return PopoverPlacements.RIGHT_END;
    }
};
PopoverPlacements.TOP = new class {
    constructor() {
        this.rawValue = 'top';
    }
    frame(source, other, offset = OffsetRect.zero()) {
        const { origin, size } = source.topOf(other).centerHorizontalOf(other);
        return new Frame(origin.x, origin.y + offset.top, size.width, size.height);
    }
    flex() {
        return {
            direction: 'column',
            alignment: 'center',
        };
    }
    parent() {
        return this;
    }
    reverse() {
        return PopoverPlacements.BOTTOM;
    }
};
PopoverPlacements.TOP_START = new class {
    constructor() {
        this.rawValue = 'top start';
    }
    frame(source, other, offset = OffsetRect.zero()) {
        const { origin, size } = this.parent().frame(source, other, offset);
        return new Frame(origin.x - (other.size.width - size.width) / 2 + offset.left, origin.y, size.width, size.height);
    }
    flex() {
        return {
            direction: 'column',
            alignment: 'flex-start',
        };
    }
    parent() {
        return PopoverPlacements.TOP;
    }
    reverse() {
        return PopoverPlacements.BOTTOM_START;
    }
};
PopoverPlacements.TOP_END = new class {
    constructor() {
        this.rawValue = 'top end';
    }
    frame(source, other, offset = OffsetRect.zero()) {
        const { origin, size } = this.parent().frame(source, other, offset);
        return new Frame(origin.x + (other.size.width - size.width) / 2 - offset.right, origin.y, size.width, size.height);
    }
    flex() {
        return {
            direction: 'column',
            alignment: 'flex-end',
        };
    }
    parent() {
        return PopoverPlacements.TOP;
    }
    reverse() {
        return PopoverPlacements.BOTTOM_END;
    }
};
PopoverPlacements.RIGHT = new class {
    constructor() {
        this.rawValue = 'right';
    }
    frame(source, other, offset = OffsetRect.zero()) {
        const { origin, size } = source.rightOf(other).centerVerticalOf(other);
        return new Frame(origin.x - offset.right, origin.y, size.width, size.height);
    }
    flex() {
        return {
            direction: 'row-reverse',
            alignment: 'center',
        };
    }
    parent() {
        return this;
    }
    reverse() {
        return PopoverPlacements.LEFT;
    }
};
PopoverPlacements.RIGHT_START = new class {
    constructor() {
        this.rawValue = 'right start';
    }
    frame(source, other, offset = OffsetRect.zero()) {
        const { origin, size } = this.parent().frame(source, other, offset);
        return new Frame(origin.x, origin.y - (other.size.height - size.height) / 2 + offset.top, size.width, size.height);
    }
    flex() {
        return {
            direction: 'row-reverse',
            alignment: 'flex-start',
        };
    }
    parent() {
        return PopoverPlacements.RIGHT;
    }
    reverse() {
        return PopoverPlacements.LEFT_START;
    }
};
PopoverPlacements.RIGHT_END = new class {
    constructor() {
        this.rawValue = 'right end';
    }
    frame(source, other, offset = OffsetRect.zero()) {
        const { origin, size } = this.parent().frame(source, other, offset);
        return new Frame(origin.x, origin.y + (other.size.height - size.height) / 2 - offset.bottom, size.width, size.height);
    }
    flex() {
        return {
            direction: 'row-reverse',
            alignment: 'flex-end',
        };
    }
    parent() {
        return PopoverPlacements.RIGHT;
    }
    reverse() {
        return PopoverPlacements.LEFT_END;
    }
};
PopoverPlacements.BOTTOM = new class {
    constructor() {
        this.rawValue = 'bottom';
    }
    frame(source, other, offset = OffsetRect.zero()) {
        const { origin, size } = source.bottomOf(other).centerHorizontalOf(other);
        return new Frame(origin.x, origin.y - offset.bottom, size.width, size.height);
    }
    flex() {
        return {
            direction: 'column-reverse',
            alignment: 'center',
        };
    }
    parent() {
        return this;
    }
    reverse() {
        return PopoverPlacements.TOP;
    }
};
PopoverPlacements.BOTTOM_START = new class {
    constructor() {
        this.rawValue = 'bottom start';
    }
    frame(source, other, offset = OffsetRect.zero()) {
        const { origin, size } = this.parent().frame(source, other, offset);
        return new Frame(origin.x - (other.size.width - size.width) / 2 + offset.left, origin.y, size.width, size.height);
    }
    flex() {
        return {
            direction: 'column-reverse',
            alignment: 'flex-start',
        };
    }
    parent() {
        return PopoverPlacements.BOTTOM;
    }
    reverse() {
        return PopoverPlacements.TOP_START;
    }
};
PopoverPlacements.BOTTOM_END = new class {
    constructor() {
        this.rawValue = 'bottom end';
    }
    frame(source, other, offset = OffsetRect.zero()) {
        const { origin, size } = this.parent().frame(source, other, offset);
        return new Frame(origin.x + (other.size.width - size.width) / 2 - offset.right, origin.y, size.width, size.height);
    }
    flex() {
        return {
            direction: 'column-reverse',
            alignment: 'flex-end',
        };
    }
    parent() {
        return PopoverPlacements.BOTTOM;
    }
    reverse() {
        return PopoverPlacements.TOP_END;
    }
};
