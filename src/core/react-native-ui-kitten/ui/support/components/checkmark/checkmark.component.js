import React from 'react';
import { View, Animated, StyleSheet, } from 'react-native';
export class CheckMark extends React.Component {
    constructor() {
        super(...arguments);
        this.getComponentStyle = (source) => {
            const { width, height, backgroundColor } = source;
            return {
                container: {
                    width: width,
                    height: height,
                },
                // the dependence of the variables was determined experimentally. Changes may be needed later.
                shape: {
                    borderWidth: width * 0.125,
                    borderTopLeftRadius: height * 0.5,
                    borderTopRightRadius: height * 0.5,
                    borderBottomLeftRadius: height * 0.5,
                    borderBottomRightRadius: height * 0.5,
                    borderColor: backgroundColor,
                    backgroundColor: backgroundColor,
                },
                left: {
                    left: width * 0.125,
                    top: width * 0.25,
                    height: height * 0.65,
                },
                right: {
                    right: width * 0.175,
                    height: height * 0.875,
                },
            };
        };
    }
    render() {
        const { style, isAnimated } = this.props;
        const { container, shape, left, right } = this.getComponentStyle(StyleSheet.flatten(style));
        const Component = isAnimated ? Animated.View : View;
        return (<Component style={[container, styles.container]}>
        <Component style={[shape, left, styles.shape, styles.left]}/>
        <Component style={[shape, right, styles.shape, styles.right]}/>
      </Component>);
    }
}
CheckMark.defaultProps = {
    isAnimated: false,
};
const styles = StyleSheet.create({
    container: {
        transform: [{ rotate: '-5deg' }],
    },
    shape: {
        position: 'absolute',
    },
    left: {
        transform: [{ rotate: '-40deg' }, { translateY: 1 }],
    },
    right: {
        transform: [{ rotate: '40deg' }, { translateY: 1 }],
    },
});
