import React from "react";
import { View, Dimensions, ScaledSize, TouchableOpacity, FlatList } from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  ModalComponentCloseProps
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Text, Input } from "@src/core/react-native-ui-kitten/ui";
import { textStyle, ValidationInput } from "@src/components/common";
import Strings from "@src/assets/strings";
import {
  PersonIconFill,
  CreditCardIconFill,
  DoctorIconOutline,
  StarIconFill,
  LoginIconOutline,
  LoginoutOutline,
  EditIconOutline,
  TrashIconOutline
} from "@src/assets/icons";
import { StringValidator } from "@src/core/validators";
import GLOBAL from "@src/core/globals";
import { PatientFindModel, HospitalModel } from "@src/core/model";
import commonStyles from "@src/containers/styles/common";
import { themes } from "@src/core/themes";

interface ComponentProps {
  onOK: (bUpdate: boolean) => void;
}

type Props = ThemedComponentProps & ComponentProps; // & ModalComponentCloseProps;

class MyModalComponent extends React.Component<Props> {
  onOK = (bUpdate: boolean) => {
    this.props.onOK(bUpdate);
  };
  _keyExtractor = (item, index) => index.toString();
  _renderItem = ({ item, index }) => {
    const textColor =
      item.id === GLOBAL.curHospitalId ? themes["App Theme"]["color-primary-500"] : "#ccc";
    return (
      <TouchableOpacity
        onPress={() => {
          const bUpdate = GLOBAL.curHospitalId === item.id ? false : true;
          GLOBAL.curHospitalId = item.id;
          this.onOK(bUpdate);
        }}
      >
        <View style={{ paddingVertical: 10, flexDirection: "row" }}>
          <Text style={[commonStyles.textMain, { color: textColor }]}>{`${item.name} ${
            item.id === GLOBAL.curUser.hospital_id ? " (所属医院)" : ""
          }`}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  ListViewItemSeparator = () => {
    return <View style={{ height: 1, width: "100%", backgroundColor: "#ccc" }} />;
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <View style={themedStyle.container}>
        <View style={themedStyle.headerContainer}>
          <Text style={themedStyle.titleLabel} category="h6">
            医院
          </Text>
        </View>
        <View style={{ paddingTop: 5, width: "100%" }}>
          <FlatList
            contentContainerStyle={{ padding: 20, marginBottom: 0 }}
            keyExtractor={this._keyExtractor}
            ItemSeparatorComponent={this.ListViewItemSeparator}
            data={[
              {
                id: GLOBAL.curUser.hospital_id,
                name: GLOBAL.curUser.hospital_name
              },
              ...GLOBAL.curUser.relatedHospitals
            ]}
            renderItem={this._renderItem}
          />
        </View>
      </View>
    );
  }
}

export const HospitalSelectModal = withStyles(MyModalComponent, (theme: ThemeType) => {
  const dimensions: ScaledSize = Dimensions.get("window");
  const contentWidth: number = dimensions.width - 100; // - 24;
  const contentHeight: number = 300;

  return {
    container: {
      alignItems: "center",
      borderWidth: 0,
      borderColor: theme["color-primary-500"],
      zIndex: 1,
      // justifyContent: "space-between",
      width: contentWidth,
      // height: contentHeight,
      borderRadius: 0,
      // top: (dimensions.height - contentHeight) / 2,
      // left: (dimensions.width - contentWidth) / 2,
      backgroundColor: theme["mycolor-background"]
    },
    headerContainer: {
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 0,
      width: "100%",
      backgroundColor: theme["mycolor-lightgray"],
      padding: 20
    },
    titleLabel: {
      ...textStyle.headline,
      color: theme["color-warning-500"]
    },
    descriptionLabel: {
      ...textStyle.paragraph
    }
  };
});
