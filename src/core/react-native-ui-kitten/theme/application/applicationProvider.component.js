/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import merge from 'lodash.merge';
import { SchemaProcessor } from '@eva-design/processor';
import { StyleProvider } from '../style/styleProvider.component';
import { ModalPanel } from '../modal/modalPanel.component';
/**
 * ApplicationProvider component is designed to be a root of the application.
 *
 * This does basically two things:
 * - Provides styles for basic components;
 * - Renders modal window which is used to be common for all elements presented as modal;
 *
 * @extends React.Component
 *
 * @property {SchemaType} mapping - Determines the mapping for basic components.
 * This is designed to be provided by developers team and can be imported from npm package (e.g. `@eva-design/eva`).
 *
 * @property {CustomSchemaType} customMapping - Determines the customization mapping.
 * This is merged with `mapping` property and designed to be used components customization.
 *
 * @property {ThemeType} theme - Determines the theme for basic components.
 * This is designed to be provided by developers team and can be imported from npm package (e.g. `@eva-design/eva`).
 *
 * @property {React.ReactNode} children - Determines application root component.
 *
 * @property ThemeProviderProps
 *
 * @example ApplicationProvider API example
 *
 * ```
 * import React from 'react';
 * import { mapping, theme } from '@eva-design/eva';
 * import { ApplicationProvider } from 'react-native-ui-kitten';
 * import { Application } from './path-to/root.component';
 *
 * export default class App extends React.Component {
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <ApplicationProvider
 *         mapping={mapping}
 *         theme={theme}>
 *         <Application/>
 *       </ApplicationProvider>
 *     );
 *   }
 * }
 * ```
 */
export class ApplicationProvider extends React.Component {
    constructor(props) {
        super(props);
        this.schemaProcessor = new SchemaProcessor();
        this.createStyles = (mapping, custom) => {
            const customizedMapping = merge({}, mapping, custom);
            return this.schemaProcessor.process(customizedMapping);
        };
        const { mapping, customMapping, theme } = this.props;
        const styles = this.createStyles(mapping, customMapping);
        this.state = { styles };
    }
    render() {
        return (<StyleProvider theme={this.props.theme} styles={this.state.styles}>
        <ModalPanel>
          {this.props.children}
        </ModalPanel>
      </StyleProvider>);
    }
}
