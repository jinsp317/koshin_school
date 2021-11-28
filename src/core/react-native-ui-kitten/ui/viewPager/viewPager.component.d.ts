/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ScrollViewProps } from 'react-native';
declare type ChildElement = React.ReactElement<any>;
declare type ChildrenProp = ChildElement | ChildElement[];
interface ComponentProps {
    children: ChildrenProp;
    selectedIndex?: number;
    shouldLoadComponent?: (index: number) => boolean;
    onOffsetChange?: (offset: number) => void;
    onSelect?: (index: number) => void;
}
export declare type ViewPagerProps = ScrollViewProps & ComponentProps;
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
export declare class ViewPager extends React.Component<ViewPagerProps> {
    static defaultProps: Partial<ViewPagerProps>;
    private scrollViewRef;
    private contentWidth;
    shouldComponentUpdate(nextProps: ViewPagerProps): boolean;
    scrollToIndex(params: {
        index: number;
        animated?: boolean;
    }): void;
    scrollToOffset(params: {
        offset: number;
        animated?: boolean;
    }): void;
    private scrollToOffsetIOS;
    private scrollToOffsetAndroid;
    private dispatchOnSelect;
    private onScroll;
    private onScrollEnd;
    private onLayout;
    private renderComponentChild;
    private renderComponentChildren;
    render(): React.ReactNode;
}
export {};
