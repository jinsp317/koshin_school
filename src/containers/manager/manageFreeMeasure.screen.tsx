import Strings from '@src/assets/strings'
import React from 'react';
import {View, Text} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import {ManageFreeMeasure} from './manageFreeMeasure.component';

export class ManageFreeMeasureScreen extends React.Component<NavigationScreenProps> {

  public render(): React.ReactNode {
    return (
      <ManageFreeMeasure />
    );
  }
}
