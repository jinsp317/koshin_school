/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { MappingProvider, } from '../mapping/mappingProvider.component';
import { ThemeProvider, } from '../theme/themeProvider.component';
export class StyleProvider extends React.PureComponent {
    render() {
        const { styles, theme, children } = this.props;
        return (<MappingProvider styles={styles}>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </MappingProvider>);
    }
}
