import Strings from "@src/assets/strings";
import React from "react";
import {
  View,
  Text,
  Dimensions,
  Alert,
  TouchableHighlight,
  TouchableOpacity,
  TouchableOpacityProps,
  ToastAndroid,
} from "react-native";
const { width } = Dimensions.get("window");
import {
  ThemeProvider,
  withStyles,
  ThemeType,
  ThemedComponentProps,
} from "@src/core/react-native-ui-kitten/theme";

import { PatientModel, GlucoseMonitorModel, MANAGE_KIND, ObjectModel } from "@src/core/model";
import { MyDatePicker, textStyle, ContainerView } from "@src/components/common";
import * as UTILS from "@src/core/app_utils";
import { SaveIconOutline } from "@src/assets/icons";
import { themes } from "@src/core/themes";
import CategoryPicker from "@src/components/common/categoryPicker.component";

import GLOBAL from "@src/core/globals";
import commonStyles from "../../styles/common";
import { Input, RadioGroup, Radio } from "@src/core/react-native-ui-kitten/ui";
import { EditInput } from "@src/components/common";
import ProgressBar from "@src/components/common/progressBar.component";
import { httpHelper } from "@src/core/utils/httpHelper";
import { AppSync } from "@src/core/appSync";

interface ComponentProps {
  kind: number; // 0: in, 1: modify 2: out
  onSave: (pinfo: PatientModel) => void;
  navigation: any;
  pInfo?: PatientModel;
  isLoading: boolean;
}

type Props = ThemedComponentProps & ComponentProps;
interface State {
  depart_index: number;
  sex: number;
  is_in: number;
}

class MyComponent extends React.Component<Props, State> {
  private _pInfo: PatientModel;
  constructor(props: Props) {
    super(props);
    const today = UTILS.getFormattedDate(undefined, 0);
    this._pInfo = props.pInfo
      ? props.pInfo
      : {
        gender: 0,
        birthday: "2000-01-01",
        is_in: 1,
        department_id: 1,
        in_date: today,
        out_date: today,
      };
    const depart_id = GLOBAL.curUser.is_admin === 1 ? this._pInfo.department_id : GLOBAL.curUser.department_id;
    const depart_index = UTILS.getIndexFromId(GLOBAL.totalDepartments, depart_id);

    this.state = {
      sex: this._pInfo.gender,
      is_in: this._pInfo.is_in,
      depart_index,
    };

    if (!this.props.pInfo) {
      const doctors = GLOBAL.totalDepartments[depart_index].doctors;
      const nurses = GLOBAL.totalDepartments[depart_index].nurses;
      this._pInfo.doctor_id = doctors.length > 0 ? doctors[0].id : undefined;
      this._pInfo.nurse_id = nurses.length > 0 ? nurses[0].id : undefined;
    }
  }
  componentWillReceiveProps(nextProps: Props) {
    this.updateState();
  }
  componentDidMount() {
    this.updateState();
  }
  componentWillMount() {
    this.setNavigationParams();
  }

  private setNavigationParams() {
    const onRightPress = this.onSave;
    const rightIcon = SaveIconOutline;
    let caption = Strings.patient.banliruyuan;
    if (this.props.kind == MANAGE_KIND.MODIFY) caption = Strings.patient.xiugaizhuyuan;
    else if (this.props.kind == MANAGE_KIND.OUT) caption = Strings.patient.banlichuyuan;

    this.props.navigation.setParams({
      onRightPress,
      rightIcon,
      caption,
    });
  }

  private updateState = () => { };

  private onSave = () => {
    //  if (GLOBAL.isOffline) {
    //   UTILS.showToast(Strings.message.alert_isOffline);
    //   return;
    // }
    if (!this._pInfo.name) {
      UTILS.alert(Strings.message.input_patientName);
      return;
    }
    // if (!this._pInfo.mobile) {
    //   UTILS.alert(Strings.message.input_patientMobile);
    //   return;
    // }
    if (this._pInfo.mobile.length != 11) {
      UTILS.alert(Strings.message.input_validMobile);
      return;
    }
    if (!this._pInfo.age) {
      UTILS.alert(Strings.message.input_age);
      return;
    }
    if (!this._pInfo.birthday) {
      UTILS.alert(Strings.message.input_birthday);
      return;
    }
    if (!this._pInfo.birthday) {
      UTILS.alert(Strings.message.input_birthday);
      return;
    }
    if (!this._pInfo.department_id) {
      UTILS.alert(Strings.message.input_department);
      return;
    }
    if (!this._pInfo.bed_number) {
      UTILS.alert(Strings.message.input_bedNumber);
      return;
    }
    if (!this._pInfo.patient_number) {
      UTILS.alert(Strings.message.input_patientNumber);
      return;
    }
    if (!this._pInfo.in_date) {
      UTILS.alert(Strings.message.input_inDate);
      return;
    }

    this.props.onSave(this._pInfo);
  };

