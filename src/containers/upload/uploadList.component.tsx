import React from "react";
import { TouchableHighlight, FlatList, View } from "react-native";
import {
  withStyles,
  ThemeType,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import { UploadListItem } from "./uploadListItem.component";
import { UploadListItemModel } from "@src/core/model";
// @ts-ignore (override `renderItem` prop)
interface ComponentProps {
  data: UploadListItemModel[];
  onItemPress: (item: UploadListItemModel) => void;
  onItemLongPress: (item: UploadListItemModel) => void;
  onRefresh: () => void;
  isLoading: boolean;
}
interface State {
  headerDataLoading: boolean;
}
type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      headerDataLoading: props.isLoading
    };
  }

  componentDidMount() {
    this.setState({ headerDataLoading: this.props.isLoading });
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ headerDataLoading: nextProps.isLoading });
  }
  private onItemPress = (item: UploadListItemModel) => {
    this.props.onItemPress(item);
  };

  onRefresh = () => {
    if (!this.state.headerDataLoading) {
      this.setState({ headerDataLoading: true }, () => this.props.onRefresh());
    }
  };
  private renderItem = (item, index, separators) => {
    const { themedStyle, data } = this.props;
    return (
      <TouchableHighlight
        onPress={() => this.onItemPress(item)}
        onLongPress={() => this.props.onItemLongPress(item)}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
      >
        <UploadListItem data={item} />
      </TouchableHighlight>
    );
  };
  ListViewItemSeparator = () => {
    return <View style={{ height: 3, width: "100%", backgroundColor: "transparent" }} />;
  };
  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;
    const { headerDataLoading } = this.state;

    return (
      <FlatList
        style={[themedStyle.contentContainer]}
        {...restProps}
        data={data}
        ItemSeparatorComponent={this.ListViewItemSeparator}
        keyExtractor={(item, index) => index.toString()}
        initialNumToRender={20}
        renderItem={({ item, index, separators }) => this.renderItem(item, index, separators)}
        refreshing={this.state.headerDataLoading}
        onRefresh={this.onRefresh}
      />
    );
  }
}

export const UploadList = withStyles(MyComponent, (theme: ThemeType) => ({
  contentContainer: {
    paddingHorizontal: 3,
    paddingTop: 3,
    paddingBottom: 43
  },

  item: {
    marginVertical: 3,
    marginHorizontal: 3
  }
}));
