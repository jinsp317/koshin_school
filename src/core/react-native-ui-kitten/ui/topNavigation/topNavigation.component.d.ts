/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { StyleProp, TextStyle, ViewProps } from 'react-native';
import { StyledComponentProps } from '../../theme';
import { TopNavigationActionProps } from './topNavigationAction.component';
declare type ActionElement = React.ReactElement<TopNavigationActionProps>;
declare type ActionElementProp = ActionElement | ActionElement[];
interface ComponentProps {
    title?: string;
    titleStyle?: StyleProp<TextStyle>;
    subtitle?: string;
    subtitleStyle?: StyleProp<TextStyle>;
    alignment?: 'start' | 'center';
    leftControl?: ActionElement;
    rightControls?: ActionElementProp;
}
export declare type TopNavigationProps = StyledComponentProps & ViewProps & ComponentProps;
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
export declare class TopNavigationComponent extends React.Component<TopNavigationProps> {
    static styledComponentName: string;
    private getAlignmentDependentStyles;
    private getComponentStyle;
    private renderTextElement;
    private renderActionElements;
    private renderComponentChildren;
    render(): React.ReactNode;
}
export declare const TopNavigation: React.ComponentClass<TopNavigationProps, any>;
export {};