  private onPatientNameChage = (value: string) => {
    this._pInfo.name = value;
  };

  private onPhoneChange = (value: string) => {
    this._pInfo.mobile = value;
  };

  private onSexChange = (index: number) => {
    this._pInfo.gender = index;
    this.setState({ sex: this._pInfo.gender });
  };
  private onAgeChange = (value: string) => {
    this._pInfo.age = parseInt(value);
    const date = new Date();
    date.setFullYear(date.getFullYear() - this._pInfo.age);
    this._pInfo.birthday = UTILS.getFormattedDate(date, 0);
  };
  private onBirthdayChange = (date: Date) => {
    this._pInfo.birthday = UTILS.getFormattedDate(date, 0);
  };

  private onIsinChange = (index: number) => {
    this._pInfo.is_in = index === 0 ? 1 : 0;
    this.setState({ is_in: this._pInfo.is_in });
  };
  private onDepartChange = (index: number) => {
    if (this.state.depart_index === index) return;
    const depart_index = index;
    this._pInfo.department_id = GLOBAL.totalDepartments[depart_index].id;
    const doctors = GLOBAL.totalDepartments[depart_index].doctors;
    const nurses = GLOBAL.totalDepartments[depart_index].nurses;
    this._pInfo.doctor_id = doctors.length > 0 ? doctors[0].id : undefined;
    this._pInfo.nurse_id = nurses.length > 0 ? nurses[0].id : undefined;

    this.setState({ depart_index });
  };
  private onDoctorChange = (index: number) => {
    const ids = UTILS.getSingleArrFromMultiArr(
      GLOBAL.totalDepartments[this.state.depart_index].doctors,
      "id",
    );
    this._pInfo.doctor_id = ids[index];
  };

  private onNurseChange = (index: number) => {
    const ids = UTILS.getSingleArrFromMultiArr(
      GLOBAL.totalDepartments[this.state.depart_index].nurses,
      "id",
    );
    this._pInfo.nurse_id = ids[index];
  };
  private onBedNumChange = (value: string) => {
    this._pInfo.bed_number = value;
  };
  private onPatientNumChange = (value: string) => {
    this._pInfo.patient_number = value;
  };

  private onInDateChange = (date: Date) => {
    this._pInfo.in_date = UTILS.getFormattedDate(date, 1);
  };
  private onOutDateChange = (date: Date) => {
    this._pInfo.out_date = UTILS.getFormattedDate(date, 1);
  };

