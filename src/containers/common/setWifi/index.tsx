import * as React from 'react';
import {
  ActivityIndicator,
  AppRegistry,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { ModalService } from '@src/core/react-native-ui-kitten/theme';
import { ComingSoonModal } from '@src/components/common/comingSoon.modal';


interface Props {
  navigation: any;
}
interface State { }

export class SetWifiScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    setTimeout(() => {
      this._bootstrapAsync();
    }, 1000);
  }
  private comingSoonModalId: string;

  private showComingSoonModal = () => {
    this.comingSoonModalId = ModalService.show(
      <ComingSoonModal
        onCancel={this.hideComingSoonModal}
      />,
      true,
    );
  };

  private hideComingSoonModal = () => {
    ModalService.hide(this.comingSoonModalId);
    this.props.navigation.goBack(null);
  };
  render() {
    return (
      <View style={[styles.container, styles.horizontal]} >
        <ActivityIndicator size="large" color="#b7472a" />
      </View>
    );
  }
  private _bootstrapAsync = async () => {
    this.showComingSoonModal();
  };
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  }
})
