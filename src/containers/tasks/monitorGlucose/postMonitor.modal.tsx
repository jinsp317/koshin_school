import React from "react";
import { View, Dimensions, ScaledSize, NodeHandle } from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  ModalComponentCloseProps
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Text, Input } from "@src/core/react-native-ui-kitten/ui";
import { textStyle, ValidationInput } from "@src/components/common";
import Strings from "@src/assets/strings";
import { PersonIconFill, CreditCardIconFill, DoctorIconOutline } from "@src/assets/icons";
import { StringValidator } from "@src/core/validators";
import GLOBAL from "@src/core/globals";
import { PatientFindModel } from "@src/core/model";
import { NoticeModel } from "@src/core/model/notice.model";
import CategoryPicker from "@src/components/common/categoryPicker.component";
import * as UTILS from "@src/core/app_utils";

interface ComponentProps {
  onOK: (notice1: NoticeModel, notice2: NoticeModel) => void;
  onCancel: () => void;
  kind: number;
}

type Props = ThemedComponentProps & ComponentProps & ModalComponentCloseProps;

class MyModalComponent extends React.Component<Props> {
  private _afterTime1: number;
  private _afterTime2: number;
  constructor(props: Props) {
    super(props);
    this._afterTime1 = 1;
    this._afterTime2 = 0;
  }

  private onOK = (): void => {
    let notice1: NoticeModel;
    let notice2: NoticeModel;
    if (this._afterTime1 > 0) {
      notice1 = { type: 1, id: 0, patient_id: 0 };
      notice1.date = UTILS.getFormattedDate(undefined, 0);
      const addMinutes = this._afterTime1 * 5;
      notice1.notice = UTILS.getFormattedDate(UTILS.modifyDate(undefined, addMinutes, true, 3), 1);
    }
    if (this._afterTime2 > 0) {
      notice2 = { type: 2, id: 0, patient_id: 0 };
      notice2.date = UTILS.getFormattedDate(undefined, 0);
      const addMinutes = this._afterTime2 * 30;
      notice2.notice = UTILS.getFormattedDate(UTILS.modifyDate(undefined, addMinutes, true, 3), 1);
    }
    this.props.onOK(notice1, notice2);
  };

  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <View style={themedStyle.container}>
        <View style={themedStyle.headerContainer}>
          <Text style={themedStyle.titleLabel} category="h6">
            {this.props.kind === 0 ? "低血糖措施" : "高血糖措施"}
          </Text>
        </View>
        <View style={{ paddingVertical: 10 }}>
          <View style={themedStyle.row}>
            <Text style={themedStyle.warningLabel}>{"是否需要设定时间进行复测"}</Text>
          </View>
          <View style={themedStyle.row}>
            <Text style={themedStyle.rowLabel}>{"重测 1 :  "}</Text>
            <CategoryPicker
              options={GLOBAL.REMONITOR_A}
              defCategoryIndex={this._afterTime1}
              selectCategory={(i, v) => {
                this._afterTime1 = i;
              }}
            />
          </View>
          <View style={themedStyle.row}>
            <Text style={themedStyle.rowLabel}>{"重测 2 :  "}</Text>
            <CategoryPicker
              options={GLOBAL.REMONITOR_B}
              defCategoryIndex={this._afterTime2}
              selectCategory={(i, v) => {
                this._afterTime2 = i;
              }}
            />
          </View>
        </View>
        <View style={themedStyle.row}>
          <Button textStyle={textStyle.button}
            // appearance="ghost"
            size="large"
            onPress={this.onOK}
            style={{ flex: 1, borderWidth: 0.5, marginHorizontal: 20 }}
          >
            {`${Strings.common.str_ok}`}
          </Button>
          <Button textStyle={textStyle.button}
            // appearance="ghost"
            size="large"
            onPress={this.props.onCancel}
            style={{ flex: 1, borderWidth: 0.5, marginHorizontal: 20 }}
          >
            {`${Strings.common.str_cancel}`}
          </Button>
        </View>
      </View>
    );
  }
}

export const PostMonitorModal = withStyles(MyModalComponent, (theme: ThemeType) => {
  const dimensions: ScaledSize = Dimensions.get("window");
  const contentWidth: number = dimensions.width - 24;
  const contentHeight: number = 192;

  return {
    container: {
      borderWidth: 0,
      borderColor: theme["color-primary-500"],
      zIndex: 1,
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: theme["mycolor-background"]
    },
    headerContainer: {
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 1,

      borderColor: theme["mycolor-lightgray"],
      padding: 10
    },
    titleLabel: {
      ...textStyle.headline,
      color: theme["#ccc"]
    },
    warningLabel: {
      ...textStyle.headline,
      color: theme["color-warning-500"]
    },
    rowLabel: {
      ...textStyle.subtitle,
      fontSize: 20,
      lineHeight: 22,

      color: theme["#ccc"]
    },
    descriptionLabel: {
      marginVertical: 24,
      ...textStyle.paragraph
    },
    row: {
      flexDirection: "row",
      paddingVertical: 10,
      justifyContent: "center",
      alignItems: "center"
    }
  };
});