  public render(): React.ReactNode {
    const { themedStyle } = this.props;
    let departs = GLOBAL.totalDepartments;
    if (GLOBAL.curUser.is_admin == 0) {
      departs = GLOBAL.totalDepartments.filter(_it => _it.id === GLOBAL.curUser.department_id);
    }
    if (this.props.isLoading) {
      return (
        <View style={commonStyles.progressBar}>
          <ProgressBar />
        </View>
      );
    }
    return (
      <ContainerView
        style={themedStyle.container}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode={"interactive"}
      >
        <View style={themedStyle.body}>
          <View style={themedStyle.section}>
            <EditInput
              style={themedStyle.profileSetting}
              hint={Strings.common.str_name}
              onChangeText={this.onPatientNameChage}
              value={this._pInfo.name ? this._pInfo.name : undefined}
              placeholder={Strings.message.input_patientName}
            />
          </View>
          <View style={themedStyle.section}>
            <EditInput
              style={themedStyle.profileSetting}
              hint={Strings.common.str_handphone}
              onChangeText={this.onPhoneChange}
              value={this._pInfo ? this._pInfo.mobile : undefined}
              placeholder={Strings.message.input_patientMobile}
              keyboardType={"numeric"}
            />
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.common.str_sex} :`}</Text>
              <View style={{ width: 10 }} />
              <RadioGroup
                onChange={this.onSexChange}
                selectedIndex={this.state.sex ? 1 : 0}
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
              style={themedStyle.profileSetting}
              placeholder={Strings.message.input_age}
              keyboardType={"numeric"}
              hint={Strings.patient.list_nianling}
              onChangeText={this.onAgeChange}
              value={this._pInfo.age ? this._pInfo.age.toString() : undefined}
            />
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.common.str_state} :`}</Text>
              <View style={{ width: 10 }} />
              <RadioGroup
                onChange={this.onIsinChange}
                selectedIndex={this.state.is_in === 1 || this._pInfo.is_in === undefined ? 0 : 1}
                style={themedStyle.radioGroup}
              >
                <Radio
                  text={Strings.patient.yuannei}
                  style={themedStyle.radioItem}
                  textStyle={commonStyles.textSubtitle}
                />
                <Radio
                  text={Strings.patient.yuanwai}
                  style={themedStyle.radioItem}
                  textStyle={commonStyles.textSubtitle}
                />
              </RadioGroup>
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.patient.list_keshi} :`}</Text>
              <View style={{ width: 10 }} />
              <CategoryPicker
                textColor={themes["App Theme"]["color-basic-900"]}
                options={UTILS.getSingleArrFromMultiArr(departs, "name")}
                defCategoryIndex={this.state.depart_index}
                selectCategory={(i, v) => this.onDepartChange(i)}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text
                style={commonStyles.sectionText}
              >{`${Strings.patient.list_zerenyisheng} :`}</Text>
              <View style={{ width: 10 }} />
              {GLOBAL.totalDepartments[this.state.depart_index].doctors.length > 0 && (
                <CategoryPicker
                  textColor={themes["App Theme"]["color-basic-900"]}
                  options={UTILS.getSingleArrFromMultiArr(
                    GLOBAL.totalDepartments[this.state.depart_index].doctors,
                    "name",
                  )}
                  defCategoryIndex={UTILS.getIndexFromId(
                    GLOBAL.totalDepartments[this.state.depart_index].doctors,
                    this._pInfo.doctor_id,
                  )}
                  selectCategory={(i, v) => this.onDoctorChange(i)}
                />
              )}
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionCategoryPickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.patient.list_zerenhushi} :`}</Text>
              <View style={{ width: 10 }} />
              {GLOBAL.totalDepartments[this.state.depart_index].nurses.length > 0 && (
                <CategoryPicker
                  textColor={themes["App Theme"]["color-basic-900"]}
                  options={UTILS.getSingleArrFromMultiArr(GLOBAL.totalDepartments[this.state.depart_index].nurses, "name")}
                  defCategoryIndex={UTILS.getIndexFromId(
                    GLOBAL.totalDepartments[this.state.depart_index].nurses,
                    this._pInfo.nurse_id,
                  )}
                  selectCategory={(i, v) => this.onNurseChange(i)}
                />
              )}
            </View>
          </View>
          <View style={themedStyle.section}>
            <EditInput
              style={themedStyle.profileSetting}
              placeholder={Strings.message.input_bedNumber}
              keyboardType={"numeric"}
              hint={Strings.patient.list_chuanghao}
              onChangeText={this.onBedNumChange}
              value={this._pInfo.bed_number ? this._pInfo.bed_number.toString() : undefined}
            />
          </View>
          <View style={themedStyle.section}>
            <EditInput
              style={themedStyle.profileSetting}
              placeholder={Strings.message.input_patientNumber}
              keyboardType={"numeric"}
              hint={Strings.patient.list_zhuyuanhao}
              onChangeText={this.onPatientNumChange}
              value={this._pInfo.patient_number ? this._pInfo.patient_number.toString() : undefined}
            />
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionDatePickerContent}>
              <Text
                style={commonStyles.sectionText}
              >{`${Strings.patient.list_zhuyuanriqi} :`}</Text>
              <MyDatePicker
                onDateChange={date => this.onInDateChange(date)}
                date={
                  this._pInfo.in_date
                    ? UTILS.createDate(this._pInfo.in_date)
                    : UTILS.createDate(undefined)
                }
                maxDate={new Date()}
                textColor={themes["App Theme"]["color-basic-900"]}
              />
            </View>
          </View>
          <View style={themedStyle.section}>
            <View style={themedStyle.sectionDatePickerContent}>
              <Text style={commonStyles.sectionText}>{`${Strings.patient.list_chuyuanriqi} :`}</Text>
              {this.props.kind !== MANAGE_KIND.ADD && (
                <MyDatePicker
                  disabled={true}
                  hideText={this._pInfo.out_date ? false : true}
                  onDateChange={date => this.onOutDateChange(date)}
                  date={
                    this._pInfo.out_date
                      ? UTILS.createDate(this._pInfo.out_date)
                      : UTILS.createDate(undefined)
                  }
                  maxDate={new Date()}
                  textColor={themes["App Theme"]["color-basic-900"]}
                />
              )}
            </View>
          </View>
        </View>
      </ContainerView>
    );
  }
}

interface SectionProps extends TouchableOpacityProps {
  children?: React.ReactNode;
}

const Section = (props?: SectionProps): React.ReactElement<TouchableOpacityProps> => {
  return <TouchableOpacity activeOpacity={0.65} {...props} />;
};

export const AddPatient = withStyles(MyComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    backgroundColor: theme["background-basic-color-1"],
  },
  body: {
    paddingBottom: 6,
  },
  section: {
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme["border-basic-color-2"],
  },
  sectionDatePickerContent: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 10,
    paddingVertical: 0,
  },
  sectionCategoryPickerContent: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 10,
    paddingVertical: 8,
  },
  radioGroup: {
    flexDirection: "row",
    paddingVertical: 6,
  },
}));
