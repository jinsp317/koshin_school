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
import { FlatList, StyleSheet, } from 'react-native';
import { styled, } from '../../theme';
/**
 * List component is a performant interface for rendering simple, flat lists. Extends `FlatList`. Renders list of
 * `ListItem` components or custom content.
 *
 * @extends React.Component
 *
 * @property {(info: ListRenderItemInfo<ItemT>, style: StyleType) => React.ReactElement<any>} renderItem - Takes an
 * item from data and renders it into the list.
 *
 * @property FlatListProps<ItemType>
 *
 * @property StyledComponentProps
 *
 * @example With ListItem example
 *
 * ```
 * import React from 'react';
 * import { ListRenderItemInfo } from 'react-native';
 * import {
 *   List,
 *   ListItem,
 * } from 'react-native-ui-kitten';
 *
 * export const ListShowcase = (props?: ListProps): React.ReactElement<ListProps> => {
 *
 *   private data: string[] = [
 *     'Item 1',
 *     'Item 2',
 *     'Item 3',
 *   ];
 *
 *   private onItemPress = (index: number) => {
 *     // Handle item press
 *   };
 *
 *   private renderItem = (info: ListRenderItemInfo<ListItemModel>): React.ReactElement<ListItemProps> => {
 *     return (
 *       <ListItem
 *         title={`${info.item}`}
 *         description='Description'
 *         onPress={onItemPress}
 *       />
 *     );
 *   };
 *
 *   return (
 *     <List
 *       data={data}
 *       renderItem={renderItem}
 *     />
 *   );
 * };
 * ```
 *
 * @example With Custom ListItem example
 *
 * ```
 * import React from 'react';
 * import { ListRenderItemInfo } from 'react-native';
 * import {
 *   List,
 *   ListItem,
 * } from 'react-native-ui-kitten';
 * import { CustomListItemView } from './path-to/custom-list-item-view';
 *
 * export const ListShowcase = (props?: ListProps): React.ReactElement<ListProps> => {
 *
 *   const data: string[] = [
 *      ...
 *   ];
 *
 *   const onItemPress = (index: number) => {
 *     // Handle List Item press
 *   };
 *
 *   const renderItem = (info: ListRenderItemInfo<ListItemModel>): React.ReactElement<ListItemProps> => {
 *     return (
 *       <ListItem onPress={onItemPress}>
 *         <CustomListItem/>
 *       </ListItem>
 *     );
 *   };=
 *
 *   return (
 *     <List
 *       data={data}
 *       renderItem={renderItem}
 *     />
 *   );
 * };
 * ```
 * */
class ListComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.listRef = React.createRef();
        this.scrollToEnd = (params) => {
            const { current: list } = this.listRef;
            list.scrollToEnd(params);
        };
        this.scrollToIndex = (params) => {
            const { current: list } = this.listRef;
            list.scrollToIndex(params);
        };
        this.getComponentStyle = (source) => {
            const { style } = this.props;
            return Object.assign({}, source, styles.container, StyleSheet.flatten(style));
        };
        this.getItemStyle = (source, index) => {
            const { item } = source;
            return item;
        };
        this.keyExtractor = (item, index) => {
            return index.toString();
        };
        this.renderItem = (info) => {
            const itemStyle = this.getItemStyle(this.props.themedStyle, info.index);
            const itemElement = this.props.renderItem(info, itemStyle);
            return React.cloneElement(itemElement, {
                style: [itemStyle, styles.item, itemElement.props.style],
                index: info.index,
            });
        };
    }
    scrollToOffset(params) {
        const { current: list } = this.listRef;
        list.scrollToOffset(params);
    }
    render() {
        const _a = this.props, { style, themedStyle } = _a, derivedProps = __rest(_a, ["style", "themedStyle"]);
        const componentStyle = this.getComponentStyle(themedStyle);
        return (<FlatList {...derivedProps} ref={this.listRef} style={componentStyle} keyExtractor={this.keyExtractor} renderItem={this.renderItem}/>);
    }
}
ListComponent.styledComponentName = 'List';
const styles = StyleSheet.create({
    container: {},
    item: {},
});
export const List = styled(ListComponent);
