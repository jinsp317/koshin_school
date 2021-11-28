import Strings from "@src/assets/strings";
import React from "react";
import { View, TouchableOpacity, TouchableOpacityProps } from "react-native";
import {
  ThemeType,
  withStyles,
  ThemedComponentProps
} from "@src/core/react-native-ui-kitten/theme";
import {
  Toggle,
  Text,
  Button,
  CheckBox
} from "@src/core/react-native-ui-kitten/ui";
import { ContainerView, textStyle } from "@src/components/common";
import { ProfileSetting } from "@src/components/social";
import GLOBAL from "@src/core/globals";
import commonStyles from "@src/containers/styles/common";
import MultiSelect from "../../../lib/react-native-multiselect/MultiSelect";
import { asyncStorageHelper } from "@src/core/utils/storageHelper";

interface ComponentProps {}
interface State {
  selectedItemIds: string[];
}
export type Props = ThemedComponentProps & ComponentProps;

class MyComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedItemIds: this.getSelectedIds()
    };
  }
  private updateListOfSelectedThings = selectedRow => {
    if (!selectedRow.valid) return;

    GLOBAL.portalItems.forEach(item => {
      if (item.id === Number(selectedRow.key)) {
        item.disabled = !item.disabled;
      }
    });

    this.setState({ selectedItemIds: this.getSelectedIds() });
    asyncStorageHelper.setPortalItems();
  };
  private getSelectedIds = () => {
    return GLOBAL.portalItems
      .map(e => {
        return e.disabled ? null : e.id.toString();
      })
      .filter(thing => thing);
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <ContainerView style={themedStyle.container}>
        <MultiSelect
          options={GLOBAL.portalItems.map(thing => ({
            key: thing.id.toString(),
            name: thing.text,
            valid: thing.valid
          }))}
          renderRow={(row, isSelected) => (
            <View style={{ padding: 10 }}>
              <CheckBox
                disabled={!row.valid}
                checked={isSelected}
                text={row.name}
                textStyle={commonStyles.sectionText}
                onChange={(e, b) => this.updateListOfSelectedThings(row)}
              />
            </View>
          )}
          onSelectionChange={(selectedRow, allSelectedRows) =>
            this.updateListOfSelectedThings(selectedRow)
          }
          selectedOptions={this.state.selectedItemIds}
          rowStyle={{ backgroundColor: "whtie" }}
        />
      </ContainerView>
    );
  }
}

export const CurstomPortalMenu = withStyles(
  MyComponent,
  (theme: ThemeType) => ({
    container: {
      flex: 1,
      backgroundColor: theme["background-basic-color-1"],
      padding: 10
    },
    textParagraph: {
      ...commonStyles.textParagraph,
      marginTop: 6
    },
    sectionContainer: {
      marginVertical: 6
    }
  })
);
