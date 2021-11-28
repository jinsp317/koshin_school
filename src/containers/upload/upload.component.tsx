import Strings from "@src/assets/strings";
import React from "react";
import {
  ThemedComponentProps,
  ThemeProvider,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { Tab, TabProps, TabView, TabViewProps } from "@src/core/react-native-ui-kitten/ui";
import { GridIconOutline, ListIconFill } from "@src/assets/icons";
import { UploadList } from "./uploadList.component";
import { UploadListItemModel, HospitalModel } from "@src/core/model";
import { themes } from "@src/core/themes";
import commonStyles from "@src/containers/styles/common";
import { FlatList, TouchableHighlight, View } from "react-native";
import { UploadListItem } from "./uploadListItem.component";

// @ts-ignore (override `children` prop)
interface ComponentProps extends TabViewProps {
  data: UploadListItemModel[];
  onItemPress: (item: UploadListItemModel) => void;
  onItemLongPress?: (item: UploadListItemModel) => void;
  children?: ChildrenProp;
  onRefresh: () => void;
  isLoading: boolean;
  hospitalInfo: HospitalModel;
}

export type UploadProps = ThemedComponentProps & ComponentProps;

type ChildElement = React.ReactElement<UploadProps>;
type ChildrenProp = ChildElement | ChildElement[];

class UploadComponent extends React.Component<UploadProps> {
  public state = {
    headerDataLoading: false,
    data: this.props.data
  };
  componentDidMount() {
    this.setState({ headerDataLoading: this.props.isLoading });
  }
  componentWillReceiveProps(nextProps: UploadProps) {
    this.setState({ headerDataLoading: nextProps.isLoading, data: nextProps.data });
  }

  private onItemPress = (item: UploadListItemModel) => {
    this.props.onItemPress(item);
  };
  private onItemLongPress = (item: UploadListItemModel) => {
    this.props.onItemLongPress(item);
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
        onLongPress={() => this.onItemLongPress(item)}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
      >
        <UploadListItem data={item} hospitalInfo={this.props.hospitalInfo} />
      </TouchableHighlight>
    );
  };
  ListViewItemSeparator = () => {
    return <View style={{ height: 3, width: "100%", backgroundColor: "transparent" }} />;
  };
  public render(): React.ReactNode {
    const { themedStyle, data, ...restProps } = this.props;

    return (
      <ThemeProvider theme={{ ...this.props.theme, ...themes["App Theme"] }}>
        <TabView {...restProps} style={themedStyle.tabContainer}>
          <Tab title={Strings.menu.upload_wait} titleStyle={commonStyles.tabTitleNormal}>
            <FlatList
              style={[themedStyle.contentContainer]}
              data={this.state.data}
              ItemSeparatorComponent={this.ListViewItemSeparator}
              keyExtractor={(item, index) => index.toString()}
              initialNumToRender={20}
              renderItem={({ item, index, separators }) => this.renderItem(item, index, separators)}
              refreshing={this.state.headerDataLoading}
              onRefresh={this.onRefresh}
            />
          </Tab>
          <Tab title={Strings.menu.upload_failed} titleStyle={commonStyles.tabTitleNormal}>
            <FlatList
              style={[themedStyle.contentContainer]}
              data={[]}
              ItemSeparatorComponent={this.ListViewItemSeparator}
              keyExtractor={(item, index) => index.toString()}
              initialNumToRender={20}
              renderItem={({ item, index, separators }) => this.renderItem(item, index, separators)}
            />
          </Tab>
        </TabView>
      </ThemeProvider>
    );
  }
}

export const Upload = withStyles(UploadComponent, (theme: ThemeType) => ({
  tabContainer: {
    flex: 1,
    backgroundColor: theme["mycolor-lightgray"]
  },

  listContentContainer: {
    paddingHorizontal: 3,
    paddingVertical: 3
  },
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
