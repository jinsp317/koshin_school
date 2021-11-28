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
import { Animated, Easing, StyleSheet, } from 'react-native';
export class TabIndicator extends React.Component {
    constructor() {
        super(...arguments);
        this.contentOffset = new Animated.Value(0);
        this.onContentOffsetAnimationStateChanged = (state) => {
            // no-op
        };
        this.onContentOffsetAnimationStateEnd = (result) => {
            // no-op
        };
        this.createOffsetAnimation = (params) => {
            const animationDuration = params.animated ? this.props.animationDuration : 0;
            return Animated.timing(this.contentOffset, {
                toValue: params.offset,
                duration: animationDuration,
                easing: Easing.linear,
            });
        };
        this.onLayout = (event) => {
            this.indicatorWidth = event.nativeEvent.layout.width;
            this.scrollToOffset({
                offset: this.indicatorWidth * this.props.selectedPosition,
            });
        };
        this.getComponentStyle = (source) => {
            const { style, positions } = this.props;
            const widthPercent = 100 / positions;
            return Object.assign({}, source, StyleSheet.flatten(style), { width: `${widthPercent}%`, transform: [{ translateX: this.contentOffset }] });
        };
    }
    componentDidMount() {
        this.contentOffset.addListener(this.onContentOffsetAnimationStateChanged);
    }
    shouldComponentUpdate(nextProps) {
        return this.props.selectedPosition !== nextProps.selectedPosition;
    }
    componentDidUpdate() {
        const { selectedPosition: index } = this.props;
        this.scrollToIndex({
            index,
            animated: true,
        });
    }
    componentWillUnmount() {
        this.contentOffset.removeAllListeners();
    }
    /**
     * scrolls indicator to passed index
     *
     * @param params (object) - {
     *  index: number,
     *  animated: boolean | undefined
     * }
     */
    scrollToIndex(params) {
        const { index } = params, rest = __rest(params, ["index"]);
        const offset = this.indicatorWidth * index;
        this.scrollToOffset(Object.assign({ offset }, rest));
    }
    /**
     * scrolls indicator to passed offset
     *
     * @param params (object) - {
     *  offset: number,
     *  animated: boolean | undefined
     * }
     */
    scrollToOffset(params) {
        this.createOffsetAnimation(params).start(this.onContentOffsetAnimationStateEnd);
    }
    render() {
        const componentStyle = this.getComponentStyle(this.props.style);
        return (<Animated.View {...this.props} onLayout={this.onLayout} style={componentStyle}/>);
    }
}
TabIndicator.defaultProps = {
    selectedPosition: 0,
    animationDuration: 200,
};
