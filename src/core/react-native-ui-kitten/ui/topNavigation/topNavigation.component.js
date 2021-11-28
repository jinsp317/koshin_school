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
import { StyleSheet, View, } from 'react-native';
import { styled, } from '../../theme';
import { Text, } from '../text/text.component';
import { isValidString } from '../support/services';
/**
 * TopNavigation component is designed to be a Navigation Bar.
 * Can be used for navigation.
 *
 * @extends React.Component
 *
 * @property {string} title - Determines the title of the component.
 *
 * @property {string} subtitle - Determines the subtitle of the component.
 *
 * @property {string} alignment - Determines the alignment of the component.
 * Can be `center` or `start`.
 *
 * @property {React.ReactElement<TopNavigationActionProps>} leftControl - Determines the left control
 * of the component.
 *
 * @property {React.ReactElement<TopNavigationActionProps>[]} rightControls - Determines the right controls
 * of the component.
 *
 * @property {StyleProp<TextStyle>} titleStyle - Customizes text style of title.
 *
 * @property {StyleProp<TextStyle>} subtitleStyle - Customizes text style of subtitle.
 *
 * @property ViewProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import {
 *   TopNavigation,
 *   TopNavigationAction,
 *   TopNavigationActionProps,
 * } from 'react-native-ui-kitten';
 *
 * export const TopNavigationShowcase = (props?: TopNavigationProps): React.ReactElement<TopNavigationProps> => {
 *   return (
 *     <TopNavigation title='Title' />
 *   );
 * };
 * ```
 *
 * @example Actions usage example
 *
 * ```
 * import React from 'react';
 * import { Image, ImageProps } from 'react-native';
 * import {
 *   TopNavigation,
 *   TopNavigationAction,
 *   TopNavigationActionProps,
 * } from 'react-native-ui-kitten';
 *
 * export const TopNavigationShowcase = (props?: TopNavigationProps): React.ReactElement<TopNavigationProps> => {
 *
 *   private onLeftControlPress = () => {
 *     // Handle Left Control press
 *   };
 *
 *   const renderControlIcon = (style: StyleType): React.ReactElement<ImageProps> => {
 *     return (
 *       <Image
 *         style={style}
 *         source={{uri: 'https://path-to/awesome-image.png'}}
 *       />
 *     );
 *   };
 *
 *   const renderLeftControl = (): React.ReactElement<TopNavigationActionProps> => {
 *     return (
 *       <TopNavigationAction
 *         icon={this.renderControlIcon}
 *         onPress={this.onLeftControlPress}
 *       />
 *     );
 *   };
 *
 *   return (
 *     <TopNavigation
 *       title='Title'
 *       leftControl={this.renderLeftControl()}
 *     />
 *   );
 * };
 * ```
 *
 * @example Inline styling example
 *
 * ```
 * import React from 'react';
 * import { TopNavigation, TopNavigationProps } from 'react-native-ui-kitten';
 *
 * export const TopNavigationShowcase = (props?: TopNavigationProps): React.ReactElement<TopNavigationProps> => {
 *   return (
 *     <TopNavigation
 *       title='Title'
 *       subtitle='Subtitle'
 *       titleStyle={styles.title}
 *       subtitleStyle={styles.subtitle}
 *     />
 *   );
 * };
 * ```
 * */
export class TopNavigationComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.getAlignmentDependentStyles = () => {
            const { alignment } = this.props;
            if (alignment === 'center') {
                return {
                    container: styles.containerCentered,
                    titleContainer: styles.titleContainerCentered,
                };
            }
            else {
                return {
                    rightControlsContainer: styles.rightControlsContainerStart,
                };
            }
        };
        this.getComponentStyle = (source) => {
            const { style, titleStyle, subtitleStyle, } = this.props;
            const { titleTextAlign, titleFontSize, titleLineHeight, titleFontWeight, titleColor, subtitleTextAlign, subtitleFontSize, subtitleLineHeight, subtitleFontWeight, subtitleColor } = source, containerStyle = __rest(source, ["titleTextAlign", "titleFontSize", "titleLineHeight", "titleFontWeight", "titleColor", "subtitleTextAlign", "subtitleFontSize", "subtitleLineHeight", "subtitleFontWeight", "subtitleColor"]);
            const alignmentDependentStyles = this.getAlignmentDependentStyles();
            return {
                container: Object.assign({}, containerStyle, styles.container, alignmentDependentStyles.container, StyleSheet.flatten(style)),
                titleContainer: Object.assign({}, styles.titleContainer, alignmentDependentStyles.titleContainer),
                title: Object.assign({ textAlign: titleTextAlign, fontSize: titleFontSize, lineHeight: titleLineHeight, fontWeight: titleFontWeight, color: titleColor }, styles.title, StyleSheet.flatten(titleStyle)),
                subtitle: Object.assign({ textAlign: subtitleTextAlign, fontSize: subtitleFontSize, color: subtitleColor, fontWeight: subtitleFontWeight, lineHeight: subtitleLineHeight }, styles.subtitle, StyleSheet.flatten(subtitleStyle)),
                leftControlContainer: styles.leftControlContainer,
                rightControlsContainer: Object.assign({}, styles.rightControlsContainer, alignmentDependentStyles.rightControlsContainer),
            };
        };
        this.renderTextElement = (text, style) => {
            return (<Text style={style}>
        {text}
      </Text>);
        };
        this.renderComponentChildren = (style) => {
            const { title, subtitle, leftControl, rightControls } = this.props;
            return [
                isValidString(title) && this.renderTextElement(title, style.title),
                isValidString(subtitle) && this.renderTextElement(subtitle, style.subtitle),
                leftControl && this.renderActionElements(leftControl),
                rightControls && this.renderActionElements(rightControls),
            ];
        };
    }
    renderActionElements(source) {
        return React.Children.map(source, (element, index) => {
            return React.cloneElement(element, {
                key: index,
            });
        });
    }
    render() {
        const _a = this.props, { style, themedStyle } = _a, restProps = __rest(_a, ["style", "themedStyle"]);
        const _b = this.getComponentStyle(themedStyle), { container, leftControlContainer, titleContainer, rightControlsContainer } = _b, componentStyles = __rest(_b, ["container", "leftControlContainer", "titleContainer", "rightControlsContainer"]);
        const [titleElement, subtitleElement, leftControlElement, rightControlElements,] = this.renderComponentChildren(componentStyles);
        return (<View style={[container, style]} {...restProps}>
        <View style={leftControlContainer}>
          {leftControlElement}
        </View>
        <View style={titleContainer}>
          {titleElement}
          {subtitleElement}
        </View>
        <View style={rightControlsContainer}>
          {rightControlElements}
        </View>
      </View>);
    }
}
TopNavigationComponent.styledComponentName = 'TopNavigation';
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    containerCentered: {
        justifyContent: 'space-between',
    },
    titleContainer: {},
    titleContainerCentered: Object.assign({}, StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }),
    title: {},
    subtitle: {},
    leftControlContainer: {
        flexDirection: 'row',
        zIndex: 1,
    },
    rightControlsContainer: {
        flexDirection: 'row',
        zIndex: 1,
    },
    rightControlsContainerStart: {
        flex: 1,
        justifyContent: 'flex-end',
    },
});
export const TopNavigation = styled(TopNavigationComponent);
