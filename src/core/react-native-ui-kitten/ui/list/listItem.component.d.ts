/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ImageProps, StyleProp, TextStyle, TouchableOpacityProps } from 'react-native';
import { StyledComponentProps, StyleType } from '../../theme';
import { TouchableIndexedProps } from '../support/typings';
declare type IconElement = React.ReactElement<ImageProps>;
declare type AccessoryElement = React.ReactElement<any>;
declare type IconProp = (style: StyleType, index: number) => IconElement;
declare type AccessoryProp = (style: StyleType, index: number) => AccessoryElement;
interface ListDerivedProps {
    index?: number;
}
interface TemplateBaseProps {
    icon?: IconProp;
    accessory?: AccessoryProp;
}
interface TemplateTitleProps extends TemplateBaseProps {
    title: string;
    description?: string;
    titleStyle?: StyleProp<TextStyle>;
}
interface TemplateDescriptionProps extends TemplateBaseProps {
    title?: string;
    description: string;
    descriptionStyle?: StyleProp<TextStyle>;
}
interface CustomContentProps {
    children?: React.ReactNode;
}
declare type ComponentProps = (TemplateTitleProps | TemplateDescriptionProps | CustomContentProps) & ListDerivedProps;
export declare type ListItemProps = StyledComponentProps & TouchableIndexedProps & ComponentProps;
/**
 * ListItem is a support component for List.
 * The key feature of wrapping custom list items into ListItem component is that it automatically
 * picks background color fitting to current theme and responds to touches with feedback.
 *
 * @extends React.Component
 *
 * @property {string} title - Determines the title of the ListItem.
 *
 * @property {string} description - Determines the description of the ListItem's title.
 *
 * @property {StyleProp<TextStyle>} titleStyle - Customizes title style.
 *
 * @property {StyleProp<TextStyle>} descriptionStyle - Customizes description style.
 *
 * @property {React.ReactNode} children - Determines React Children of the component.
 *
 * @property {(style: StyleType, index: number) => React.ReactElement<any>} accessory - Determines the accessory of the
 * component.
 *
 * @property {(style: StyleType, index: number) => React.ReactElement<ImageProps>} icon - Determines the icon of the
 * component.
 *
 * @property {(index: number, event: GestureResponderEvent) => React.ReactElement<ImageProps>} onPress - Emits when
 * component is pressed.
 *
 * @example ListItem title and description template example
 *
 * ```
 * import React from 'react'
 * import { ListItem, ListItemProps } from 'react-native-ui-kitten';
 *
 * export const ListItemShowcase = (props?: ListItemProps): React.ReactElement<ListItemProps> => {
 *
 *   return (
 *     <ListItem
 *       title='Title'
 *       description='Description'
 *     />
 *   );
 *  };
 * ```
 *
 * @example ListItem icon template example
 *
 * ```
 * import React from 'react'
 * import { Image, ImageProps } from 'react-native'
 * import { ListItem, ListItemProps, StyleType } from 'react-native-ui-kitten';
 *
 * export const ListItemShowcase = (props?: ListItemProps): React.ReactElement<ListItemProps> => {
 *
 *   const Icon = (style: StyleType): React.ReactElement<ImageProps> => {
 *     return (
 *       <Image style={style} source={{uri: 'https://path-to/awesome-image.png'}}/>
 *     );
 *   };
 *
 *   return (
 *     <ListItem
 *       title='Title'
 *       description='Description'
 *       icon={Icon}
 *     />
 *   );
 *  };
 * ```
 *
 * @example ListItem accessory template example
 *
 * ```
 * import React from 'react'
 * import { ListItem, ListItemProps, Button, ButtonProps, StyleType } from 'react-native-ui-kitten';
 *
 * export const ListItemShowcase = (props?: ListItemProps): React.ReactElement<ListItemProps> => {
 *
 *   const Accessory = (style: StyleType): React.ReactElement<ButtonProps> => {
 *     return (
 *       <Button style={style}>BUTTON</Button>
 *     );
 *   };
 *
 *   return (
 *     <ListItem
 *       title='Title'
 *       description='Description'
 *       accessory={Accessory}
 *     />
 *   );
 * };
 * ```
 *
 * @example Inline styling example
 *
 * ```
 * import React from 'react'
 * import { ListItem, ListItemProps } from 'react-native-ui-kitten';
 *
 * export const ListItemShowcase = (props?: ListItemProps): React.ReactElement<ListItemProps> => {
 *
 *   return (
 *     <ListItem
 *       style={styles.listItem}
 *       titleStyle={styles.listItemTitle}
 *       descriptionStyle={styles.listItemDescription}
 *       title='Title'
 *       description='Description'
 *     />
 *   );
 * };
 * ```
 * */
export declare class ListItemComponent extends React.Component<ListItemProps> {
    static styledComponentName: string;
    private onPress;
    private onPressIn;
    private onPressOut;
    private onLongPress;
    private getComponentStyle;
    private renderIconElement;
    private renderContentElement;
    private renderTitleElement;
    private renderDescriptionElement;
    private renderAccessoryElement;
    private renderContentElementChildren;
    private renderTemplateChildren;
    private renderComponentChildren;
    render(): React.ReactElement<TouchableOpacityProps>;
}
export declare const ListItem: React.ComponentClass<ListItemProps, any>;
export {};
