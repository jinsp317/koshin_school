import React from "react";
import { View, Dimensions, ScaledSize, Alert, ToastAndroid } from "react-native";
import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
  ModalComponentCloseProps
} from "@src/core/react-native-ui-kitten/theme";
import { Button, Text, Input, RadioGroup, Radio } from "@src/core/react-native-ui-kitten/ui";
import { textStyle, ValidationInput, MyDatePicker } from "@src/components/common";
import Strings from "@src/assets/strings";
import {
  PersonIconFill,
  CreditCardIconFill,
  DoctorIconOutline,
  PhoneIconFill
} from "@src/assets/icons";
import { StringValidator } from "@src/core/validators";
import GLOBAL from "@src/core/globals";
import * as UTILS from "@src/core/app_utils";
import { PatientFindModel, PatientModel } from "@src/core/model";
import { themes } from "@src/core/themes";
import commonStyles from "@src/containers/styles/common";
import { Gender, MANAGE_KIND } from "@src/core/model/common.model";
import { httpHelper } from "@src/core/utils/httpHelper";
import ProgressBar from "@src/components/common/progressBar.component";
import { EditInput } from "@src/components/common";
import { database } from "@src/core/utils/database";
interface ComponentProps {
  onOK: (findInfo: PatientFindModel) => void;
}
interface State {
  isLoading: boolean;
  gender: number;
  age?: number;
}

type Props = ThemedComponentProps & ComponentProps & ModalComponentCloseProps;

class MyModalComponent extends React.Component<Props, State> {
  private _patient: PatientModel = { gender: 0 };
  constructor(props) {
    super(props);
    this.state = { gender: 0, isLoading: false };
  }

  private onOK = (): void => {
    // if (GLOBAL.isOffline) {
    //   UTILS.alert(Strings.message.alert_isOffline);
    //   return;
    // }
    if (!this._patient.name) {
      UTILS.alert(Strings.message.input_patientName);
      return;
    }
    // if (!this._patient.mobile) {
    //   UTILS.alert(Strings.message.input_MobileNumber);
    //   return;
    // }
    if (!this._patient.age) {
      UTILS.alert(Strings.message.input_age);
      return;
    }
    // if (GLOBAL.isOffline) {
    //   UTILS.alert(Strings.message.alert_isOffline);
    //   return;
    // }
    this.setState({ isLoading: true });
    // let formData = new FormData();
    // formData.append("name", this._patient.name);
    // formData.append("gender", this._patient.gender);
    // formData.append("birthday", this._patient.birthday);
    // formData.append("mobile", this._patient.mobile);
    database.patientsHelper.updateData(this._patient, MANAGE_KIND.ADD).then(async (response) => {
      if (response.success) {
        this.props.onOK(this._patient);
      } else {
        UTILS.showToast(Strings.message.op_fail);
      }
      this.setState({ isLoading: false });
    }).catch(ex => {
      this.setState({ isLoading: false });
      UTILS.showToast(Strings.message.connectServer_fail, ToastAndroid.SHORT);
    });
  };
  private onNameChange = (value: string) => {
    this._patient.name = value;
  };
  private onPhoneChange = (value: string) => {
    this._patient.mobile = value;
  };
  private onSexChange = (index: number) => {
    this._patient.gender = index;
    this.setState({ gender: index });
  };
  private onAgeChange = (value: string) => {
    this._patient.age = parseInt(value);
    let date = new Date();
    date.setFullYear(date.getFullYear() - this._patient.age);
    this._patient.birthday = UTILS.getFormattedDate(date, 0);
  };
  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    if (this.state.isLoading) {
      return (
        <View style={commonStyles.progressBar}>
          <ProgressBar />
        </View>
      );
    }

    return (
      <View style={themedStyle.container}>
        <View style={themedStyle.headerContainer}>
          <Text style={themedStyle.titleLabel} category="h6">
            添加患者
          </Text>
        </View>
        <View style={{ paddingVertical: 10 }}>
          <ValidationInput
            placeholder={Strings.message.input_patientName}
            icon={PersonIconFill}
            validator={StringValidator}
            onChangeText={this.onNameChange}
            label={Strings.common.str_name}
          />
          <ValidationInput
            placeholder={Strings.message.input_MobileNumber}
            icon={PhoneIconFill}
            validator={StringValidator}
            onChangeText={this.onPhoneChange}
            label={Strings.common.str_handphone}
            keyboardType="numeric"
          />
        </View>
        <View style={themedStyle.section}>
          <View style={themedStyle.sectionCategoryPickerContent}>
            <Text style={commonStyles.sectionText}>{`${Strings.common.str_sex} :`}</Text>
            <View style={{ width: 10 }} />
            <RadioGroup
              onChange={this.onSexChange}
              selectedIndex={this.state.gender ? 1 : 0}
              style={themedStyle.radioGroup}
            >
              <Radio
                text={Strings.common.str_male}
                style={themedStyle.radioItem}
                textStyle={commonStyles.textSubtitle}
              />
              <Radio
                text={Strings.common.str_female}
                style={themedStyle.radioItem}
                textStyle={commonStyles.textSubtitle}
              />
            </RadioGroup>
          </View>
        </View>
        <View style={themedStyle.section}>
          <EditInput
            editable={this.props.kind === MANAGE_KIND.OUT ? false : true}
            style={themedStyle.profileSetting}
            placeholder={Strings.message.input_age}
            keyboardType={"numeric"}
            hint={Strings.patient.list_nianling}
            onChangeText={this.onAgeChange}
            value={this.state.age ? this.state.age.toString() : undefined}
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

export const PatientsOutHospitalAddModal = withStyles(MyModalComponent, (theme: ThemeType) => {
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
      // width: contentWidth,
      // height: contentHeight,
      borderRadius: 12,
      // top: (dimensions.height - contentHeight) / 2,
      // left: (dimensions.width - contentWidth) / 2,
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
      color: theme["text-hint-color"]
    },
    descriptionLabel: {
      marginVertical: 24,
      ...textStyle.paragraph
    },
    section: {
      padding: 0,
      borderBottomWidth: 1,
      borderBottomColor: theme["border-basic-color-2"]
    },
    sectionDatePickerContent: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingLeft: 10,
      paddingVertical: 0
    },
    sectionCategoryPickerContent: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingLeft: 10,
      paddingVertical: 8
    },
    radioGroup: {
      flexDirection: "row",
      paddingVertical: 6
    }
  };
});
