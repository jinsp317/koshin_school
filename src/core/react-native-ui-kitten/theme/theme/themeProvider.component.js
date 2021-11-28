/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import React from 'react';
import { ThemeContext } from './themeContext';
export class ThemeProvider extends React.PureComponent {
    render() {
        const { theme, children } = this.props;
        return (<ThemeContext.Provider value={theme}>
        {children}
      </ThemeContext.Provider>);
    }
}
