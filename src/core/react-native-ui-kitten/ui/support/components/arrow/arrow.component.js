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
import { View, } from 'react-native';
export class Arrow extends React.Component {
    constructor() {
        super(...arguments);
        this.getComponentStyle = (source) => {
            return {
                borderLeftWidth: source.width,
                borderRightWidth: source.width,
                borderBottomWidth: source.height,
                borderBottomColor: source.backgroundColor,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                backgroundColor: 'transparent',
            };
        };
    }
    render() {
        const _a = this.props, { style } = _a, props = __rest(_a, ["style"]);
        const componentStyle = this.getComponentStyle(style);
        return (<View {...props} style={[style, componentStyle]}/>);
    }
}
