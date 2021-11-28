/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
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
import { ScrollView, StyleSheet, Platform, View, } from 'react-native';
/**
 * Allows flipping through the "pages".
 *
 * @extends React.Component
 *
 * @property {React.ReactElement<any> | React.ReactElement<any>[]} children - Determines children of the component.
 *
 * @property {number} selectedIndex - Determines the index of selected "page".
 *
 * @property {(index: number) => boolean} shouldLoadComponent - Determines loading behavior particular page and can be
 * used for lazy loading.
 *
 * @property {(offset: number) => void} onOffsetChange - Fires on scroll event with current scroll offset.
 *
 * @property {(index: number) => void} onSelect - Fires on "page" select with corresponding index.
 *
 * @property ScrollViewProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import { ViewPager } from 'react-native-ui-kitten';
 *
 * export class ViewPagerShowcase extends React.Component {
 *   public state: State = {
 *      selectedIndex: 0,
 *    };
 *
 *   private onIndexChange = (selectedIndex: number) => {
 *     this.setState({ selectedIndex });
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <ViewPager
 *         selectedIndex={this.state.selectedIndex}
 *         onSelect={this.onIndexChange}>
 *         <View>
 *           <Text>Tab 1</Text>
 *         </View>
 *         <View>
 *           <Text>Tab 2</Text>
 *         </View>
 *         <View>
 *           <Text>Tab 3</Text>
 *         </View>
 *       </ViewPager>
 *     );
 *   }
 * }
 * ```
 *
 * @example Lazy loading usage example
 *
 * ```
 * import React from 'react';
 * import { ViewPager } from 'react-native-ui-kitten';
 *
 * export class ViewPagerShowcase extends React.Component {
 *   public state: State = {
 *      selectedIndex: 0,
 *    };
 *
 *   private onIndexChange = (selectedIndex: number) => {
 *     this.setState({ selectedIndex });
 *   };
 *
 *   private shouldLoadPageContent = (index: number): boolean => {
 *     return index === this.state.selectedIndex;
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <ViewPager
 *         selectedIndex={this.state.selectedIndex}
 *         shouldLoadComponent={this.shouldLoadPageContent}
 *         onSelect={this.onIndexChange}>
 *         <View>
 *           <Text>Tab 1</Text>
 *         </View>
 *         <View>
 *           <Text>Tab 2</Text>
 *         </View>
 *         <View>
 *           <Text>Tab 3</Text>
 *         </View>
 *       </ViewPager>
 *     );
 *   }
 * }
 * ```
 */
export class ViewPager extends React.Component {
    constructor() {
        super(...arguments);
        this.scrollViewRef = React.createRef();
        this.contentWidth = 0;
        this.scrollToOffsetIOS = (params) => {
            const { offset } = params, rest = __rest(params, ["offset"]);
            const { current: scrollView } = this.scrollViewRef;
            scrollView.scrollTo(Object.assign({ x: offset }, rest));
        };
        this.scrollToOffsetAndroid = (params) => {
            this.scrollToOffsetIOS(params);
            this.dispatchOnSelect(params.offset);
        };
        this.dispatchOnSelect = (offset) => {
            const selectedIndex = offset / this.contentWidth;
            if (selectedIndex !== this.props.selectedIndex && this.props.onSelect) {
                this.props.onSelect(Math.round(selectedIndex));
            }
        };
        this.onScroll = (event) => {
            if (this.props.onOffsetChange) {
                const { x: offset } = event.nativeEvent.contentOffset;
                this.props.onOffsetChange(offset);
            }
        };
        this.onScrollEnd = (event) => {
            const { x: offset } = event.nativeEvent.contentOffset;
            this.dispatchOnSelect(offset);
        };
        this.onLayout = (event) => {
            const { width } = event.nativeEvent.layout;
            this.contentWidth = width;
            if (this.props.onLayout) {
                this.props.onLayout(event);
            }
        };
        this.renderComponentChild = (element, index) => {
            const { shouldLoadComponent, contentContainerStyle } = this.props;
            const contentView = shouldLoadComponent(index) ? element : null;
            return React.createElement(View, {
                key: index,
                style: [styles.contentViewContainer, contentContainerStyle],
            }, contentView);
        };
        this.renderComponentChildren = (source) => {
            return React.Children.map(source, this.renderComponentChild);
        };
    }
    shouldComponentUpdate(nextProps) {
        return this.props.selectedIndex !== nextProps.selectedIndex;
    }
    scrollToIndex(params) {
        const { index } = params, rest = __rest(params, ["index"]);
        const offset = this.contentWidth * index;
        this.scrollToOffset(Object.assign({ offset }, rest));
    }
    scrollToOffset(params) {
        // Regularly we trigger onSelect when `onMomentumScrollEnd` is triggered, but
        // there is an issue: https://github.com/facebook/react-native/issues/21718
        const selector = Platform.select({
            ios: this.scrollToOffsetIOS,
            android: this.scrollToOffsetAndroid,
        });
        selector(params);
    }
    render() {
        const _a = this.props, { contentContainerStyle, children } = _a, derivedProps = __rest(_a, ["contentContainerStyle", "children"]);
        const componentChildren = this.renderComponentChildren(children);
        const widthPercent = 100 * componentChildren.length;
        return (<ScrollView bounces={false} contentContainerStyle={{ width: `${widthPercent}%` }} showsHorizontalScrollIndicator={false} {...derivedProps} ref={this.scrollViewRef} scrollEventThrottle={16} horizontal={true} pagingEnabled={true} onScroll={this.onScroll} onMomentumScrollEnd={this.onScrollEnd} onLayout={this.onLayout}>
        {componentChildren}
      </ScrollView>);
    }
}
ViewPager.defaultProps = {
    selectedIndex: 0,
    shouldLoadComponent: () => true,
};
const styles = StyleSheet.create({
    contentViewContainer: {
        flex: 1,
        width: '100%',
    },
});
