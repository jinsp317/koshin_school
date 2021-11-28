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
import { View, StyleSheet, } from 'react-native';
import { PopoverPlacements, } from './type';
import { Arrow } from '../support/components';
const PLACEMENT_DEFAULT = PopoverPlacements.TOP;
export class PopoverView extends React.Component {
    constructor() {
        super(...arguments);
        this.getComponentStyle = (source, placement) => {
            const derivedIndicatorStyle = StyleSheet.flatten(this.props.indicatorStyle);
            const { direction, alignment } = placement.flex();
            const isVertical = direction.startsWith('column');
            const isStart = alignment.endsWith('start');
            const isEnd = alignment.endsWith('end');
            const isReverse = direction.endsWith('reverse');
            // Rotate indicator by 90 deg if we have `row` direction (left/right placement)
            // Rotate it again by 180 if we have `row-reverse` (bottom/right placement)
            const indicatorPrimaryRotate = isVertical ? 180 : 90;
            const indicatorSecondaryRotate = isReverse ? 0 : 180;
            // Translate container by half of `indicatorWidth`. Exactly half (because it has a square shape)
            // Reverse if needed
            // @ts-ignore: indicatorWidth type is always number
            let containerTranslate = isVertical ? 0 : derivedIndicatorStyle.width / 2;
            containerTranslate = isReverse ? containerTranslate : -containerTranslate;
            // Translate indicator by passed `indicatorOffset`
            // Reverse if needed
            let indicatorTranslate = isVertical ? -this.props.indicatorOffset : this.props.indicatorOffset;
            indicatorTranslate = isReverse ? -indicatorTranslate : indicatorTranslate;
            const containerStyle = Object.assign({ flexDirection: direction, alignItems: alignment, transform: [
                    { translateX: containerTranslate },
                ] }, styles.container);
            const contentStyle = Object.assign({ backgroundColor: 'black', transform: [
                    { translateX: containerTranslate },
                ] }, StyleSheet.flatten(source), styles.content);
            const indicatorStyle = Object.assign({ transform: [
                    { rotate: `${indicatorPrimaryRotate}deg` },
                    { rotate: `${indicatorSecondaryRotate}deg` },
                    // Translate indicator "to start" if we have `-start` alignment
                    // Or translate it "to end" if we have `-end` alignment
                    { translateX: isStart ? -indicatorTranslate : 0 },
                    { translateX: isEnd ? indicatorTranslate : 0 },
                ] }, derivedIndicatorStyle, styles.indicator);
            return {
                container: containerStyle,
                content: contentStyle,
                indicator: indicatorStyle,
            };
        };
    }
    render() {
        const _a = this.props, { style, placement: rawPlacement, children } = _a, derivedProps = __rest(_a, ["style", "placement", "children"]);
        const placement = PopoverPlacements.parse(rawPlacement, PLACEMENT_DEFAULT);
        const { container, indicator, content } = this.getComponentStyle(style, placement);
        return (<View {...derivedProps} style={container}>
        <Arrow style={indicator}/>
        <View style={content}>
          {children}
        </View>
      </View>);
    }
}
PopoverView.defaultProps = {
    placement: PLACEMENT_DEFAULT.rawValue,
    indicatorOffset: 8,
};
const styles = StyleSheet.create({
    container: {
        alignSelf: 'flex-start',
    },
    content: {
        justifyContent: 'center',
    },
    indicator: {},
});
