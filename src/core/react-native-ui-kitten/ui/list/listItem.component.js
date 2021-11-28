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
import { StyleSheet, TouchableOpacity, View, } from 'react-native';
import { Interaction, styled, } from '../../theme';
import { Text, } from '../text/text.component';
import { isValidString } from '../support/services';
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
export class ListItemComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.onPress = (event) => {
            if (this.props.onPress) {
                this.props.onPress(this.props.index, event);
            }
        };
        this.onPressIn = (event) => {
            this.props.dispatch([Interaction.ACTIVE]);
            if (this.props.onPressIn) {
                this.props.onPressIn(this.props.index, event);
            }
        };
        this.onPressOut = (event) => {
            this.props.dispatch([]);
            if (this.props.onPressOut) {
                this.props.onPressOut(this.props.index, event);
            }
        };
        this.onLongPress = (event) => {
            if (this.props.onLongPress) {
                this.props.onLongPress(this.props.index, event);
            }
        };
        this.getComponentStyle = (source) => {
            // @ts-ignore: will be not executed if `titleStyle` and `descriptionStyle` properties are provided
            const { style, titleStyle, descriptionStyle } = this.props;
            const { iconWidth, iconHeight, iconMarginHorizontal, iconTintColor, titleMarginHorizontal, titleFontSize, titleLineHeight, titleFontWeight, titleColor, descriptionFontSize, descriptionFontWeight, descriptionLineHeight, descriptionColor, descriptionMarginHorizontal, accessoryMarginHorizontal } = source, containerParameters = __rest(source, ["iconWidth", "iconHeight", "iconMarginHorizontal", "iconTintColor", "titleMarginHorizontal", "titleFontSize", "titleLineHeight", "titleFontWeight", "titleColor", "descriptionFontSize", "descriptionFontWeight", "descriptionLineHeight", "descriptionColor", "descriptionMarginHorizontal", "accessoryMarginHorizontal"]);
            return {
                container: Object.assign({}, containerParameters, styles.container, StyleSheet.flatten(style)),
                icon: Object.assign({ width: iconWidth, height: iconHeight, marginHorizontal: iconMarginHorizontal, tintColor: iconTintColor }, styles.icon),
                title: Object.assign({ marginHorizontal: titleMarginHorizontal, fontSize: titleFontSize, lineHeight: titleLineHeight, fontWeight: titleFontWeight, color: titleColor }, styles.title, StyleSheet.flatten(titleStyle)),
                description: Object.assign({ color: descriptionColor, fontSize: descriptionFontSize, fontWeight: descriptionFontWeight, lineHeight: descriptionLineHeight, marginHorizontal: descriptionMarginHorizontal }, styles.description, StyleSheet.flatten(descriptionStyle)),
                accessory: Object.assign({ marginHorizontal: accessoryMarginHorizontal }, styles.accessory),
            };
        };
        this.renderIconElement = (style) => {
            // @ts-ignore: will be not executed if `icon` prop is provided
            const { index, icon } = this.props;
            const iconElement = icon(style, index);
            return React.cloneElement(iconElement, {
                key: 0,
                style: [style, styles.icon, iconElement.props.style],
            });
        };
        this.renderContentElement = (style) => {
            const [titleElement, descriptionElement] = this.renderContentElementChildren(style);
            return (<View key={1} style={styles.contentContainer}>
        {titleElement}
        {descriptionElement}
      </View>);
        };
        this.renderTitleElement = (style) => {
            // @ts-ignore: will be not executed if `title` property is provided
            const { title } = this.props;
            return (<Text key={2} style={style}>
        {title}
      </Text>);
        };
        this.renderDescriptionElement = (style) => {
            // @ts-ignore: will be not executed if `description` property is provided
            const { description } = this.props;
            return (<Text key={3} style={style}>
        {description}
      </Text>);
        };
        this.renderAccessoryElement = (style) => {
            // @ts-ignore: will be not executed if `accessory` property is provided
            const { index, accessory } = this.props;
            const accessoryElement = accessory(style, index);
            return React.cloneElement(accessoryElement, {
                key: 4,
                style: [style, accessoryElement.props.style],
            });
        };
        this.renderContentElementChildren = (style) => {
            // @ts-ignore: will be not executed if any of properties below is provided
            const { title, description } = this.props;
            return [
                isValidString(title) && this.renderTitleElement(style.title),
                isValidString(description) && this.renderDescriptionElement(style.description),
            ];
        };
        this.renderTemplateChildren = (style) => {
            // @ts-ignore: following props could not be provided
            const { icon, title, description, accessory } = this.props;
            return [
                icon && this.renderIconElement(style.icon),
                (title || description) && this.renderContentElement(style),
                accessory && this.renderAccessoryElement(style.accessory),
            ];
        };
        this.renderComponentChildren = (style) => {
            const { children } = this.props;
            return children ? children : this.renderTemplateChildren(style);
        };
    }
    render() {
        const _a = this.props, { themedStyle } = _a, derivedProps = __rest(_a, ["themedStyle"]);
        const _b = this.getComponentStyle(themedStyle), { container } = _b, componentStyles = __rest(_b, ["container"]);
        const componentChildren = this.renderComponentChildren(componentStyles);
        return (<TouchableOpacity activeOpacity={1.0} {...derivedProps} style={container} onPress={this.onPress} onPressIn={this.onPressIn} onPressOut={this.onPressOut} onLongPress={this.onLongPress}>
        {componentChildren}
      </TouchableOpacity>);
    }
}
ListItemComponent.styledComponentName = 'ListItem';
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    icon: {},
    title: {},
    description: {},
    accessory: {},
});
export const ListItem = styled(ListItemComponent);
