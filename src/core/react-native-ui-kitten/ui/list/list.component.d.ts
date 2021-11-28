/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { FlatListProps, ListRenderItemInfo } from 'react-native';
import { StyledComponentProps, StyleType } from '../../theme';
declare type ItemType = any;
declare type ListItemElement = React.ReactElement<any>;
declare type RenderItemProp = (info: ListRenderItemInfo<ItemType>, style: StyleType) => ListItemElement;
interface ComponentProps {
    renderItem: RenderItemProp;
}
export declare type ListProps = StyledComponentProps & FlatListProps<ItemType> & ComponentProps;
export declare const List: React.ComponentClass<ListProps, any>;
export {};
