import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  FlatList,
  Dimensions,
  TouchableHighlight,
  TouchableOpacity,
  NativeModules,
  Animated,
  Alert,
  TextInput
} from "react-native";
const { width } = Dimensions.get("window");
import { withStyles, ThemeType, ThemedComponentProps } from "@src/core/react-native-ui-kitten/theme";
import { Text, Button } from "@src/core/react-native-ui-kitten/ui";
import { PatientModel } from "@src/core/model";
import * as UTILS from "@src/core/app_utils";
import ProgressBar from "@src/components/common/progressBar.component";
import { PatientsOutHospitalListItem } from "./patientsOutHospitalListItem.component";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import { MyTextInput } from "@src/components/common";
import { SearchIconFill } from "@src/assets/icons";
import { themes } from "@src/core/themes";

interface ComponentProps {
  data: PatientModel[];
  onSearchPress: (keyword: string) => void;
  onItemSelect: (index: PatientModel) => void;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  data: PatientModel[];
}

class PatientsComponent extends React.Component<Props, State> {
  private _keyword: string;
  constructor(props: Props) {
    super(props);

    this.state = {
      data: this.props.data
    };
  }
  componentDidMount() {}

  ListViewItemSeparator = () => {
    return (
      <View
        style={{ height: 1, width: "100%", backgroundColor: "transparent" }}
      />
    );
  };

  private onItemPress = (item: PatientModel) => {
    this.props.onItemSelect(item);
  };
  
  private onKeywordTextChange = (value: string) => {
    this._keyword = value;
  };
  private onSearchPress = () => {
    this.props.onSearchPress(this._keyword);
  };
  private renderToolbar = () => {
    const { themedStyle, ...restProps } = this.props;
    return (
      <View style={commonStyles.toolbarContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <SearchIconFill
            width={28}
            height={28}
            tintColor={themes["App Theme"]["mycolor-lightgray"]}
          />
          <TextInput
            style={{
              fontSize: 16,
              width: 220,
              borderBottomWidth: 0.5,
              borderColor: themes["App Theme"]["mycolor-lightgray"]
            }}
            value={this._keyword}
            onChangeText={this.onKeywordTextChange}
            placeholder={"请输入患者姓名"}
          />
        </View>
        <TouchableOpacity onPress={this.onSearchPress}>
          <Text style={commonStyles.toolbarText}>
            {Strings.common.str_search}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  private renderHeader = () => {
    const { themedStyle, ...restProps } = this.props;

    const header = [
      ["床号", "住院日期"],
      ["住院号", "科室"],
      ["姓名", "性别 年龄"],
      ["责任医生", "责任护士"]
    ];

    return (
      <View style={themedStyle.header}>
        {header.map((header, idx) => {
          const flexValue = 1;
          return (
            <View style={{ width: "25%" }} key={idx}>
              <View>
                <Text style={themedStyle.headerText}>{header[0]}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  private renderItem = (item, index, separators) => {
    const { themedStyle, data } = this.props;

    return (
      <PatientsOutHospitalListItem
        data={item}
        onPressItem={item => this.onItemPress(item)}
      />
    );
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    return (
      <View style={themedStyle.container}>
        {this.renderToolbar()}
        {this.state.data.length > 0 ? (
          <FlatList
            contentContainerStyle={themedStyle.contentContainer}
            data={this.state.data}
            ItemSeparatorComponent={this.ListViewItemSeparator}
            keyExtractor={(item, index) => index.toString()}
            initialNumToRender={10}
            renderItem={({ item, index, separators }) =>
              this.renderItem(item, index, separators)
            }
          />
        ) : (
          <View style={commonStyles.blankContainer} />
        )}
      </View>
    );
  }
}

export const PatientsOutHospital = withStyles(
  PatientsComponent,
  (theme: ThemeType) => ({
    container: {
      flex: 1
    },
    contentContainer: {
      paddingHorizontal: 0,
      paddingBottom: 0
    },
    toolbarButton: {
      //    borderWidth: 0.5,
      //    borderColor: "white",
      borderRadius: 10
    },
    header: {
      flexDirection: "row",
      paddingVertical: 6,
      paddingLeft: 6,
      backgroundColor: "#F0F0F0", // "#e1f4fe", //theme["background-basic-color-2"],
      justifyContent: "center",
      borderRadius: 0,
      width: "100%",
      height: GLOBAL.HEAD_BAR_2LINE_HEIGHT,
      borderBottomColor: theme["mycolor-lightgray"],
      borderBottomWidth: 5
    },
    headerText: {
      fontSize: 16,
      color: "darkgray" // theme["text-hint-color"]
    }
  })
);
