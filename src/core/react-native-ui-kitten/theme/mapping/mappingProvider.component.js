import React from 'react';
import { MappingContext } from './mappingContext';
export class MappingProvider extends React.PureComponent {
    render() {
        const { styles, children } = this.props;
        return (<MappingContext.Provider value={styles}>
        {children}
      </MappingContext.Provider>);
    }
}
