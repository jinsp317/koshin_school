import React from "react";
import {
  Button,
  OverflowMenu,
  OverflowMenuProps,
  OverflowMenuItemType
} from "@src/core/react-native-ui-kitten/ui";
import { StarIconFill } from "@src/assets/icons";
import { StyleSheet } from "react-native";
import GLOBAL from "@src/core/globals";

interface OverflowMenuShowcaseComponentState {
  visible: boolean;
  selectIndex: number | undefined;
}
interface ComponentProps {
  items1: OverflowMenuItemType[];
  onItemSelect1: (index: number) => void;
  selectIndex?: number;
}
type Props = ComponentProps & OverflowMenuProps;
export class OverflowMenuShowcase extends React.Component<
  Props,
  OverflowMenuShowcaseComponentState
> {
  static defaultProps: Partial<OverflowMenuProps> = {
    visible: false
  };

  public state: OverflowMenuShowcaseComponentState = {
    visible: this.props.visible,
    selectIndex: GLOBAL.curSearchUserIndex
  };

  private onRequestClose = () => {
    this.setState({ visible: false });
  };

  private onItemSelect = (index: number, event: any) => {
    GLOBAL.curSearchUserIndex = index;
    this.setState({ visible: false, selectIndex: index }, () => {
      this.props.onItemSelect1(index);
    });
  };

  private onButtonPress = () => {
    this.setState({ visible: true });
  };

  public render(): React.ReactElement<OverflowMenuProps> {
    return (
      <OverflowMenu
        style={styles.container}
        visible={this.state.visible}
        items={this.props.items1}
        onSelect={(i, e) => this.onItemSelect(i, e)}
        onRequestClose={this.onRequestClose}
      >
        <Button
          onPress={this.onButtonPress}
          size="small"
          //          appearance="outline"
          style={{
            borderWidth: 0.5,
            borderColor: "white",
            borderRadius: 10,
            width: 100
          }}
        >{`${
          this.state.selectIndex
            ? this.props.items1[this.state.selectIndex].text
            : this.props.items1[0].text
        } ▼`}</Button>
      </OverflowMenu>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 120
  }
});
