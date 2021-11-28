import React from "react";
import { View, Dimensions, ScaledSize, ToastAndroid } from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Text, Input } from "@src/core/react-native-ui-kitten/ui";
import { textStyle, ValidationInput, MyDatePicker } from "@src/components/common";
import Strings from "@src/assets/strings";
import { PersonIconFill, CreditCardIconFill, BloodDropIconFill } from "@src/assets/icons";
import { StringValidator } from "@src/core/validators";
import GLOBAL from "@src/core/globals";
import { themes } from "@src/core/themes";
import * as UTILS from "@src/core/app_utils";
import commonStyles from "@src/containers/styles/common";
interface ComponentProps {
  onOK: (value: number) => void;
}

type Props = ThemedComponentProps & ComponentProps;

class MyModalComponent extends React.Component<Props> {
  private _date: Date;
  private _value: string;
  private onOK = (): void => {
    if (!this._value) {
      UTILS.showToast(Strings.message.input_measureValue);
      return;
    }
    GLOBAL.p_measureTime = UTILS.getFormattedDate(this._date, 1);
    const val = Number(this._value);
    this.props.onOK(UTILS.glucoseConvMgNum(val));
  };
  private onValueInputTextChange = (value: string) => {
    this._value = value;
  };
  private onMonitorDateChange = (date: Date) => {
    this._date = date;
  };

  public render(): React.ReactNode {
    const { themedStyle } = this.props;

    return (
      <View style={themedStyle.container}>
        <View style={themedStyle.headerContainer}>
          <Text style={themedStyle.titleLabel} category="h6">
            手动测量
          </Text>
        </View>
        <View style={{ paddingVertical: 10 }}>
          <View style={themedStyle.sectionDatePickerContent}>
            <Text style={commonStyles.sectionText}>{`${Strings.menu.task_measureTime} : `}</Text>

            <MyDatePicker
              onDateChange={date => this.onMonitorDateChange(date)}
              maxDate={new Date()}
              textColor={themes["App Theme"]["color-basic-900"]}
              format="YYYY-MM-DD HH:mm:ss"
              mode="datetime"
            />
          </View>
          <ValidationInput
            textStyle={{ fontSize: 20 }}
            placeholder={Strings.message.input_measureValue}
            icon={BloodDropIconFill}
            validator={StringValidator}
            onChangeText={this.onValueInputTextChange}
            label={Strings.common.str_glucoseVal}
            labelStyle={{ fontSize: 16 }}
            keyboardType={"numeric"}
          />
        </View>
        <Button
          textStyle={textStyle.button}
          appearance="ghost"
          size="large"
          onPress={this.onOK}
          style={{ borderWidth: 0.5 }}
        >
          {Strings.common.str_ok}
        </Button>
      </View>
    );
  }
}

export const GlucoseManualInputModal = withStyles(MyModalComponent, (theme: ThemeType) => {
  const dimensions: ScaledSize = Dimensions.get("window");
  const contentWidth: number = dimensions.width - 24;
  const contentHeight: number = 192;

  return {
    container: {
      borderWidth: 1,
      borderColor: theme["color-primary-500"],
      zIndex: 1,
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 10,
      width: contentWidth,
      // height: contentHeight,
      borderRadius: 12,
      top: 160, // (dimensions.height - contentHeight) / 2,
      left: (dimensions.width - contentWidth) / 2,
      backgroundColor: theme["mycolor-background"]
    },
    headerContainer: {
      alignItems: "center",
      justifyContent: "center",
      borderBottomWidth: 1,

      borderColor: theme["color-primary-500"],
      padding: 10
    },
    titleLabel: {
      ...textStyle.headline,
      color: theme["color-primary-500"]
    },
    descriptionLabel: {
      marginVertical: 24,
      ...textStyle.paragraph
    },
    sectionDatePickerContent: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingLeft: 0,
      paddingVertical: 0
    }
  };
});
